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
import {MerchantCallbackTrigger, PayFrameHelper, PostMessageEventType} from './pay_frame_helper.js';
import {logDevErrorToConsole} from './utils.js';

class CallbackHandler {
  /**
   * @param {!PaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @return {!Promise<!Object>}
   */
  makeFullPaymentDataCallbackAndGenerateMessageForWebActivity(
      paymentData, paymentDataCallbacks, requestTimeoutLimit) {
    return this.createFullPaymentDataCallbackMessageForHostingPage_(
        paymentData, paymentDataCallbacks, requestTimeoutLimit,
        this.makeWebActivityResponse_);
  }

  /**
   * @param {!PaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @return {!Promise<!PaymentDetailsUpdate>}
   */
  makeFullPaymentDataCallbackAndGenerateMessageForPaymentHandler(
      paymentData, paymentDataCallbacks, requestTimeoutLimit) {
    return this.createFullPaymentDataCallbackMessageForHostingPage_(
        paymentData, paymentDataCallbacks, requestTimeoutLimit,
        this.makePaymentHandlerResponse_);
  }

  /**
   * @param {!IntermediatePaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @return {!Promise<!Object>}
   */
  makePartialPaymentDataCallbackAndGenerateMessageForWebActivity(
      paymentData, paymentDataCallbacks, requestTimeoutLimit) {
    return this.createPartialPaymentDataCallbackMessageForHostingPage_(
        paymentData, paymentDataCallbacks, requestTimeoutLimit,
        this.makeWebActivityResponse_);
  }

  /**
   * @param {!IntermediatePaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @return {!Promise<!PaymentDetailsUpdate>}
   */
  makePartialPaymentDataCallbackAndGenerateMessageForPaymentHandler(
      paymentData, paymentDataCallbacks, requestTimeoutLimit) {
    return this.createPartialPaymentDataCallbackMessageForHostingPage_(
        paymentData, paymentDataCallbacks, requestTimeoutLimit,
        this.makePaymentHandlerResponse_);
  }

