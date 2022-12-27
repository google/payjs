/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Constants} from './constants.js';
import {PaymentsClientDelegateInterface} from './payments_client_delegate_interface.js';
import {PaymentsRequestDelegate} from './payments_request_delegate.js';
import {PaymentsWebActivityDelegate} from './payments_web_activity_delegate.js';
import {ActivityPorts} from '../third_party/web_activities/activity-ports.js';
import {BuyFlowActivityMode, BuyFlowActivityReason, BuyFlowMode, PayFrameHelper, PostMessageEventType, PublicErrorCode} from './pay_frame_helper.js';
import {apiV2DoesMerchantSupportSpecifiedCardType, doesMerchantSupportOnlyTokenizedCards, validateCallbackParameters, validateIsReadyToPayRequest, validatePaymentDataRequest, validatePaymentsClientOptions, validateSecureContext} from './validator.js';
import {createButtonHelper} from './button.js';
import {createGoogleTransactionId, logDevErrorToConsole} from './utils.js';

const TRUSTED_DOMAINS = [
  'actions.google.com',
  'amp-actions.sandbox.google.com',
  'amp-actions-staging.sandbox.google.com',
  'amp-actions-autopush.sandbox.google.com',
  'payments.developers.google.com',
  'payments.google.com',
];

/**
 * The client for interacting with the Google Payment APIs.
 * <p>
 * The async refers to the fact that this client supports redirects
 * when using webactivties.
 * <p>
 * If you are using this be sure that this is what you want.
 * <p>
 * In almost all cases PaymentsClient is the better client to use because
 * it exposes a promises based api which is easier to deal with.
 * @final
 */
