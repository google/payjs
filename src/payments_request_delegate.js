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

/**
 * @fileoverview Description of this file.
 */
import {CallbackHandler} from './callback_handler.js';
import {Constants} from './constants.js';
import {PaymentsClientDelegateInterface} from './payments_client_delegate_interface.js';

/**
 * An implementation of PaymentsClientDelegateInterface that leverages payment
 * request.
 * @implements {PaymentsClientDelegateInterface}
 */
class PaymentsRequestDelegate {
  /**
   * @param {string} environment
   */
  constructor(environment) {
    this.environment_ = environment;

    /** @private {?function(!Promise<!PaymentData>)} */
    this.callback_ = null;

    /** @private {?PaymentDataCallbacks} */
    this.paymentDataCallbacks_ = null;

    /**
     * This is defined for testing.
     * @type {?Promise<undefined>}
     */
    this.paymentDataCallbackPromise = null;

    /**
     * This is defined for testing.
     * @protected {?Promise<undefined>}
     */
    this.paymentAuthorizationCallbackPromise = null;

    /**
     * @private {number}
     */
    this.requestTimeoutLimit_ = Constants.DEFAULT_REQUEST_TIMEOUT_LIMIT;
  }

  /**
   * Set up a timeout promise for testing purpose
   * @param {number} newRequestTimeoutLimit
   */
  withRequestTimeoutLimit(newRequestTimeoutLimit) {
    this.requestTimeoutLimit_ = newRequestTimeoutLimit;
  }

  /** @override */
  registerPaymentDataCallbacks(paymentDataCallbacks) {
    this.paymentDataCallbacks_ = paymentDataCallbacks;
  }

  /** @override */
  onResult(callback) {
    this.callback_ = callback;
  }

  /** @override */
  isReadyToPay(isReadyToPayRequest) {
    /** @type{!PaymentRequest} */
    const paymentRequest = this.createPaymentRequest_(isReadyToPayRequest);
    return new Promise((resolve, reject) => {
      let promise;
      // hasEnrolledInstrument started being available on Chrome 74.
      // For older versions of chrome, we fallback to canMakePayments.
      if (paymentRequest.hasEnrolledInstrument != undefined) {
        promise = paymentRequest.hasEnrolledInstrument();
      } else {
        promise = paymentRequest.canMakePayment();
      }
      promise
          .then(result => {
            window.sessionStorage.setItem(
                Constants.IS_READY_TO_PAY_RESULT_KEY, result.toString());
            const response = {'result': result};
            if (isReadyToPayRequest.apiVersion >= 2 &&
                isReadyToPayRequest.existingPaymentMethodRequired) {
              // For apiVersion 2, we always use native to only check for
              // tokenized cards.
              // For tokenized cards native always does a presence check so
              // we can say that if canMakePayment is true for native for
              // tokenizedCards then the user has a payment method which is
              // present.
              response['paymentMethodPresent'] = result;
            }
            resolve(response);
          })
          .catch(function(err) {
            if (window.sessionStorage.getItem(
                    Constants.IS_READY_TO_PAY_RESULT_KEY)) {
              resolve({
                'result': window.sessionStorage.getItem(
                              Constants.IS_READY_TO_PAY_RESULT_KEY) == 'true'
              });
            } else {
              resolve({'result': false});
            }
          });
    });
  }

  /** @override */
  prefetchPaymentData(paymentDataRequest) {
    // Creating PaymentRequest instance will call
    // Gcore isReadyToPay internally which will prefetch tempaltes.
    this.createPaymentRequest_(
        paymentDataRequest, this.environment_,
        paymentDataRequest.transactionInfo.currencyCode,
        paymentDataRequest.transactionInfo.totalPrice);
  }

  /** @override */
  loadPaymentData(paymentDataRequest) {
    this.loadPaymentDataThroughPaymentRequest_(paymentDataRequest);
    return;
  }