  /**
   * @param {string} intent
   * @param {number} requestTimeoutLimit
   * @return {!Promise<!Object>}
   * @private
   */
  createTimeoutPromise_(intent, requestTimeoutLimit) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject({
          reason: 'OTHER_ERROR',
          intent: intent,
          message: Constants.REQUEST_TIMEOUT_MESSAGE
        });
      }, requestTimeoutLimit);
    });
  }

  /**
   * @param {!Object<string, string>} error Unknown type of error passed by
   *   developers
   * @param {string} callbackTrigger
   * @return {!PaymentDataRequestUpdate|!PaymentAuthorizationResult}
   * @private
   */
  buildCallbackError_(error, callbackTrigger) {
    return {
      'error': {
        'reason': error['reason'] || 'OTHER_ERROR',
        'intent': error['intent'] || callbackTrigger,
        'message': error['message'],
      }
    };
  }

  /**
   * @param {boolean} isTimeoutError true if it is a timeout error
   * @param {!PostMessageEventType} eventType
   * @param {!MerchantCallbackTrigger} callbackTrigger
   * @private
   */
  logCallbackError_(isTimeoutError, eventType, callbackTrigger) {
    // Developer shouldn't throw an error to in the promise but
    // handle the error.
    logDevErrorToConsole({
      apiName: 'loadPaymentData',
      errorMessage: 'An error occurred in call back, please ' +
          'try to avoid this by setting structured ' +
          'error in callback response'
    });

    if (isTimeoutError) {
      PayFrameHelper.postMessage({
        'eventType': eventType,
        'merchantCallbackInfo': {
          'callbackTrigger':
              callbackTrigger || MerchantCallbackTrigger.UNKNOWN_TRIGGER
        }
      });
    }
  }

  /**
   * @param {string} type
   * @param {!PaymentDataRequestUpdate|!PaymentAuthorizationResult} data
   * @return {!PaymentDetailsUpdate}
   * @private
   */
  makePaymentHandlerResponse_(type, data) {
    if (data.error === null) {
      console.warn('Please remove null fields in callback returns.');
      delete data.error;
    }
    return {
      modifiers: [{
        'supportedMethods': ['https://google.com/pay'],
        'data': data,
      }]
    };
  }

  /**
   * @param {string} type
   * @param {!PaymentDataRequestUpdate|!PaymentAuthorizationResult} data
   * @return {!Object}
   * @private
   */
  makeWebActivityResponse_(type, data) {
    return {'type': type, 'data': data};
  }

  /**
   * @param {!PaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @param {function(string,
   *     (!PaymentDataRequestUpdate|!PaymentAuthorizationResult))}
   *     callBackMessageGenerator util function to generate different formats of
   *     callback response for web activity and payment handler case.
   * @return {!Promise<!Object>}
   * @private
   */
  createFullPaymentDataCallbackMessageForHostingPage_(
      paymentData, paymentDataCallbacks, requestTimeoutLimit,
      callBackMessageGenerator) {
    return Promise
        .resolve(Promise.race([
          this.createTimeoutPromise_(
              Constants.CALLBACK_INTENTS.PAYMENT_AUTHORIZATION,
              requestTimeoutLimit),
          paymentDataCallbacks.onPaymentAuthorized(paymentData)
        ]))
        .then(
            (paymentAuthorizationResult) => {
              return callBackMessageGenerator(
                  Constants.PAYMENT_AUTHORIZATION_RESPONSE_TYPE,
                  paymentAuthorizationResult);
            },
            (error) => {
              this.logCallbackError_(
                  error['message'] === Constants.REQUEST_TIMEOUT_MESSAGE,
                  PostMessageEventType
                      .LOG_ON_PAYMENT_AUTHORIZED_DEVELOPER_TIMEOUT,
                  MerchantCallbackTrigger.PAYMENT_AUTHORIZATION);
              return callBackMessageGenerator(
                  Constants.PAYMENT_AUTHORIZATION_RESPONSE_TYPE,
                  /** @type {!PaymentAuthorizationResult}*/
                  (this.buildCallbackError_(
                      /** @type {!Object<string, string>} */ (error),
                      'PAYMENT_AUTHORIZATION')));
            });
  }

  /**
   * @param {!IntermediatePaymentData} paymentData
   * @param {?PaymentDataCallbacks} paymentDataCallbacks
   * @param {number} requestTimeoutLimit
   * @param {function(string,
   *     (!PaymentDataRequestUpdate|!PaymentAuthorizationResult))}
   *     callBackMessageGenerator util function to generate different formats of
   *     callback response for web activity and payment handler case.
   * @return {!Promise<!Object>}
   * @private
   */
  createPartialPaymentDataCallbackMessageForHostingPage_(
      paymentData, paymentDataCallbacks, requestTimeoutLimit,
      callBackMessageGenerator) {
    const timeoutIntent =
        paymentData.callbackTrigger in Constants.CALLBACK_INTENTS ?
        Constants.CALLBACK_INTENTS[paymentData.callbackTrigger] :
        Constants.CALLBACK_INTENTS.UNKNOWN_INTENT;
    return Promise
        .resolve(Promise.race([
          this.createTimeoutPromise_(timeoutIntent, requestTimeoutLimit),
          paymentDataCallbacks.onPaymentDataChanged(paymentData)
        ]))
        .then(
            (paymentDataRequestUpdate) => {
              return callBackMessageGenerator(
                  Constants.CALLBACK_DATA_RESPONSE_TYPE,
                  paymentDataRequestUpdate);
            },
            (error) => {
              this.logCallbackError_(
                  error['message'] === Constants.REQUEST_TIMEOUT_MESSAGE,
                  PostMessageEventType
                      .LOG_ON_PAYMENT_DATA_CHANGED_DEVELOPER_TIMEOUT,
                  MerchantCallbackTrigger[paymentData.callbackTrigger]);

              const data = /** @type {!PaymentDataRequestUpdate} */ (
                  this.buildCallbackError_(
                      /** @type {!Object<string, string>} */ (error),
                      paymentData.callbackTrigger || 'UNKNOWN_INTENT'));
              return callBackMessageGenerator(
                  Constants.CALLBACK_DATA_RESPONSE_TYPE, data);
            });
  }
}

export {CallbackHandler};