class PaymentsAsyncClient {
  /**
   * @param {!PaymentsClientOptions} paymentsClientOptions
   * @param {function(!Promise<!PaymentData>)} onPaymentResponse
   * @param {boolean=} opt_useIframe
   * @param {!ActivityPorts=} opt_activities Can be used to provide a shared
   *   activities manager. By default, the new manager is created.
   */
  constructor(
      paymentsClientOptions, onPaymentResponse, opt_useIframe, opt_activities) {
    this.onPaymentResponse_ = onPaymentResponse;

    validatePaymentsClientOptions(paymentsClientOptions);

    /** @private {?number} */
    this.loadPaymentDataApiStartTimeMs_ = null;

    /** @private @const {string} */
    this.environment_ =
        paymentsClientOptions.environment || Constants.Environment.TEST;
    if (!PaymentsAsyncClient.googleTransactionId_) {
      PaymentsAsyncClient.googleTransactionId_ =
          /** @type {string} */ (
              (this.isInTrustedDomain_() && paymentsClientOptions.i &&
               paymentsClientOptions.i.googleTransactionId) ?
                  paymentsClientOptions.i.googleTransactionId :
                  createGoogleTransactionId(this.environment_));
    }

    /** @private @const {!PaymentsClientOptions} */
    this.paymentsClientOptions_ = paymentsClientOptions;

    /** @private {string} */
    this.currentMerchantId_ = paymentsClientOptions.merchantInfo &&
            paymentsClientOptions.merchantInfo.merchantId ?
        paymentsClientOptions.merchantInfo.merchantId :
        '';

    if (paymentsClientOptions.paymentDataCallback) {
      paymentsClientOptions.paymentDataCallbacks = {
        onPaymentDataChanged: paymentsClientOptions.paymentDataCallback
      };
    }
    /** @private {?PaymentDataCallbacks} */
    this.paymentDataCallbacks_ = null;

    /** @private @const {!ActivityModeSelector} */
    this.activityModeSelector_ =
        new ActivityModeSelector(paymentsClientOptions, opt_useIframe);

    /** @private @const {!PaymentsClientDelegateInterface} */
    this.webActivityDelegate_ = new PaymentsWebActivityDelegate(
        this.environment_, PaymentsAsyncClient.googleTransactionId_,
        opt_useIframe, opt_activities,
        paymentsClientOptions.i && paymentsClientOptions.i.redirectKey);

    /** @private {number} */
    this.buyFlowMode_ = BuyFlowMode.PAY_WITH_GOOGLE;

    /** @private {?ButtonInfo} */
    this.buttonInfo_ = null;

    const activityMode = this.activityModeSelector_.mode;
    /** @private @const {?PaymentsClientDelegateInterface} */
    this.delegate_ = (activityMode === BuyFlowActivityMode.PAYMENT_HANDLER ||
                      activityMode === BuyFlowActivityMode.ANDROID_NATIVE) ?
        new PaymentsRequestDelegate(this.environment_) :
        this.webActivityDelegate_;

    if (paymentsClientOptions.paymentDataCallbacks) {
      this.paymentDataCallbacks_ = paymentsClientOptions.paymentDataCallbacks;
      this.delegate_.registerPaymentDataCallbacks(
          paymentsClientOptions.paymentDataCallbacks);
      // Though this.delegate_ can be intialized with PaymentsRequestDelegate,
      // we may fallback to use this.webActivityDelegate_ later.
      this.webActivityDelegate_.registerPaymentDataCallbacks(
          paymentsClientOptions.paymentDataCallbacks);
    }

    this.webActivityDelegate_.onResult(this.onResult_.bind(this));
    this.delegate_.onResult(this.onResult_.bind(this));

    // If web delegate is used anyway then this is overridden in the web
    // activity delegate when load payment data is called.
    PayFrameHelper.setBuyFlowActivityMode(activityMode);

    PayFrameHelper.setGoogleTransactionId(
        PaymentsAsyncClient.googleTransactionId_);
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_INITIALIZE_PAYMENTS_CLIENT,
      'clientLatencyStartMs': Date.now(),
      'buyFlowActivityReason': this.activityModeSelector_.reasons,
      'softwareInfo': this.getSoftwareInfo_(),
    });

    window.addEventListener(
        'message', event => this.handleMessageEvent_(event));
  }

  /**
   * Creates a promise chain that resolves to the user's ability to make a
   * nominal payment using the PaymentHandler API. Note that the PaymentHandler
   * API is not supported by all browsers (e.g., Firefox); if the API is
   * unavailable, the chain immediately resolves to false.
   */
  static canMakePayment() {
    try {
      PaymentsAsyncClient.canMakePaymentPayJsPromise_ =
          new PaymentRequest(
              [{
                'supportedMethods': ['https://google.com/pay'],
                'data': {
                  'apiVersion': 2,
                  'apiVersionMinor': 0,
                  'allowedPaymentMethods': [{
                    'type': 'CARD',
                    'parameters': {
                      'allowedAuthMethods': ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                      'allowedCardNetworks': ['VISA', 'MASTERCARD'],
                    },
                  }],
                }
              }],
              {
                'total': {
                  'label': 'Estimated Total Price',
                  'amount': {'currency': 'USD', 'value': '10'}
                }
              })
              .canMakePayment();
    } catch (e) {
      PaymentsAsyncClient.canMakePaymentPayJsPromise_ = Promise.resolve(false);
    }

    PaymentsAsyncClient.canMakePaymentPayJsPromise_
        .then(result => PaymentsAsyncClient.canMakePaymentPayJsResult_ = result)
        .catch(() => PaymentsAsyncClient.canMakePaymentPayJsResult_ = false);
  }

  /**
   * Get softwareinfo if exists.
   *
   * @return {?SoftwareInfo}
   * @private
   */
  getSoftwareInfo_() {
    return this.paymentsClientOptions_.merchantInfo &&
            this.paymentsClientOptions_.merchantInfo.softwareInfo ?
        this.paymentsClientOptions_.merchantInfo.softwareInfo :
        null;
  }

  /**
   * Check whether the user can make payments using the Payment API.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @export
   */
  isReadyToPay(isReadyToPayRequest) {
    // Merge with paymentsClientOptions, preferring values from
    // isReadyToPayRequest
    if (isReadyToPayRequest) {
      // Filter the keys can be merged in IsReadyToPayRequest.
      const /** !PaymentsClientOptions */ filteredPaymentOption = {};
      if (this.paymentsClientOptions_.environment) {
        filteredPaymentOption.environment =
            this.paymentsClientOptions_.environment;
      }
      if (this.paymentsClientOptions_.merchantInfo) {
        filteredPaymentOption.merchantInfo =
            this.paymentsClientOptions_.merchantInfo;
      }
      if (this.paymentsClientOptions_.i) {
        filteredPaymentOption.i = this.paymentsClientOptions_.i;
      }
      isReadyToPayRequest =
          Object.assign({}, filteredPaymentOption, isReadyToPayRequest);
      this.currentMerchantId_ = isReadyToPayRequest.merchantInfo &&
              isReadyToPayRequest.merchantInfo.merchantId ?
          isReadyToPayRequest.merchantInfo.merchantId :
          '';
    }
    const startTimeMs = Date.now();
    const originalActivityReasons = [...this.activityModeSelector_.reasons];
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_CALLED,
      'clientLatencyStartMs': startTimeMs,
      'buyFlowActivityReason': originalActivityReasons,
      'softwareInfo': this.getSoftwareInfo_(),
    });
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validateIsReadyToPayRequest(isReadyToPayRequest);
    if (errorMessage) {
      return new Promise((resolve, reject) => {
        logDevErrorToConsole({
          apiName: 'isReadyToPay',
          errorMessage: errorMessage,
        });
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
          'buyFlowActivityReason': originalActivityReasons,
          'error': PublicErrorCode.DEVELOPER_ERROR,
          'softwareInfo': this.getSoftwareInfo_(),
        });
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      });
    }

    // Make a copy of activity reasons to be muted later.
    const activityReasons = [...this.activityModeSelector_.reasons];
    const isReadyToPayPromise =
        this.innerIsReadyToPay(isReadyToPayRequest, activityReasons);
    if (isReadyToPayRequest['activityModeRequired']) {
      let canMakePaymentResponse = null;
      return PaymentsAsyncClient.canMakePaymentPayJsPromise_
          .then(
              (result) => {
                canMakePaymentResponse = result;
                return isReadyToPayPromise;
              },
              () => {
                canMakePaymentResponse = false;
                return isReadyToPayPromise;
              })
          .then((isReadyToPayResponse) => {
            if (!canMakePaymentResponse) {
              activityReasons.push(
                  BuyFlowActivityReason.PAYJS_CAN_MAKE_PAYMENT_FALSE);
              if (this.activityModeSelector_.mode ===
                  BuyFlowActivityMode.PAYMENT_HANDLER) {
                this.activityModeSelector_.mode = BuyFlowActivityMode.POPUP;
              }
            }
            isReadyToPayResponse['activityMode'] =
                this.activityModeSelector_.mode;
            this.logIsReadyToPayResponse_(
                startTimeMs, isReadyToPayResponse, activityReasons,
                isReadyToPayRequest);
            return isReadyToPayResponse;
          })
          .catch((err) => {
            this.logIsReadyToPayError_(
                err, activityReasons, isReadyToPayRequest);
            throw err;
          });
    }

    return isReadyToPayPromise
        .then(response => {
          this.logIsReadyToPayResponse_(
              startTimeMs, response, activityReasons, isReadyToPayRequest);
          return response;
        })
        .catch(err => {
          this.logIsReadyToPayError_(err, activityReasons, isReadyToPayRequest);
          throw err;
        });
  }

  logIsReadyToPayResponse_(
      startTimeMs, response, activityReasons, isReadyToPayRequest) {
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
      'clientLatencyStartMs': startTimeMs,
      'isReadyToPayApiResponse': response,
      'buyFlowActivityReason': activityReasons,
      'softwareInfo': this.getSoftwareInfo_(),
      'isReadyToPayRequest': isReadyToPayRequest,
    });
  }

  logIsReadyToPayError_(err, activityReasons, isReadyToPayRequest) {
    const statusCode = err['statusCode'] ?
        PayFrameHelper.toPublicErrorCode(err['statusCode']) :
        PublicErrorCode.INTERNAL_ERROR;
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_IS_READY_TO_PAY_API,
      'buyFlowActivityReason': activityReasons,
      'error': statusCode,
      'softwareInfo': this.getSoftwareInfo_(),
      'isReadyToPayRequest': isReadyToPayRequest,
    });
  }

  /**
   * Actual implementation of isReadyToPay in an inner method so that
   * we can add callbacks to the promise to measure latencies. The function is
   * visible to test.
   *
   * @protected
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @param {!Array<!BuyFlowActivityReason>} activityReasons
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   */
  innerIsReadyToPay(isReadyToPayRequest, activityReasons) {
    const checkNativeReadyToPay =
        null ?
        (this.activityModeSelector_.mode ===
             BuyFlowActivityMode.ANDROID_NATIVE &&
         !ActivityModeSelector.isNativeDisabledInRequest(isReadyToPayRequest)) :
        (this.activityModeSelector_.supportPaymentRequest &&
         !ActivityModeSelector.isNativeDisabledInRequest(isReadyToPayRequest));
    if (checkNativeReadyToPay) {
      if (isReadyToPayRequest.apiVersion >= 2) {
        return this.isReadyToPayApiV2ForChromePaymentRequest_(
            isReadyToPayRequest, activityReasons);
      } else {
        // This is the apiVersion 1 branch.
        // If the merchant supports only Tokenized cards then just rely on
        // delegate to give us the result.
        // This will need to change once b/78519188 is fixed.
        const webPromise =
            this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest);
        const nativePromise = this.delegate_.isReadyToPay(isReadyToPayRequest);
        if (doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) &&
            !this.activityModeSelector_.supportPaymentHandler) {
          activityReasons.push(BuyFlowActivityReason.V1_ONLY_TOKENIZED);
          return nativePromise;
        }
        // Return webIsReadyToPay only if delegateIsReadyToPay has been
        // executed.
        activityReasons.push(BuyFlowActivityReason.V1);
        return nativePromise.then(() => webPromise);
      }
    }
    const webPromise =
        this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest);
    return webPromise;
  }

  /**
   * Handle is ready to pay for api v2.
   *
   * @param {!IsReadyToPayRequest} isReadyToPayRequest
   * @param {!Array<!BuyFlowActivityReason>} activityReasons
   * @return {!Promise} The promise will contain the boolean result and error
   *     message when possible.
   * @private
   */
  isReadyToPayApiV2ForChromePaymentRequest_(
      isReadyToPayRequest, activityReasons) {
    let defaultPromise = Promise.resolve({'result': false});
    if (isReadyToPayRequest.existingPaymentMethodRequired) {
      defaultPromise =
          Promise.resolve({'result': false, 'paymentMethodPresent': false});
    }

    let nativePromise = defaultPromise;
    if (apiV2DoesMerchantSupportSpecifiedCardType(
            isReadyToPayRequest, Constants.AuthMethod.CRYPTOGRAM_3DS)) {
      // If the merchant supports tokenized cards.
      // Make a separate call to gms core to check if the user isReadyToPay
      // with just tokenized cards. We can't pass in PAN_ONLY here
      // because gms core always returns true for PAN_ONLY.
      // Leave other payment methods as is.
      const nativeRtpRequest = /** @type {!IsReadyToPayRequest} */
          (JSON.parse(JSON.stringify(isReadyToPayRequest)));
      for (var i = 0; i < nativeRtpRequest.allowedPaymentMethods.length; i++) {
        if (nativeRtpRequest.allowedPaymentMethods[i].type ==
            Constants.PaymentMethod.CARD) {
          nativeRtpRequest.allowedPaymentMethods[i]
              .parameters['allowedAuthMethods'] =
              [Constants.AuthMethod.CRYPTOGRAM_3DS];
        }
      }

      activityReasons.push(BuyFlowActivityReason.V2_3DS);
      nativePromise = this.delegate_.isReadyToPay(nativeRtpRequest);
    }

    let webPromise = defaultPromise;
    if (apiV2DoesMerchantSupportSpecifiedCardType(
            isReadyToPayRequest, Constants.AuthMethod.PAN_ONLY)) {
      activityReasons.push(BuyFlowActivityReason.V2_PAN_ONLY);
      webPromise = this.webActivityDelegate_.isReadyToPay(isReadyToPayRequest);
    }

    // Update session storage with payment handler canMakePayment result but
    // rely on web delegate for actual response
    // TODO: remove the logic to add FALL_THROUGH as a reason
    // after DisableNativeReadyToPayCheckForPaymentHandler is rolled out to
    // prod.
    if (this.activityModeSelector_.supportPaymentHandler) {
      activityReasons.push(BuyFlowActivityReason.FALL_THROUGH);
      return nativePromise.then(() => webPromise);
    }
    return nativePromise.then(nativeResult => {
      if ((nativeResult && nativeResult['result']) == true) {
        return nativeResult;
      }
      return webPromise;
    });
  }

  /**
   * Prefetch paymentData to speed up loadPaymentData call. Note the provided
   * paymentDataRequest should exactly be the same as provided in
   * loadPaymentData to make the loadPaymentData call fast since current
   * web flow prefetching is based on the full request parameters.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  prefetchPaymentData(paymentDataRequest) {
    /** @type {?string} */
    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    if (errorMessage) {
      logDevErrorToConsole({
        apiName: 'prefetchPaymentData',
        errorMessage: errorMessage,
      });
      return;
    }
    this.assignInternalParams_(paymentDataRequest);
    if (this.activityModeSelector_.supportPaymentRequest &&
        !ActivityModeSelector.isNativeDisabledInRequest(paymentDataRequest)) {
      this.delegate_.prefetchPaymentData(paymentDataRequest);
    } else {
      // For non chrome supports always use the hosting page.
      this.webActivityDelegate_.prefetchPaymentData(paymentDataRequest);
    }
  }

  /**
   * Notifies Google that some offers may be available for the user if they
   * choose to pay with Google Pay. This can be called anywhere on the merchant
   * site. Google can choose to display a notification banner to inform
   * user of the offer.
   *
   * @param {!PreNotificationOfferDetails} preNotificationOfferDetails Details
   *     for the offer pre-notification.
   * @export
   */
  notifyAvailableOffers(preNotificationOfferDetails) {
    return;
  }

  /**
   * Request PaymentData, which contains necessary infomartion to complete a
   * payment.
   *
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @export
   */
  loadPaymentData(paymentDataRequest) {
    // Make a copy of reasons just for this session.
    const reasons = [...this.activityModeSelector_.reasons];
    const postBeforeExit = () => PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_BUTTON_CLICK,
      'buyFlowActivityReason':
          (reasons.length ? reasons : [BuyFlowActivityReason.FALL_THROUGH]),
      'softwareInfo': this.getSoftwareInfo_(),
      'buttonInfo': this.buttonInfo_,
    });

    const errorMessage = validateSecureContext() ||
        validatePaymentDataRequest(paymentDataRequest);
    this.buyFlowMode_ = paymentDataRequest && paymentDataRequest.swg ?
        BuyFlowMode.SUBSCRIBE_WITH_GOOGLE :
        BuyFlowMode.PAY_WITH_GOOGLE;
    // Due to some merchant instantiating multiple paymentClients, which may
    // override PayFrameHelper.BuyflowActivityMode, we need to
    // keep PayFrameHelper.buyflowActivityMode consistent with
    // this.activityModeSelector_.mode here for correct logging.
    PayFrameHelper.setBuyFlowActivityMode(this.activityModeSelector_.mode);
    if (errorMessage) {
      this.onPaymentResponse_(new Promise((resolve, reject) => {
        PayFrameHelper.postMessage({
          'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
          'error': PublicErrorCode.DEVELOPER_ERROR,
          'buyFlowMode': this.buyFlowMode_,
          'softwareInfo': this.getSoftwareInfo_(),
          'buttonInfo': this.buttonInfo_,
        });
        logDevErrorToConsole({
          apiName: 'loadPaymentData',
          errorMessage: errorMessage,
        });
        reject({
          'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
          'statusMessage': errorMessage
        });
      }));
      postBeforeExit();
      return;
    }
    if (this.paymentDataCallbacks_ || paymentDataRequest.callbackIntents) {
      const errorMessage = validateCallbackParameters(
          paymentDataRequest, this.paymentDataCallbacks_);
      if (errorMessage) {
        this.onPaymentResponse_(new Promise((resolve, reject) => {
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'error': PublicErrorCode.DEVELOPER_ERROR,
            'buyFlowMode': this.buyFlowMode_,
            'softwareInfo': this.getSoftwareInfo_(),
            'buttonInfo': this.buttonInfo_,
          });
          logDevErrorToConsole({
            apiName: 'loadPaymentData',
            errorMessage: errorMessage,
          });
          reject({
            'statusCode': Constants.ResponseStatus.DEVELOPER_ERROR,
            'statusMessage': errorMessage
          });
        }));
        postBeforeExit();
        return;
      }
    }

    this.loadPaymentDataApiStartTimeMs_ = Date.now();

    const newMode = this.activityModeSelector_.getModePerPaymentDataRequest(
        paymentDataRequest, reasons);

    const delegate = (newMode === BuyFlowActivityMode.PAYMENT_HANDLER ||
                      newMode === BuyFlowActivityMode.ANDROID_NATIVE) ?
        this.delegate_ :
        this.webActivityDelegate_;

    if (newMode !== this.activityModeSelector_.mode) {
      // TODO: POPUP mode can be overwritten to REDIRECT or IFRAME in
      // WebActivityDelegate, causing metric inacurrancy.  Address it in follow
      // up CLs to move more logic into ActivityModeSelector.
      PayFrameHelper.setBuyFlowActivityMode(newMode);
    }
    this.assignInternalParams_(paymentDataRequest);
    postBeforeExit();
    delegate.loadPaymentData(paymentDataRequest);
  }

  /**
   * Return a <div> element containing a Google Pay payment button.
   *
   * @param {!ButtonOptions=} options
   * @return {!Element}
   * @export
   */
  createButton(options = {}) {
    this.buttonInfo_ = PayFrameHelper.getButtonInfoFromButtonOptions(options);
    const button = createButtonHelper(options, this.currentMerchantId_);
    // Only log if button was created successfully
    const startTimeMs = Date.now();
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_RENDER_BUTTON,
      'clientLatencyStartMs': startTimeMs,
      'buyFlowActivityReason': this.activityModeSelector_.reasons,
      'softwareInfo': this.getSoftwareInfo_(),
      'buttonInfo': this.buttonInfo_,
    });
    return button;
  }

  /**
   * @param {!Event} e postMessage event from the AMP page.
   * @private
   */
  handleMessageEvent_(e) {
    if (this.isInTrustedDomain_()) {
      // Only handles the event right now if loaded in trusted domain.
      if (e.data['name'] === 'logPaymentData') {
        PayFrameHelper.postMessage(e.data['data']);
      }
    }
  }

  /**
   * @private
   * @return {boolean}
   */
  isInTrustedDomain_() {
    return TRUSTED_DOMAINS.indexOf(window.location.hostname) != -1;
  }

  /**
   * Called when load payment data result is returned. This triggers the payment
   * response callback passed to the client.
   *
   * @private
   */
  onResult_(response) {
    let newResponse = response.then(result => {
      if (null) {
        console.log('payment data', result);
      }
      if (result['error']) {
        let err = new Error();
        err['statusCode'] = result['error']['statusCode'];
        err['statusMessage'] = result['error']['statusMessage'];
        logDevErrorToConsole({
          apiName: 'loadPaymentData',
          errorMessage: err['statusMessage'],
        });
        throw err;
      }
      return result;
    });

    newResponse
        .then(result => {
          if (null) {
            console.log('payment data resolve to ', result);
          }
          PayFrameHelper.postMessage({
            'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
            'clientLatencyStartMs': this.loadPaymentDataApiStartTimeMs_,
            'buyFlowMode': this.buyFlowMode_,
            'buyFlowActivityReason': this.activityModeSelector_.reasons,
            'softwareInfo': this.getSoftwareInfo_(),
            'buttonInfo': this.buttonInfo_,
          });
        })
        .catch(result => {
          if (null) {
            console.log('payment data has error', result);
          }
          if (result['errorCode']) {
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': /** @type {!PublicErrorCode} */ (result['errorCode']),
              'buyFlowMode': this.buyFlowMode_,
              'buyFlowActivityReason': this.activityModeSelector_.reasons,
              'softwareInfo': this.getSoftwareInfo_(),
              'buttonInfo': this.buttonInfo_,
            });
          } else {
            // If user closes window we don't get a error code
            PayFrameHelper.postMessage({
              'eventType': PostMessageEventType.LOG_LOAD_PAYMENT_DATA_API,
              'error': PublicErrorCode.BUYER_CANCEL,
              'buyFlowMode': this.buyFlowMode_,
              'buyFlowActivityReason': this.activityModeSelector_.reasons,
              'softwareInfo': this.getSoftwareInfo_(),
              'buttonInfo': this.buttonInfo_,
            });
          }
        });
    this.onPaymentResponse_(newResponse);
  }


  /**
   * @param {!PaymentDataRequest} paymentDataRequest
   * @return {!PaymentDataRequest}
   * @private
   */
  assignInternalParams_(paymentDataRequest) {
    const internalParam = {
      'googleTransactionId': PaymentsAsyncClient.googleTransactionId_,
      'usingPayJs': true,
    };
    paymentDataRequest['i'] = paymentDataRequest['i'] ?
        Object.assign(internalParam, paymentDataRequest['i']) :
        internalParam;
    // firstPartyMerchantIdentifier should not be set directly in the
    // paymentDataRequest.
    if (paymentDataRequest['i']['firstPartyMerchantIdentifier']) {
      delete paymentDataRequest['i']['firstPartyMerchantIdentifier'];
    }
    if (this.paymentsClientOptions_.i &&
        this.paymentsClientOptions_.i.firstPartyMerchantIdentifier) {
      paymentDataRequest['i']['firstPartyMerchantIdentifier'] =
          this.paymentsClientOptions_.i.firstPartyMerchantIdentifier;
    }
    return paymentDataRequest;
  }
}