  /**
   * Create PaymentRequest instance.
   *
   * @param {!IsReadyToPayRequest|!PaymentDataRequest} request The necessary information to check if user is
   *     ready to pay or to support a payment from merchants.
   * @param {?string=} environment (optional)
   * @param {?string=} currencyCode (optional)
   * @param {?string=} totalPrice (optional)
   * @return {!PaymentRequest} PaymentRequest instance.
   * @private
   */
  createPaymentRequest_(request, environment, currencyCode, totalPrice) {
    let data = {};
    if (request) {
      data = JSON.parse(JSON.stringify(request));
    }

    // Only set the apiVersion if the merchant doesn't set it.
    if (!data['apiVersion']) {
      data['apiVersion'] = 1;
    }

    // Add allowedPaymentMethods for swg to get through gms core validation.
    if (data['swg']) {
      data['allowedPaymentMethods'] = [Constants.PaymentMethod.CARD];
    }

    if (environment && environment == Constants.Environment.TEST) {
      data['environment'] = environment;
    }

    const supportedInstruments = [{
      'supportedMethods': ['https://google.com/pay'],
      'data': data,
    }];

    const details = {
      'total': {
        'label': 'Estimated Total Price',
        'amount': {
          // currency and value are required fields in PaymentRequest, but these
          // fields will never be used since PaymentRequest UI is skipped when
          // we're the only payment method, so default to some value to by pass
          // this requirement.
          'currency': currencyCode || 'USD',
          'value': totalPrice || '0',
        }
      }
    };

    return new PaymentRequest(supportedInstruments, details);
  }

  /**
   * Handle paymentMethodChange event.
   *
   * @param {!PaymentMethodChangeEvent} ev
   * @package
   */
  handleOnPaymentMethodChange(ev) {
    const callbackHandler = new CallbackHandler();
    let promiseForNewDetails;
    if (ev.methodDetails.callbackTrigger) {
      promiseForNewDetails =
          callbackHandler
              .makePartialPaymentDataCallbackAndGenerateMessageForPaymentHandler(
                  ev.methodDetails, this.paymentDataCallbacks_,
                  this.requestTimeoutLimit_);
    } else {
      promiseForNewDetails =
          callbackHandler
              .makeFullPaymentDataCallbackAndGenerateMessageForPaymentHandler(
                  ev.methodDetails, this.paymentDataCallbacks_,
                  this.requestTimeoutLimit_);
    }
    ev.updateWith(promiseForNewDetails);
  }

  /**
   * @param {!PaymentDataRequest} paymentDataRequest Provides necessary
   *     information to support a payment.
   * @private
   */
  loadPaymentDataThroughPaymentRequest_(paymentDataRequest) {
    const currencyCode = (paymentDataRequest.transactionInfo &&
                          paymentDataRequest.transactionInfo.currencyCode) ||
        undefined;
    const totalPrice = (paymentDataRequest.transactionInfo &&
                        paymentDataRequest.transactionInfo.totalPrice) ||
        undefined;
    const paymentRequest = this.createPaymentRequest_(
        paymentDataRequest, this.environment_, currencyCode, totalPrice);

    paymentRequest.onpaymentmethodchange = ev => {
      this.handleOnPaymentMethodChange(ev);
    };

    this.callback_(
        /** @type{!Promise<!PaymentData>} */
        (paymentRequest.show()
             .then(
                 /**
                  * @param {!PaymentResponse} paymentResponse
                  * @return {!PaymentData}
                  */
                 (paymentResponse) => {
                   if (null) {
                     console.log('payment response', paymentResponse);
                   }
                   // Should be called to dismiss any remaining UI
                   paymentResponse.complete('success');
                   if (paymentResponse['details']['statusCode']) {
                     if (null) {
                       console.log(
                           'status code', paymentResponse.details.statusCode);
                     }
                     return {
                       'error': paymentResponse['details'],
                     };
                   }
                   return paymentResponse['details'];
                 })
             .catch(function(err) {
               if (null) {
                 console.log('payment response with err', err);
               }
               // TODO: combine the error handling cases.
               err['statusCode'] = Constants.ResponseStatus.CANCELED;
               throw err;
             })));
  }
}

export {PaymentsRequestDelegate};
