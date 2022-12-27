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
import {endsWith} from './utils.js';

const PAYMENT_DATA_CHANGED_INTENTS = ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'];

let /** @type {boolean} */ localSecureBypass = true;

/**
 * @param {boolean} value If false, validateSecureContext() returns
 * error string unless window.isSecureContext is true even for localhost or
 * "*.google.com".
 */
function setLocalSecureBypass(value) {
  localSecureBypass = value;
}
/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 *
 * @return {boolean} true if the merchant only supports tokenized cards.
 */
function doesMerchantSupportOnlyTokenizedCards(isReadyToPayRequest) {
  if (isReadyToPayRequest.apiVersion >= 2) {
    const allowedAuthMethods =
        extractAllowedAuthMethodsForCards_(isReadyToPayRequest);
    if (allowedAuthMethods && allowedAuthMethods.length == 1 &&
        allowedAuthMethods[0] == Constants.AuthMethod.CRYPTOGRAM_3DS) {
      return true;
    }
  }
  return isReadyToPayRequest.allowedPaymentMethods.length == 1 &&
      isReadyToPayRequest.allowedPaymentMethods[0] ==
      Constants.PaymentMethod.TOKENIZED_CARD;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @param {!Constants.AuthMethod} apiV2AuthMethod
 *
 * @return {boolean} true if the merchant supports pan cards.
 */
function apiV2DoesMerchantSupportSpecifiedCardType(
    isReadyToPayRequest, apiV2AuthMethod) {
  if (isReadyToPayRequest.apiVersion >= 2) {
    const allowedAuthMethods =
        extractAllowedAuthMethodsForCards_(isReadyToPayRequest);
    if (allowedAuthMethods && allowedAuthMethods.includes(apiV2AuthMethod)) {
      return true;
    }
    return false;
  }
  return false;
}

/**
 * Validate if is secure context. Returns null if context is secure, otherwise
 * return error message.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
 *
 * @return {?string} null if current context is secure, otherwise return error
 * message.
 */
function validateSecureContext() {
  if (localSecureBypass &&
      endsWith(window.location.hostname, Constants.TRUSTED_DOMAIN)) {
    // This is for local development.
    return null;
  }
  if (window.isSecureContext === undefined) {
    // Browser not support isSecureContext, figure out a way to validate this
    // for the unsupported browser.
    return null;
  }
  return window.isSecureContext ?
      null :
      'Google Pay APIs should be called in secure context!';
}

/**
 * Validate PaymentsClientOptions.
 *
 * @param {!PaymentsClientOptions} paymentsClientOptions
 */
function validatePaymentsClientOptions(paymentsClientOptions) {
  if (paymentsClientOptions.environment &&
      !Object.values(Constants.Environment)
           .includes(paymentsClientOptions.environment)) {
    throw new Error(
        'Parameter environment in PaymentsClientOptions can optionally be ' +
        'set to PRODUCTION, otherwise it defaults to TEST.');
  }
}

/**
 * Validate IsReadyToPayRequest.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validateIsReadyToPayRequest(isReadyToPayRequest) {
  if (!isReadyToPayRequest) {
    return 'isReadyToPayRequest must be set!';
  }
  if (getUpiPaymentMethod(isReadyToPayRequest)) {
    return 'UPI not supported';
  }
  if (isReadyToPayRequest.apiVersion >= 2) {
    if (!('apiVersionMinor' in isReadyToPayRequest)) {
      return 'apiVersionMinor must be set!';
    }
    if (!isReadyToPayRequest.allowedPaymentMethods ||
        !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
        isReadyToPayRequest.allowedPaymentMethods.length == 0) {
      return 'for v2 allowedPaymentMethods must be set to an array containing a list of accepted payment methods';
    }
    for (var i = 0; i < isReadyToPayRequest.allowedPaymentMethods.length; i++) {
      let allowedPaymentMethod = isReadyToPayRequest.allowedPaymentMethods[i];
      if (allowedPaymentMethod['type'] == Constants.PaymentMethod.CARD) {
        if (!allowedPaymentMethod['parameters']) {
          return 'Field parameters must be setup in each allowedPaymentMethod';
        }
        var allowedCardNetworks =
            allowedPaymentMethod['parameters']['allowedCardNetworks'];
        if (!allowedCardNetworks || !Array.isArray(allowedCardNetworks) ||
            allowedCardNetworks.length == 0) {
          return 'allowedCardNetworks must be setup in parameters for type CARD';
        }
        var allowedAuthMethods =
            allowedPaymentMethod['parameters']['allowedAuthMethods'];
        if (!allowedAuthMethods || !Array.isArray(allowedAuthMethods) ||
            allowedAuthMethods.length == 0 ||
            !allowedAuthMethods.every(isAuthMethodValid)) {
          return 'allowedAuthMethods must be setup in parameters for type \'CARD\' ' +
              ' and must contain \'CRYPTOGRAM_3DS\' and/or \'PAN_ONLY\'';
        }
      }
    }
    return null;
  } else if (
      !isReadyToPayRequest.allowedPaymentMethods ||
      !Array.isArray(isReadyToPayRequest.allowedPaymentMethods) ||
      isReadyToPayRequest.allowedPaymentMethods.length == 0 ||
      !isReadyToPayRequest.allowedPaymentMethods.every(isPaymentMethodValid)) {
    return 'allowedPaymentMethods must be set to an array containing \'CARD\' ' +
        'and/or \'TOKENIZED_CARD\'!';
  }
  return null;
}

/**
 * Validate the payment method.
 *
 * @param {string} paymentMethod
 * @return {boolean} if the current payment method is valid.
 */
function isPaymentMethodValid(paymentMethod) {
  return Object.values(Constants.PaymentMethod).includes(paymentMethod);
}

/**
 * Validate the auth method.
 *
 * @param {string} authMethod
 * @return {boolean} if the current auth method is valid.
 */
function isAuthMethodValid(authMethod) {
  return Object.values(Constants.AuthMethod).includes(authMethod);
}

/**
 * Validate PaymentDataRequest.
 *
 * @param {!PaymentDataRequest} paymentDataRequest
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequest(paymentDataRequest) {
  if (!paymentDataRequest) {
    return 'paymentDataRequest must be set!';
  }
  if (getUpiPaymentMethod(paymentDataRequest)) {
    return 'UPI not supported';
  }
  if (paymentDataRequest.swg) {
    return validatePaymentDataRequestForSwg(paymentDataRequest.swg);
  } else if (!paymentDataRequest.transactionInfo) {
    return 'transactionInfo must be set!';
  } else if (!paymentDataRequest.transactionInfo.currencyCode) {
    return 'currencyCode in transactionInfo must be set!';
  } else if (
      !paymentDataRequest.transactionInfo.totalPriceStatus ||
      !Object.values(Constants.TotalPriceStatus)
           .includes(paymentDataRequest.transactionInfo.totalPriceStatus)) {
    return 'totalPriceStatus in transactionInfo must be set to one of' +
        ' NOT_CURRENTLY_KNOWN, ESTIMATED or FINAL!';
  } else if (
      paymentDataRequest.transactionInfo.totalPriceStatus !==
          'NOT_CURRENTLY_KNOWN' &&
      !paymentDataRequest.transactionInfo.totalPrice) {
    return 'totalPrice in transactionInfo must be set when' +
        ' totalPriceStatus is ESTIMATED or FINAL!';
  }

  // Validate payment data request for UPI payment method
  const allowedPaymentMethod = getUpiPaymentMethod(paymentDataRequest);
  if (allowedPaymentMethod) {
    if (!allowedPaymentMethod['parameters']) {
      return 'parameters must be set in allowedPaymentMethod!';
    }

    var parameters = allowedPaymentMethod['parameters'];
    if (!parameters['payeeVpa']) {
      return 'payeeVpa in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['payeeName']) {
      return 'payeeName in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['referenceUrl']) {
      return 'referenceUrl in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['mcc']) {
      return 'mcc in allowedPaymentMethod parameters must be set!';
    } else if (!parameters['transactionReferenceId']) {
      return 'transactionReferenceId in allowedPaymentMethod parameters' +
          ' must be set!';
    }

    if (paymentDataRequest['transactionInfo']['currencyCode'] !== 'INR') {
      return 'currencyCode in transactionInfo must be set to INR!';
    } else if (
        paymentDataRequest['transactionInfo']['totalPriceStatus'] !== 'FINAL') {
      return 'totalPriceStatus in transactionInfo must be set to FINAL!';
    } else if (!paymentDataRequest['transactionInfo']['transactionNote']) {
      return 'transactionNote in transactionInfo must be set!';
    }
  }
  return null;
}

/**
 * Returns upi payment method object if it exists in allowed payment methods
 * or null if it doesn't
 *
 * @param {!IsReadyToPayRequest|!PaymentDataRequest} request
 * @return {?Object}
 */
function getUpiPaymentMethod(request) {
  if (request.apiVersion < 2 || !request.allowedPaymentMethods) {
    return null;
  }
  return getAllowedPaymentMethodForType_(request, Constants.PaymentMethod.UPI);
}

/**
 * Validate parameters for swg.
 *
 * @param {?SwgParameters} swgParameters
 * @return {?string} errorMessage if the request is invalid.
 */
function validatePaymentDataRequestForSwg(swgParameters) {
  if (!swgParameters) {
    return 'Swg parameters must be provided';
  }
  if (!swgParameters.skuId || !swgParameters.publicationId) {
    return 'Both skuId and publicationId must be provided';
  }
  return null;
}

/**
 * Validate callback parameters are set up properly.
 *
 * @param {!PaymentDataRequest} request
 * @param {?PaymentDataCallbacks} paymentDataCallbacks
 * @return {?string} errorMessage if the parameters are invalid.
 */
function validateCallbackParameters(request, paymentDataCallbacks) {
  if (request.callbackIntents && !paymentDataCallbacks) {
    return 'paymentDataCallbacks must be set';
  }
  if (request.callbackIntents.includes('PAYMENT_AUTHORIZATION') !==
      !!paymentDataCallbacks.onPaymentAuthorized) {
    return 'Both PAYMENT_AUTHORIZATION intent and onPaymentAuthorized must ' +
        'be set';
  }
  let supportedIntents = PAYMENT_DATA_CHANGED_INTENTS.slice();
  if (null) {
    supportedIntents.push('OFFER');
  }
  if (null) {
    supportedIntents.push('PAYMENT_METHOD');
  }
  if (!!supportedIntents
            .filter(intent => request.callbackIntents.includes(intent))
            .length !== !!paymentDataCallbacks.onPaymentDataChanged) {
    return 'onPaymentDataChanged callback must be set if any of ' +
        `${supportedIntents} callback intent is set.`;
  }
  return null;
}

/**
 * Returns the allowedAuthMethods for a card from the request.
 *
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @return {?Array<string>}
 * @private
 */
function extractAllowedAuthMethodsForCards_(isReadyToPayRequest) {
  if (isReadyToPayRequest.allowedPaymentMethods) {
    const allowedPaymentMethod = getAllowedPaymentMethodForType_(
        isReadyToPayRequest, Constants.PaymentMethod.CARD);
    if (allowedPaymentMethod && allowedPaymentMethod.parameters) {
      return allowedPaymentMethod.parameters['allowedAuthMethods'];
    }
  }
  return null;
}

/**
 * @param {!IsReadyToPayRequest} isReadyToPayRequest
 * @param {string} paymentMethodType
 * @return {?PaymentMethod} Return first payment method for the given type,
 *     return null if not found.
 * @private
 */
function getAllowedPaymentMethodForType_(
    isReadyToPayRequest, paymentMethodType) {
  for (var i = 0; i < isReadyToPayRequest.allowedPaymentMethods.length; i++) {
    const allowedPaymentMethod = isReadyToPayRequest.allowedPaymentMethods[i];
    if (allowedPaymentMethod.type == paymentMethodType) {
      return allowedPaymentMethod;
    }
  }
  return null;
}

export {
  apiV2DoesMerchantSupportSpecifiedCardType,
  doesMerchantSupportOnlyTokenizedCards,
  getUpiPaymentMethod,
  isPaymentMethodValid,
  setLocalSecureBypass,
  validateCallbackParameters,
  validateIsReadyToPayRequest,
  validatePaymentsClientOptions,
  validatePaymentDataRequest,
  validateSecureContext
};