/** @const {?string} */
PaymentsAsyncClient.googleTransactionId_;
/** @type {?Promise<?boolean>} @private */
PaymentsAsyncClient.canMakePaymentPayJsPromise_ = null;
/** @type {?boolean} @private */
PaymentsAsyncClient.canMakePaymentPayJsResult_ = null;

/**
 * ActivityModeSelector is to determine the {BuyFlowActivityMode} based on all
 * the inputs, including user-agent, [experiment] flags, and request info from
 * merchant.
 */
// This class is introduced as part of multi-step cleanup to
// avoid the many places where branching decisions for WebActivity vs Native
// (Android or Payment Handler path) were made and re-examined.
//
// TODO: Currently, ActivityModeSelector only moves existing logic
// into a single place. It is not "selecting" the modes yet.
class ActivityModeSelector {
  /**
   * @param {!PaymentsClientOptions} clientOptions
   * @param {boolean=} useIframe
   */
  constructor(clientOptions, useIframe = false) {
    /** @const @private {!PaymentsClientOptions} */
    this.clientOptions_ = clientOptions;
    /** @type {!Array<!BuyFlowActivityReason>} */
    // this.reasons is public and mutable.  However, caller should create a
    // copy of the object and mutate it to add reasons that are not meant to be
    // persisted across requests.
    // Set is a better fit here (to avoid duplicates), but it is banned
    // in IBFE due to browser compatibility issues.
    this.reasons = [];

    /** @const {boolean} */
    this.supportPaymentHandler = this.supportPaymentHandler_();

    // supportPaymentRequest_() reference this.supportPaymentHandler
    // so it needs to be called after this.supportPaymentHandler is
    // initialized.
    /** @const {boolean} */
    this.supportPaymentRequest = this.supportPaymentRequest_();

    /** @type {!BuyFlowActivityMode}*/
    // We default to POPUP unless one of the checks tell us otherwise.
    this.mode = BuyFlowActivityMode.POPUP;
    if (useIframe) {
      // TODO: Remove the temporary hack that disable payments
      // request for inline flow.
      this.reasons = [BuyFlowActivityReason.USE_IFRAME];
      this.mode = BuyFlowActivityMode.IFRAME;
    } else if (this.supportPaymentRequest && this.supportPaymentHandler) {
      this.mode = BuyFlowActivityMode.PAYMENT_HANDLER;
    } else if (this.supportPaymentRequest) {
      this.mode = BuyFlowActivityMode.ANDROID_NATIVE;
    }

    if (this.clientOptions_.paymentDataCallbacks) {
      this.reasons.push(BuyFlowActivityReason.CALLBACKS);
    }
  }

