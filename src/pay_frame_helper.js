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
import {PostMessageService} from './post_message_service.js';

/**
 * Supported interactions between iframe and merchant page.
 *
 * @enum {number}
 */
// Next Id: 13
const PostMessageEventType = {
  CAN_MAKE_PAYMENT_FOR_PAYMENT_HANDLER: 11,
  IS_READY_TO_PAY: 6,
  LOG_BUTTON_CLICK: 5,
  LOG_IS_READY_TO_PAY_CALLED: 12,
  LOG_IS_READY_TO_PAY_API: 0,
  LOG_LOAD_PAYMENT_DATA_API: 1,
  LOG_RENDER_BUTTON: 2,
  LOG_RENDER_OFFER_PRENOTIFICATION: 10,
  LOG_INITIALIZE_PAYMENTS_CLIENT: 9,
  LOG_PAY_FRAME_REQUESTED: 15,
  LOG_PAY_FRAME_LOADED: 16,
  LOG_PAY_FRAME_LOADED_WITH_ALL_JS: 17,
  LOG_INLINE_PAYMENT_WIDGET_INITIALIZE: 4,
  LOG_INLINE_PAYMENT_WIDGET_SUBMIT: 3,
  LOG_INLINE_PAYMENT_WIDGET_DISPLAYED: 7,
  LOG_INLINE_PAYMENT_WIDGET_HIDDEN: 8,
  LOG_ON_PAYMENT_DATA_CHANGED_DEVELOPER_TIMEOUT: 26,
  LOG_ON_PAYMENT_AUTHORIZED_DEVELOPER_TIMEOUT: 27,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const BuyFlowActivityMode = {
  UNKNOWN_MODE: 0,
  IFRAME: 1,
  POPUP: 2,
  REDIRECT: 3,
  ANDROID_NATIVE: 4,
  PAYMENT_HANDLER: 5,
};

/**
 * GPay Button types.
 *
 * @enum {number}
 */
const ButtonType = {
  BUTTON_TYPE_UNKNOWN: 0,
  BUTTON_TYPE_SHORT: 1,
  BUTTON_TYPE_LONG: 2,
  BUTTON_TYPE_PLAIN: 3,
  BUTTON_TYPE_BUY: 4,
  BUTTON_TYPE_DONATE: 5,
  BUTTON_TYPE_BOOK: 6,
  BUTTON_TYPE_CHECKOUT: 7,
  BUTTON_TYPE_ORDER: 8,
  BUTTON_TYPE_PAY: 9,
  BUTTON_TYPE_SUBSCRIBE: 10,
};

/**
 * GPay Button size modes.
 *
 * @enum {number}
 */
const ButtonSizeMode = {
  BUTTON_SIZE_MODE_UNKNOWN: 0,
  BUTTON_SIZE_MODE_STATIC: 1,
  BUTTON_SIZE_MODE_FILL: 2,
};

/**
 * GPay Button root node types.
 *
 * @enum {number}
 */
const ButtonRootNode = {
  BUTTON_ROOT_NODE_UNKNOWN: 0,
  BUTTON_ROOT_NODE_SHADOWROOT: 1,
  BUTTON_ROOT_NODE_DOCUMENT: 2,
  BUTTON_ROOT_NODE_INVALID: 3,
};



/**
 * Reasons for deciding on certain BuyFlowActivityMode.
 *
 * @enum {number}
 */
const BuyFlowActivityReason = {
  UNKNOWN: 0,

  // Start of request based reasons
  CALLBACKS: 1,
  UPI_METHOD: 2,
  NATIVE_DISABLED: 3,
  PH_NO_RESPONSE: 4,
  PH_SWG: 5,
  V1_ONLY_TOKENIZED: 6,
  V1: 7,
  V2_3DS: 8,
  V2_PAN_ONLY: 9,

  // Start of user-agent/config based reasons
  NO_LAUNCH_PH: 33,
  NON_ANDROID_OR_NO_PR: 34,
  BROWSER_NO_PR: 35,
  CHROME_NO_PH: 36,
  MOBILE: 37,
  USE_IFRAME: 38,
  NO_LAUNCH_PH_DU: 39,
  PAYJS_CAN_MAKE_PAYMENT_FALSE: 40,
  NO_PR: 41,
  CLANK_DU_DISABLED: 42,

  USE_CLANK_DU_IF_SUPPORTED: 96,
  CHROME_PH_DU_READY: 97,
  CHROME_PH_READY: 98,
  // To explicitly provide a reason to differentiate from earlier client.
  FALL_THROUGH: 99,
};

/**
 * Types of buy flow activity modes.
 *
 * @enum {number}
 */
const PublicErrorCode = {
  UNKNOWN_ERROR_TYPE: 0,
  INTERNAL_ERROR: 1,
  DEVELOPER_ERROR: 2,
  BUYER_ACCOUNT_ERROR: 3,
  MERCHANT_ACCOUNT_ERROR: 4,
  UNSUPPORTED_API_VERSION: 5,
  BUYER_CANCEL: 6,
};

/**
 * The presentation mode of the buy flow
 *
 * @enum {number}
 */
const BuyFlowMode = {
  LEGACY: 0,
  ORCHESTRATION_BUYFLOW: 1,
  INSTANT_APPS: 2,
  DECONSTRUCTED: 3,
  PAYMENT_REQUEST: 4,
  PAY_WITH_GOOGLE: 5,
  SUBSCRIBE_WITH_GOOGLE: 6,
  AMP_BUTTON_FLOW: 7,
  AMP_INLINE_FLOW: 8,
  INTEGRATOR_PROCESSED_PAYMENT: 9,
};

/**
 * Types of merchant callback trigger.
 *
 * @enum {number}
 */
const MerchantCallbackTrigger = {
  UNKNOWN_TRIGGER: 0,
  INITIALIZE: 1,
  PAYMENT_AUTHORIZATION: 2,
  SHIPPING_ADDRESS: 3,
  SHIPPING_OPTION: 4,
  OFFER: 5,
};

/**
 * Iframe used for logging and prefetching.
 *
 * @type {?Element}
 */
let iframe = null;

/** @type {?PostMessageService} */
let postMessageService = null;

/** @type {?string} */
let environment = null;

/** @type {?string} */
let googleTransactionId = null;

/** @type {number} */
let originTimeMs = Date.now();

/** @type {?BuyFlowActivityMode} */
let buyFlowActivityMode = null;

/** @type {boolean} */
let canMakePaymentForPaymentHandlerResult = false;

/** @type {boolean} */
let iframeLoaded = false;

/** @type {!Array<!Object>} */
let buffer = [];

class PayFrameHelper {
  /**
   * Creates a hidden iframe for logging and appends it to the top level
   * document.
   */
  static load() {
    if (iframe) {
      return;
    }
    const initOptions =
        /** @type {!PaymentsClientOptions} */ (window['gpayInitParams']) || {};
    environment = initOptions.environment || Constants.Environment.PRODUCTION;
    iframe = document.createElement('iframe');
    // Pass in origin because document.referrer inside iframe is empty in
    // certain cases
    // Can be replaced by iframe.src=... in non Google context.
    iframe.src = PayFrameHelper.getIframeUrl_(
            window.location.origin,
            initOptions.merchantInfo && initOptions.merchantInfo.merchantId);
    PayFrameHelper.postMessage({
      'eventType': PostMessageEventType.LOG_PAY_FRAME_REQUESTED,
      'clientLatencyStartMs': Date.now(),
    });
    PayFrameHelper.sendInitialEvents_();
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('allowpaymentrequest', true);
    iframe.onload = function() {
      postMessageService = new PostMessageService(iframe.contentWindow);
      PayFrameHelper.postMessage({
        'eventType': PostMessageEventType.LOG_PAY_FRAME_LOADED_WITH_ALL_JS,
        'clientLatencyStartMs': Date.now(),
      });
      PayFrameHelper.postMessage({
        'eventType': PostMessageEventType.LOG_PAY_FRAME_LOADED,
        'clientLatencyStartMs': Date.now(),
      });
      PayFrameHelper.iframeLoaded();
    };
    // If the body is already loaded, just append the iframe. Otherwise, we wait
    // until the DOM has loaded to append the iframe, otherwise document.body is
    // null.
    if (document.body) {
      PayFrameHelper.initialize_();
    } else {
      document.addEventListener(
          'DOMContentLoaded', () => PayFrameHelper.initialize_());
    }
  }

  /**
   * Appends the iframe to the DOM and updates the post message service.
   * @private
   */
  static initialize_() {
    document.body.appendChild(iframe);
  }

  /**
   * Sends initial events to the iframe.
   * @private
   */
  static sendInitialEvents_() {
    // payframe will do chromeSupportsPaymentHandler() check and return false if
    // PH is not available.
    PayFrameHelper.sendAndWaitForResponse(
        {}, PostMessageEventType.CAN_MAKE_PAYMENT_FOR_PAYMENT_HANDLER,
        ['canMakePaymentForPaymentHandlerResponse'], (event) => {
          canMakePaymentForPaymentHandlerResult =
              event.data['canMakePaymentForPaymentHandlerResponse'];
        });
  }

  /**
   * Returns the CAN_MAKE_PAYMENT_FOR_PAYMENT_HANDLER response.
   * @return {boolean}
   */
  static getCanMakePaymentForPaymentHandlerResult() {
    return canMakePaymentForPaymentHandlerResult;
  }

  /**
   * Sends a message to the iframe and wait for a response.
   * Uses the responseHandler specified only if the responseType is a match.
   *
   * @param {!Object} data
   * @param {!PostMessageEventType} eventType
   * @param {!Array<string>} responseTypes
   * @param {function(!Event)} responseHandler
   */
  static sendAndWaitForResponse(
      data, eventType, responseTypes, responseHandler) {
    function callback(event) {
      if (PayFrameHelper.isSupportedResponseType_(responseTypes, event)) {
        responseHandler(event);
        // We only want to process the response from the payframe once.
        // so stop listening to the event once processed.
        PayFrameHelper.removeMessageEventListener_(callback);
      }
    }

    PayFrameHelper.addMessageEventListener_(callback);

    const postMessageData = Object.assign({'eventType': eventType}, data);
    PayFrameHelper.postMessage(postMessageData);
  }

  /**
   * Checks if the event has any of the supported response types.
   * @param {!Array<string>} responseTypes
   * @param {!Event} event
   *
   * @return {boolean}
   * @private
   */
  static isSupportedResponseType_(responseTypes, event) {
    for (let i = 0; i < responseTypes.length; i++) {
      if (event.data[responseTypes[i]]) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add an event listener for listening to messages received.
   *
   * @param {function(!Event)} callback
   * @private
   */
  static addMessageEventListener_(callback) {
    window.addEventListener('message', callback);
  }

  /**
   * Remove the event listener for listening to messages.
   *
   * @param {function(!Event)} callback
   * @private
   */
  static removeMessageEventListener_(callback) {
    window.removeEventListener('message', callback);
  }

  /**
   * Posts a message to the iframe with the given data.
   *
   * @param {!Object} data
   */
  static postMessage(data) {
    if (!iframeLoaded || !postMessageService) {
      buffer.push(data);
      return;
    }
    const postMessageData = Object.assign(
        {
          'buyFlowActivityMode': buyFlowActivityMode,
          'googleTransactionId': googleTransactionId,
          'originTimeMs': originTimeMs,
        },
        data);
    postMessageService.postMessage(
        postMessageData, PayFrameHelper.getIframeOrigin_());
  }

  /**
   * Sets the activity mode.
   *
   * @param {!BuyFlowActivityMode} mode
   */
  static setBuyFlowActivityMode(mode) {
    buyFlowActivityMode = mode;
  }

  /**
   * Sets the google transaction id.
   *
   * @param {string} txnId
   */
  static setGoogleTransactionId(txnId) {
    googleTransactionId = txnId;
  }

  /**
   * Sets the originTimeMs. To be used only for tests.
   *
   * @param {number} originTimeMsTemp
   */
  static setOriginTimeMs(originTimeMsTemp) {
    originTimeMs = originTimeMsTemp;
  }

  /**
   * Override postMessageService for testing.
   *
   * @param {!PostMessageService} messageService
   */
  static setPostMessageService(messageService) {
    postMessageService = messageService;
  }

  /**
   * Clears the singleton variables.
   */
  static reset() {
    iframe = null;
    buffer.length = 0;
    iframeLoaded = false;
    buyFlowActivityMode = null;
    canMakePaymentForPaymentHandlerResult = false;
  }

  /**
   * Sets whether the iframe has been loaded or not.
   *
   * @param {boolean} loaded
   */
  static setIframeLoaded(loaded) {
    iframeLoaded = loaded;
  }

  /**
   * Called whenever the iframe is loaded.
   */
  static iframeLoaded() {
    iframeLoaded = true;
    buffer.forEach(function(data) {
      PayFrameHelper.postMessage(data);
    });
    buffer.length = 0;
  }

  /**
   * Returns the events that have been buffered.
   *
   * @return {!Array<!Object>}
   */
  static getBuffer() {
    return buffer;
  }

  /**
   * Mocks the iframe as an arbitrary html element instead of actually injecting
   * it for testing.
   */
  static injectIframeForTesting() {
    PayFrameHelper.reset();
    iframe = document.createElement('p');
    PayFrameHelper.iframeLoaded();
    canMakePaymentForPaymentHandlerResult = true;
  }

  /**
   * Returns the payframe origin based on the environment.
   *
   * @return {string}
   * @private
   */
  static getIframeOrigin_() {
    if (environment == Constants.Environment.CANARY) {
      return 'https://ibfe-canary.corp.google.com';
    }
    let iframeUrl = 'https://pay';
    if (environment == Constants.Environment.SANDBOX) {
      iframeUrl += '.sandbox';
    } else if (environment == Constants.Environment.PREPROD) {
      iframeUrl += '-preprod.sandbox';
    }
    return iframeUrl + '.google.com';
  }

  /**
   * Returns the payframe URL based on the environment.
   *
   * @param {string} origin The origin that is opening the payframe.
   * @param {string|null=} merchantId The merchant id.
   * @return {string}
   * @private
   */
  static getIframeUrl_(origin, merchantId) {
    // TrustedResourceUrl header needs to start with https or '//'.
    const iframeUrl = (environment == Constants.Environment.CANARY ?
             'https://ibfe-canary.corp' :
             'https://pay') +
        (environment == Constants.Environment.PREPROD ?
             '-preprod.sandbox' :
             environment == Constants.Environment.SANDBOX ? '.sandbox' : '') +
        '.google.com/gp/p/ui/payframe?origin=' +
        `${origin}&mid=${merchantId}`;
    return iframeUrl;
  }

  /**
   * Converts error code string to the corresponding enum value.
   *
   * @param {string} errorCodeString
   * @return {!PublicErrorCode}
   */
  static toPublicErrorCode(errorCodeString) {
    if (errorCodeString == 'INTERNAL_ERROR') {
      return PublicErrorCode.INTERNAL_ERROR;
    } else if (errorCodeString == 'DEVELOPER_ERROR') {
      return PublicErrorCode.DEVELOPER_ERROR;
    } else if (errorCodeString == 'MERCHANT_ACCOUNT_ERROR') {
      return PublicErrorCode.MERCHANT_ACCOUNT_ERROR;
    } else if (errorCodeString == 'UNSUPPORTED_API_VERSION') {
      return PublicErrorCode.UNSUPPORTED_API_VERSION;
    } else if (errorCodeString == 'BUYER_CANCEL') {
      return PublicErrorCode.BUYER_CANCEL;
    } else {
      return PublicErrorCode.UNKNOWN_ERROR_TYPE;
    }
  }

  /**
   * Converts strings in button options to button info
   * with correspoinding enum values.
   *
   * @param {!ButtonOptions} buttonOptions
   * @return {!ButtonInfo}
   */
  static getButtonInfoFromButtonOptions(buttonOptions) {
    let buttonType = ButtonType.BUTTON_TYPE_UNKNOWN;
    let buttonSizeMode = ButtonSizeMode.BUTTON_SIZE_MODE_UNKNOWN;
    switch (buttonOptions.buttonType) {
      case Constants.ButtonType.SHORT:
        buttonType = ButtonType.BUTTON_TYPE_SHORT;
        break;
      case Constants.ButtonType.LONG:
        buttonType = ButtonType.BUTTON_TYPE_LONG;
        break;
      case Constants.ButtonType.PLAIN:
        buttonType = ButtonType.BUTTON_TYPE_PLAIN;
        break;
      case Constants.ButtonType.BUY:
        buttonType = ButtonType.BUTTON_TYPE_BUY;
        break;
      case Constants.ButtonType.DONATE:
        buttonType = ButtonType.BUTTON_TYPE_DONATE;
        break;
      case Constants.ButtonType.BOOK:
        buttonType = ButtonType.BUTTON_TYPE_BOOK;
        break;
      case Constants.ButtonType.CHECKOUT:
        buttonType = ButtonType.BUTTON_TYPE_CHECKOUT;
        break;
      case Constants.ButtonType.ORDER:
        buttonType = ButtonType.BUTTON_TYPE_ORDER;
        break;
      case Constants.ButtonType.PAY:
        buttonType = ButtonType.BUTTON_TYPE_PAY;
        break;
      case Constants.ButtonType.SUBSCRIBE:
        buttonType = ButtonType.BUTTON_TYPE_SUBSCRIBE;
        break;
    }
    switch (buttonOptions.buttonSizeMode) {
      case Constants.ButtonSizeMode.STATIC:
        buttonSizeMode = ButtonSizeMode.BUTTON_SIZE_MODE_STATIC;
        break;
      case Constants.ButtonSizeMode.FILL:
        buttonSizeMode = ButtonSizeMode.BUTTON_SIZE_MODE_FILL;
        break;
    }

    let buttonRootNode = buttonOptions.buttonRootNode === undefined ?
        ButtonRootNode.BUTTON_ROOT_NODE_UNKNOWN :
        ButtonRootNode.BUTTON_ROOT_NODE_INVALID;

    if (buttonOptions.buttonRootNode instanceof ShadowRoot) {
      buttonRootNode = ButtonRootNode.BUTTON_ROOT_NODE_SHADOWROOT;
    } else if (buttonOptions.buttonRootNode instanceof HTMLDocument) {
      buttonRootNode = ButtonRootNode.BUTTON_ROOT_NODE_DOCUMENT;
    }

    return {
      buttonType: buttonType,
      buttonSizeMode: buttonSizeMode,
      buttonRootNode: buttonRootNode,
    };
  }
}

// Start loading pay frame early
PayFrameHelper.load();

export {
  ButtonRootNode,
  ButtonType,
  ButtonSizeMode,
  BuyFlowActivityMode,
  BuyFlowActivityReason,
  BuyFlowMode,
  MerchantCallbackTrigger,
  PayFrameHelper,
  PostMessageEventType,
  PublicErrorCode,
};