  /**
   * Whether the request specifies that the native support has to be disabled.
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
   * @return {boolean}
   */
  static isNativeDisabledInRequest(request) {
    return (request['i'] && request['i']['disableNative']) === true;
  }

  /**
   * Returns the mode based on the payload in the request.
   * Will not update this.mode which is set during construction.
   *
   * @param {!PaymentDataRequest} request
   * @param {!Array<!BuyFlowActivityReason>} reasons
   * @return {!BuyFlowActivityMode}
   */
  getModePerPaymentDataRequest(request, reasons) {
    // TODO: In case of POPUP|IFRAME mode, it can be overwritten again
    // later (see TODOs from the caller and inside WebActivityDelegate) based on
    // request payload.  Will move all these logic here in future CL.
    if (this.mode === BuyFlowActivityMode.POPUP ||
        this.mode === BuyFlowActivityMode.IFRAME) {
      return this.mode;
    }
    if (ActivityModeSelector.isNativeDisabledInRequest(request)) {
      reasons.push(BuyFlowActivityReason.NATIVE_DISABLED);
      return BuyFlowActivityMode.POPUP;
    }

    if (!PaymentsAsyncClient.canMakePaymentPayJsResult_ &&
        (this.supportPaymentHandler ||
         (null &&
          this.supportPaymentRequest))) {
      reasons.push(BuyFlowActivityReason.PAYJS_CAN_MAKE_PAYMENT_FALSE);
      return BuyFlowActivityMode.POPUP;
    }

    if (this.supportPaymentHandler && request.swg) {
      reasons.push(BuyFlowActivityReason.PH_SWG);
      return BuyFlowActivityMode.POPUP;
    }
    return this.mode;
  }

  /**
   * @return {boolean} true if user is in PaymentHandler experiment and this
   *     version of Chrome supports PaymentHandler.
   * @private
   */
  supportPaymentHandler_() {
    // Payment handler isn't supported on mobile
    const mobilePlatform = window.navigator.userAgent.match(
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
    if (mobilePlatform != null) {
      this.reasons.push(BuyFlowActivityReason.MOBILE);
      return false;
    }

    const chromeVersion =
        window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
    const chromeSupportPH = 'PaymentRequest' in window &&
        chromeVersion != null && Number(chromeVersion[1]) >= 70 &&
        window.navigator.vendor == 'Google Inc.';
    if (!chromeSupportPH) {
      this.reasons.push(BuyFlowActivityReason.CHROME_NO_PH);
      return false;
    }

    this.reasons.push(BuyFlowActivityReason.CHROME_PH_READY);

    if (this.clientOptions_.paymentDataCallbacks) {
      this.reasons.push(BuyFlowActivityReason.CHROME_PH_DU_READY);
    }
    return true;
  }

  /**
   * @return {boolean} true if this version of Chrome supports PaymentRequest.
   * @private
   */
  supportPaymentRequest_() {
    if (!window.PaymentRequest) {
      this.reasons.push(BuyFlowActivityReason.NO_PR);
      return false;
    }
    // Opera uses chrome as rendering engine and sends almost the exact same
    // user agent as chrome thereby fooling us on android.
    const isOpera = window.navigator.userAgent.indexOf('OPR/') !== -1;
    const isOperaTouch = window.navigator.userAgent.indexOf('OPT/') !== -1;
    const isSamsungBrowser =
        window.navigator.userAgent.indexOf('SamsungBrowser/') !== -1;
    if (isOpera || isOperaTouch || isSamsungBrowser) {
      this.reasons.push(BuyFlowActivityReason.BROWSER_NO_PR);
      return false;
    }
    // TODO: Refactor this logic to decouple this with Payment Handler.
    if (this.supportPaymentHandler) return true;
    if (null &&
        !null) {
      this.reasons.push(BuyFlowActivityReason.NATIVE_DISABLED);
      return false;
    }

    const androidPlatform = window.navigator.userAgent.match(/Android/i);
    const chromeVersion =
        window.navigator.userAgent.match(/Chrome\/([0-9]+)\./i);
    const chromeSupportPR = androidPlatform != null &&
        'PaymentRequest' in window &&
        // Make sure skipping PaymentRequest UI when only one PaymentMethod is
        // supported (starts on Google Chrome 59).
        window.navigator.vendor == 'Google Inc.' && chromeVersion != null &&
        Number(chromeVersion[1]) >= 59;
    if (!chromeSupportPR) {
      this.reasons.push(BuyFlowActivityReason.NON_ANDROID_OR_NO_PR);
      return false;
    }
    if (!this.clientOptions_.paymentDataCallbacks) {
      // Return true if dynamic update is not needed.
      return true;
    }
    if (Number(chromeVersion[1]) < 92) {
      // Return false if dynamic update is not supported in this build.
      return false;
    }
    this.reasons.push(BuyFlowActivityReason.USE_CLANK_DU_IF_SUPPORTED);
    if (!null) {
      // Return false if dynamic update is supported but disabled.
      this.reasons.push(BuyFlowActivityReason.CLANK_DU_DISABLED);
      return false;
    }
    return true;
  }
}

export {PaymentsAsyncClient};
