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


const MAX_Z_INDEX = 2147483647;

const Constants = {};

/**
 * Timeout limit for handling callbacks in milliseconds.
 *
 * @const {number}
 */
Constants.DEFAULT_REQUEST_TIMEOUT_LIMIT = 30000;

Constants.REQUEST_TIMEOUT_MESSAGE = 'REQUEST_TIMEOUT';

/**
 * Supported callback intents.
 *
 * @enum {string}
 */
Constants.CALLBACK_INTENTS = {
  PAYMENT_AUTHORIZATION: 'PAYMENT_AUTHORIZATION',
  SHIPPING_ADDRESS: 'SHIPPING_ADDRESS',
  SHIPPING_OPTION: 'SHIPPING_OPTION',
  UNKNOWN_INTENT: 'UNKNOWN_INTENT'
};

/**
 * @type {string}
 */
Constants.CALLBACK_DATA_RESPONSE_TYPE = 'paymentDataCallbackResponse';

/**
 * @type {string}
 */
Constants.PAYMENT_AUTHORIZATION_RESPONSE_TYPE = 'paymentAuthorizationResponse';

/**
 * Supported environments.
 *
 * @enum {string}
 */
Constants.Environment = {
  CANARY: 'CANARY',
  LOCAL: 'LOCAL',
  PREPROD: 'PREPROD',
  PRODUCTION: 'PRODUCTION',
  SANDBOX: 'SANDBOX',
  TEST: 'TEST',
  TIN: 'TIN',
};

/**
 * Supported payment methods.
 *
 * @enum {string}
 */
Constants.PaymentMethod = {
  CARD: 'CARD',
  TOKENIZED_CARD: 'TOKENIZED_CARD',
  UPI: 'UPI',
};

/**
 * Auth methods.
 *
 * @enum {string}
 */
Constants.AuthMethod = {
  CRYPTOGRAM_3DS: 'CRYPTOGRAM_3DS',
  PAN_ONLY: 'PAN_ONLY',
};

/**
 * Returned result status.
 *
 * @enum {string}
 */
Constants.ResponseStatus = {
  CANCELED: 'CANCELED',
  DEVELOPER_ERROR: 'DEVELOPER_ERROR',
};

/**
 * Supported total price status.
 *
 * @enum {string}
 */
Constants.TotalPriceStatus = {
  ESTIMATED: 'ESTIMATED',
  FINAL: 'FINAL',
  NOT_CURRENTLY_KNOWN: 'NOT_CURRENTLY_KNOWN',
};

/**
 * Supported Google Pay payment button type.
 *
 * @enum {string}
 */
Constants.ButtonType = {
  SHORT: 'short',
  LONG: 'long',
  PLAIN: 'plain',
  BUY: 'buy',
  DONATE: 'donate',
  BOOK: 'book',
  CHECKOUT: 'checkout',
  ORDER: 'order',
  PAY: 'pay',
  SUBSCRIBE: 'subscribe',
};

/**
 * Supported button colors.
 *
 * @enum {string}
 */
Constants.ButtonColor = {
  DEFAULT: 'default',  // Currently defaults to black.
  BLACK: 'black',
  WHITE: 'white',
};

/**
 * Supported button size modes.
 *
 * @enum {string}
 */
Constants.ButtonSizeMode = {
  STATIC: 'static',  // Current Default behavior
  FILL: 'fill',      // Match the size of the container element
};


/**
 * Id attributes.
 *
 * @enum {string}
 */
Constants.Id = {
  POPUP_WINDOW_CONTAINER: 'popup-window-container',
};

/** @const {string} */
Constants.STORAGE_KEY_PREFIX = 'google.payments.api.storage';

/** @const {string} */
Constants.IS_READY_TO_PAY_RESULT_KEY =
    Constants.STORAGE_KEY_PREFIX + '.isreadytopay.result';

/** @const {string} */
Constants.UPI_CAN_MAKE_PAYMENT_CACHE_KEY =
    Constants.STORAGE_KEY_PREFIX + '.upi.canMakePaymentCache';


Constants.CLASS_PREFIX = 'google-payments-';
Constants.IFRAME_ACTIVE_CONTAINER_CLASS =
    `${Constants.CLASS_PREFIX}activeContainer`;
Constants.IFRAME_CONTAINER_CLASS = `${Constants.CLASS_PREFIX}dialogContainer`;
Constants.IFRAME_STYLE_CENTER_CLASS = `${Constants.CLASS_PREFIX}dialogCenter`;
Constants.IFRAME_STYLE_CLASS = `${Constants.CLASS_PREFIX}dialog`;

Constants.IFRAME_STYLE = `
.${Constants.IFRAME_STYLE_CLASS} {
    animation: none 0s ease 0s 1 normal none running;
    background: none 0 0 / auto repeat scroll padding-box border-box #fff;
    background-blend-mode: normal;
    border: 0 none #333;
    border-radius: 8px 8px 0 0;
    border-collapse: separate;
    bottom: 0;
    box-shadow: #808080 0 3px 0 0, #808080 0 0 22px;
    box-sizing: border-box;
    letter-spacing: normal;
    max-height: 100%;
    overflow: visible;
    position: fixed;
    width: 100%;
    z-index: ${MAX_Z_INDEX};
    -webkit-appearance: none;
    left: 0;
}
@media (min-width: 480px) {
  .${Constants.IFRAME_STYLE_CLASS} {
    width: 480px !important;
    left: -240px !important;
    margin-left: calc(100vw - 100vw / 2) !important;
  }
}
.${Constants.IFRAME_CONTAINER_CLASS} {
  background-color: rgba(0,0,0,0.26);
  bottom: 0;
  height: 100%;
  left: 0;
  position: absolute;
  right: 0;
}
.iframeContainer {
  -webkit-overflow-scrolling: touch;
}
`;

Constants.IFRAME_STYLE_CENTER = `
.${Constants.IFRAME_STYLE_CENTER_CLASS} {
  animation: none 0s ease 0s 1 normal none running;
  background-blend-mode: normal;
  background: none 0 0 / auto repeat scroll padding-box border-box #fff;
  border-collapse: separate;
  border-radius: 8px;
  border: 0px none #333;
  bottom: auto;
  box-shadow: #808080 0 0 22px;
  box-sizing: border-box;
  left: -240px;
  letter-spacing: normal;
  margin-left: calc(100vw - 100vw / 2) !important;
  max-height: 90%;
  overflow: visible;
  position: absolute;
  top: 100%;
  transform: scale(0.8);
  width: 480px;
  z-index: ${MAX_Z_INDEX};
  -webkit-appearance: none;
}
@media (min-height: 667px) {
  .${Constants.IFRAME_STYLE_CENTER_CLASS} {
    max-height: 600px;
  }
}
.${Constants.IFRAME_ACTIVE_CONTAINER_CLASS} {
  top: 50%;
  transform: scale(1.0) translateY(-50%);
}
`;

/**
 * @typedef {!Object<string, !Object<string, number>>}
 */
Constants.ButtonMinWidths;

/**
 * Min-Width for button assets for each type and locale.
 * @const {!Constants.ButtonMinWidths}
 */
Constants.BUTTON_MIN_WIDTH = {
  'buy': {
    'en': 152,
    'ar': 189,
    'bg': 163,
    'ca': 182,
    'cs': 192,
    'da': 154,
    'de': 183,
    'el': 178,
    'es': 183,
    'et': 147,
    'fi': 148,
    'fr': 183,
    'hr': 157,
    'id': 186,
    'it': 182,
    'ja': 148,
    'ko': 137,
    'ms': 186,
    'nl': 167,
    'no': 158,
    'pl': 182,
    'pt': 193,
    'ru': 206,
    'sk': 157,
    'sl': 211,
    'sr': 146,
    'sv': 154,
    'th': 146,
    'tr': 161,
    'uk': 207,
    'zh': 156,
  },
  'book': {
    'ar': 205,
    'bg': 233,
    'ca': 187,
    'cs': 213,
    'da': 162,
    'de': 176,
    'el': 180,
    'en': 161,
    'es': 188,
    'et': 186,
    'fi': 152,
    'fr': 197,
    'hr': 198,
    'id': 195,
    'it': 178,
    'ja': 150,
    'ko': 150,
    'ms': 211,
    'nl': 178,
    'no': 195,
    'pl': 221,
    'pt': 208,
    'ru': 265,
    'sk': 206,
    'sl': 266,
    'sr': 196,
    'sv': 161,
    'th': 150,
    'tr': 238,
    'uk': 248,
    'zh': 158,
  },
  'checkout': {
    'ar': 245,
    'bg': 200,
    'ca': 268,
    'cs': 175,
    'da': 162,
    'de': 188,
    'el': 286,
    'en': 201,
    'es': 188,
    'et': 171,
    'fi': 158,
    'fr': 170,
    'hr': 166,
    'id': 226,
    'it': 256,
    'ja': 150,
    'ko': 150,
    'ms': 291,
    'nl': 178,
    'no': 230,
    'pl': 187,
    'pt': 271,
    'ru': 283,
    'sk': 176,
    'sl': 313,
    'sr': 153,
    'sv': 172,
    'th': 168,
    'tr': 195,
    'uk': 216,
    'zh': 158,
  },
  'donate': {
    'ar': 205,
    'bg': 205,
    'ca': 162,
    'cs': 212,
    'da': 171,
    'de': 186,
    'el': 163,
    'en': 180,
    'es': 165,
    'et': 150,
    'fi': 171,
    'fr': 225,
    'hr': 182,
    'id': 237,
    'it': 157,
    'ja': 167,
    'ko': 150,
    'ms': 201,
    'nl': 187,
    'no': 171,
    'pl': 252,
    'pt': 175,
    'ru': 342,
    'sk': 178,
    'sl': 242,
    'sr': 171,
    'sv': 181,
    'th': 158,
    'tr': 181,
    'uk': 256,
    'zh': 158,
  },
  'order': {
    'ar': 198,
    'bg': 195,
    'ca': 247,
    'cs': 198,
    'da': 166,
    'de': 190,
    'el': 208,
    'en': 170,
    'es': 157,
    'et': 150,
    'fi': 150,
    'fr': 226,
    'hr': 201,
    'id': 195,
    'it': 171,
    'ja': 150,
    'ko': 150,
    'ms': 195,
    'nl': 192,
    'no': 171,
    'pl': 190,
    'pt': 177,
    'ru': 207,
    'sk': 190,
    'sl': 240,
    'sr': 165,
    'sv': 176,
    'th': 151,
    'tr': 188,
    'uk': 216,
    'zh': 158,
  },
  'pay': {
    'ar': 202,
    'bg': 200,
    'ca': 160,
    'cs': 183,
    'da': 162,
    'de': 188,
    'el': 185,
    'en': 150,
    'es': 162,
    'et': 150,
    'fi': 158,
    'fr': 170,
    'hr': 172,
    'id': 192,
    'it': 155,
    'ja': 150,
    'ko': 150,
    'ms': 192,
    'nl': 178,
    'no': 162,
    'pl': 187,
    'pt': 182,
    'ru': 213,
    'sk': 176,
    'sl': 225,
    'sr': 153,
    'sv': 172,
    'th': 168,
    'tr': 150,
    'uk': 216,
    'zh': 158,
  },
  'subscribe': {
    'ar': 221,
    'bg': 217,
    'ca': 226,
    'cs': 201,
    'da': 192,
    'de': 208,
    'el': 180,
    'en': 202,
    'es': 206,
    'et': 150,
    'fi': 150,
    'fr': 206,
    'hr': 178,
    'id': 260,
    'it': 190,
    'ja': 150,
    'ko': 150,
    'ms': 216,
    'nl': 208,
    'no': 192,
    'pl': 221,
    'pt': 196,
    'ru': 243,
    'sk': 193,
    'sl': 333,
    'sr': 217,
    'sv': 228,
    'th': 213,
    'tr': 173,
    'uk': 305,
    'zh': 158,
  },
};

/**
 * Min-Width for new button assets for each type and locale.
 * @const {!Constants.ButtonMinWidths}
 */
Constants.NEW_BUTTON_MIN_WIDTH = {
  'buy': {
    'en': 168,
    'ar': 204,
    'bg': 215,
    'ca': 200,
    'cs': 164,
    'da': 170,
    'de': 185,
    'el': 175,
    'es': 208,
    'et': 158,
    'fi': 156,
    'fr': 209,
    'hr': 176,
    'id': 191,
    'it': 201,
    'ja': 183,
    'ko': 145,
    'ms': 191,
    'nl': 185,
    'no': 175,
    'pl': 164,
    'pt': 221,
    'ru': 211,
    'sk': 173,
    'sl': 234,
    'sr': 161,
    'sv': 179,
    'th': 148,
    'tr': 171,
    'uk': 207,
    'zh': 174,
  },
  'book': {
    'en': 178,
    'ar': 201,
    'bg': 243,
    'ca': 201,
    'cs': 200,
    'da': 179,
    'de': 190,
    'el': 194,
    'es': 202,
    'et': 186,
    'fi': 162,
    'fr': 210,
    'hr': 211,
    'id': 236,
    'it': 194,
    'ja': 183,
    'ko': 145,
    'ms': 223,
    'nl': 193,
    'no': 186,
    'pl': 199,
    'pt': 221,
    'ru': 271,
    'sk': 218,
    'sl': 273,
    'sr': 209,
    'sv': 177,
    'th': 162,
    'tr': 242,
    'uk': 263,
    'zh': 174,
  },
  'checkout': {
    'en': 213,
    'ar': 233,
    'bg': 212,
    'ca': 275,
    'cs': 172,
    'da': 178,
    'de': 202,
    'el': 289,
    'es': 274,
    'et': 155,
    'fi': 156,
    'fr': 191,
    'hr': 182,
    'id': 237,
    'it': 264,
    'ja': 183,
    'ko': 145,
    'ms': 264,
    'nl': 193,
    'no': 178,
    'pl': 201,
    'pt': 196,
    'ru': 226,
    'sk': 190,
    'sl': 317,
    'sr': 176,
    'sv': 193,
    'th': 183,
    'tr': 202,
    'uk': 227,
    'zh': 174,
  },
  'donate': {
    'en': 194,
    'ar': 200,
    'bg': 217,
    'ca': 262,
    'cs': 174,
    'da': 187,
    'de': 199,
    'el': 179,
    'es': 180,
    'et': 176,
    'fi': 179,
    'fr': 198,
    'hr': 189,
    'id': 247,
    'it': 270,
    'ja': 183,
    'ko': 145,
    'ms': 214,
    'nl': 201,
    'no': 187,
    'pl': 289,
    'pt': 190,
    'ru': 263,
    'sk': 193,
    'sl': 251,
    'sr': 187,
    'sv': 195,
    'th': 179,
    'tr': 190,
    'uk': 264,
    'zh': 174,
  },
  'order': {
    'en': 185,
    'ar': 208,
    'bg': 227,
    'ca': 271,
    'cs': 186,
    'da': 182,
    'de': 203,
    'el': 219,
    'es': 251,
    'et': 151,
    'fi': 191,
    'fr': 236,
    'hr': 198,
    'id': 208,
    'it': 186,
    'ja': 183,
    'ko': 145,
    'ms': 208,
    'nl': 206,
    'no': 186,
    'pl': 170,
    'pt': 192,
    'ru': 220,
    'sk': 204,
    'sl': 249,
    'sr': 187,
    'sv': 199,
    'th': 166,
    'tr': 196,
    'uk': 227,
    'zh': 174,
  },
  'pay': {
    'en': 166,
    'ar': 198,
    'bg': 212,
    'ca': 176,
    'cs': 172,
    'da': 178,
    'de': 202,
    'el': 197,
    'es': 178,
    'et': 170,
    'fi': 168,
    'fr': 185,
    'hr': 187,
    'id': 206,
    'it': 171,
    'ja': 167,
    'ko': 145,
    'ms': 206,
    'nl': 193,
    'no': 178,
    'pl': 201,
    'pt': 196,
    'ru': 257,
    'sk': 190,
    'sl': 235,
    'sr': 170,
    'sv': 187,
    'th': 183,
    'tr': 147,
    'uk': 232,
    'zh': 174,
  },
  'subscribe': {
    'en': 215,
    'ar': 222,
    'bg': 229,
    'ca': 228,
    'cs': 189,
    'da': 206,
    'de': 219,
    'el': 194,
    'es': 218,
    'et': 151,
    'fi': 154,
    'fr': 218,
    'hr': 193,
    'id': 268,
    'it': 204,
    'ja': 215,
    'ko': 145,
    'ms': 228,
    'nl': 220,
    'no': 206,
    'pl': 216,
    'pt': 209,
    'ru': 252,
    'sk': 206,
    'sl': 334,
    'sr': 206,
    'sv': 238,
    'th': 223,
    'tr': 183,
    'uk': 308,
    'zh': 174,
  },
};

/**
 * Name of the graypane.
 *
 * @const {string}
 */
Constants.GPAY_GRAYPANE = 'gpay-graypane';

/**
 * Class used for the gpay button.
 *
 * @const {string}
 */
Constants.GPAY_BUTTON_CLASS = 'gpay-button';

/**
 * Label used for the Google Pay button for accessibility (set for 'title' and
 * 'aria-labelledby' attribute).
 *
 * @const {string}
 */
Constants.GPAY_BUTTON_LABEL = 'Google Pay';

Constants.GPAY_BUTTON_TYPE = 'button';

/**
 * Class used to render new styles for new Gpay button assets.
 * @const {string}
 */
Constants.NEW_BUTTON_STYLE_CLASS = 'new_style';
Constants.NEW_BUTTON_FILL_STYLE_CLASS = 'fill-new-style';

/**
 * Start and end position for the browser locale.
 */
Constants.BROWSER_LOCALE_START = 0;
Constants.BROWSER_LOCALE_END = 5;

/**
 * Attributes added to the GPay Button for accessibility.
 * @enum {string}
 */
Constants.GpayButtonAttribute = {
  TYPE: 'type',
  ARIA_LABEL: 'aria-label',
};

Constants.BUTTON_STYLE = `
.${Constants.GPAY_BUTTON_CLASS} {
  background-origin: content-box;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: contain;
  border: 0px;
  border-radius: 4px;
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
  cursor: pointer;
  height: 40px;
  min-height: 40px;
  padding: 12px 24px 10px;
  width: 240px;
}

.${Constants.GPAY_BUTTON_CLASS}.black {
  background-color: #000;
  box-shadow: none;
}

.${Constants.GPAY_BUTTON_CLASS}.white {
  background-color: #fff;
}

.${Constants.GPAY_BUTTON_CLASS}.short, .${Constants.GPAY_BUTTON_CLASS}.plain {
  min-width: 90px;
  width: 160px;
}

.${Constants.GPAY_BUTTON_CLASS}.black.short, .${
    Constants.GPAY_BUTTON_CLASS}.black.plain {
  background-image: url(https://www.gstatic.com/instantbuy/svg/dark_gpay.svg);
}

.${Constants.GPAY_BUTTON_CLASS}.black.short.${
    Constants.NEW_BUTTON_STYLE_CLASS}, .${
    Constants.GPAY_BUTTON_CLASS}.black.plain.${
    Constants.NEW_BUTTON_STYLE_CLASS} {
  background-image: url(https://www.gstatic.com/instantbuy/svg/refreshedgraphicaldesign/dark_gpay.svg);
  min-width: 160px;
  background-size: contain;
}

.${Constants.GPAY_BUTTON_CLASS}.white.short, .${
    Constants.GPAY_BUTTON_CLASS}.white.plain {
  background-image: url(https://www.gstatic.com/instantbuy/svg/light_gpay.svg);
}

.${Constants.GPAY_BUTTON_CLASS}.black.active {
  background-color: #5f6368;
}

.${Constants.GPAY_BUTTON_CLASS}.black.hover {
  background-color: #3c4043;
}

.${Constants.GPAY_BUTTON_CLASS}.white.active {
  background-color: #fff;
}

.${Constants.GPAY_BUTTON_CLASS}.white.focus {
  box-shadow: #e8e8e8 0 1px 1px 0, #e8e8e8 0 1px 3px;
}

.${Constants.GPAY_BUTTON_CLASS}.white.hover {
  background-color: #f8f8f8;
}

.${Constants.GPAY_BUTTON_CLASS}-fill, .${Constants.GPAY_BUTTON_CLASS}-fill > .${
    Constants.GPAY_BUTTON_CLASS}.white, .${
    Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.black {
  width: 100%;
  height: inherit;
}

.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS},
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.black {
  width: 100%;
  height: inherit;
  background-size: contain;
}

.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.white,
  .${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.black {
    padding: 12px 15% 10px;
}

.${Constants.GPAY_BUTTON_CLASS}.donate, .${Constants.GPAY_BUTTON_CLASS}.book,
.${Constants.GPAY_BUTTON_CLASS}.checkout,
.${Constants.GPAY_BUTTON_CLASS}.subscribe, .${Constants.GPAY_BUTTON_CLASS}.pay,
.${Constants.GPAY_BUTTON_CLASS}.order {
    padding: 9px 24px;
}

.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.donate,
.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.book,
.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.checkout,
.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.order,
.${Constants.GPAY_BUTTON_CLASS}-fill > .${Constants.GPAY_BUTTON_CLASS}.pay,
.${Constants.GPAY_BUTTON_CLASS}-fill > .${
    Constants.GPAY_BUTTON_CLASS}.subscribe {
    padding: 9px 15%;
}

.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.donate,
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.book,
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.checkout,
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.order,
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.pay,
.${Constants.GPAY_BUTTON_CLASS}-${Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CLASS}.subscribe {
    padding: 12px 15%;
    background-size: contain;
}

`;

/**
 * CSS for new GPay button.
 */
Constants.GPAY_BUTTON_NEW_STYLE = `
  .${Constants.GPAY_BUTTON_CLASS}.new_style {
    background-size: auto;
    border-radius: 100vh;
    padding: 11px 24px;
    box-sizing: border-box;
    border: 1px solid #747775;
    min-height: 48px;
    font-size: 20px;
    width: auto;
  }
`;

/**
 * Class used for the new gpay button with card info (last 4 digits, card net).
 *
 * @const {string}
 */
Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS = 'gpay-card-info-container';
Constants.GPAY_BUTTON_CARD_INFO_IFRAME_CLASS = 'gpay-card-info-iframe';
Constants.GPAY_BUTTON_CARD_INFO_IFRAME_FADE_IN_CLASS =
    'gpay-card-info-iframe-fade-in';

Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS =
    'gpay-card-info-animation-container';
Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS =
    'gpay-card-info-animation-gpay-logo';
Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_CONTAINER_CLASS =
    'gpay-card-info-placeholder-container';
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_BASE_CLASS =
    'gpay-card-info-animated-progress-bar';
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_CONTAINER_CLASS =
    'gpay-card-info-animated-progress-bar-container';
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_BASE_CLASS =
    'gpay-card-info-animated-progress-bar-indicator';
Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_FADE_OUT_CLASS =
    'gpay-card-info-animation-container-fade-out';
Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS =
    'gpay-card-info-placeholder-svg-container';
Constants.GPAY_BUTTON_CARD_INFO_GENERIC_CARD_ICON_URL_WHITE_BACKGROUND =
    'https://www.gstatic.com/images/icons/material/system/1x/payment_grey600_36dp.png';
Constants.GPAY_BUTTON_CARD_INFO_GENERIC_CARD_ICON_URL_BLACK_BACKGROUND =
    'https://www.gstatic.com/images/icons/material/system/1x/payment_white_36dp.png';

Constants.GPAY_BUTTON_WITH_CARD_INFO_IMAGE_SRC =
    'https://pay.google.com/gp/p/generate_gpay_btn_img';

Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_OLD_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_BASE_CLASS}
    `;
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_BASE_CLASS}-${
    Constants.NEW_BUTTON_STYLE_CLASS}
    `;
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_OLD_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_BASE_CLASS}
    `;
Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_BASE_CLASS}-${
    Constants.NEW_BUTTON_STYLE_CLASS}
    `;
Constants.GPAY_BUTTON_CARD_INFO_DARK_ANIMATION_CONTAINER_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS} ${
    Constants.NEW_BUTTON_STYLE_CLASS} black
    `;

Constants.GPAY_BUTTON_CARD_INFO_OLD_LIGHT_ANIMATION_CONTAINER_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS} white
    `;

Constants.GPAY_BUTTON_CARD_INFO_OLD_DARK_ANIMATION_CONTAINER_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS} black
    `;

Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_OLD_FILL_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill
    `;

Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_FILL_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS}
    `;

Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_DARK_GPAY_LOGO_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS} ${
    Constants.NEW_BUTTON_STYLE_CLASS} black
    `;

Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_OLD_DARK_GPAY_LOGO_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS} black
    `;

Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_OLD_LIGHT_GPAY_LOGO_CLASS = `
    ${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS} white
    `;

Constants.GPAY_BUTTON_CARD_INFO_BUTTON_STYLE = `
  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS} {
    padding: 0;
    position: relative;
    min-width: 240px;
    height: 40px;
    min-height: 40px;
    border-radius: 4px;
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px;
    cursor: pointer;
    border: 0px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.${
    Constants.NEW_BUTTON_STYLE_CLASS} {
    border-radius: 100vh;
    padding: 0;
    box-sizing: border-box;
    min-height: 48px;
    width: 240px;
    border: 1px solid #747775;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.black,
  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.black {
    background-color: #000;
    box-shadow: none;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.white,
  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.white {
    background-color: #fff;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.black.active {
    background-color: #5f6368;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.black.hover,
  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.black.hover {
    background-color: #3c4043;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.white.active {
    background-color: #fff;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.white.focus {
    box-shadow: #e8e8e8 0 1px 1px 0, #e8e8e8 0 1px 3px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}.white.hover,
  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.white.hover {
    background-color: #f8f8f8;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_IFRAME_CLASS} {
    border: 0;
    display: block;
    height: 100%;
    margin: auto;
    max-width: 100%;
    width: 240px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_CARD_INFO_IFRAME_CLASS},   .${
    Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_CARD_INFO_IFRAME_CLASS}{
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill,
    .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill > .${
    Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}{
    width: 100%;
    height: inherit;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS},
    .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} > .${
    Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}{
    width: 100%;
    height: inherit;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_CONTAINER_CLASS}, .${
    Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_CONTAINER_CLASS} {
    align-items: center;
    justify-content: center;
    width: 100%;
    padding-top: 3px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS}, .${
    Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS}{
    position: relative;
    width: 60%;
    height: inherit;
    max-height: 80%;
    margin-right: -20%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS} > svg {
    position: absolute;
    left: 0;
    height: 100%;
    max-width: 100%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS} > svg {
    position: absolute;
    left: 0;
    height: 100%;
    max-width: 100%;
  }
`;

Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_STYLE = `
  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS} {
    display: flex;
    width:100%;
    position: absolute;
    z-index: 100;
    height: 40px;
    border-radius: 4px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.${
    Constants.NEW_BUTTON_STYLE_CLASS} {
    border-radius: 100vh;
    width: 100%;
    left: 0%;
    top: 0%;
    height: 100%;
    overflow: hidden;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_CONTAINER_CLASS} {
    display: flex;
    width: 100%;
    height: 100%;
    margin: auto;
    justify-content: center;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_CONTAINER_CLASS} {
    display: flex;
    box-sizing: border-box;
    position: absolute;
    width: 100%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_BASE_CLASS} {
    border-radius: 4px 4px 0px 0px;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
    animation-name: gpayProgressFill;
    animation-timing-function: cubic-bezier(0.97, 0.33, 1, 1);
    background: #caccce;
    width: 100%;
    height: 3px;
    max-height: 3px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_BASE_CLASS} {
    border-radius: 4px 4px 0px 0px;
    max-width: 20px;
    min-width: 20px;
    height: 3px;
    max-height: 3px;
    background: linear-gradient(to right, #caccce 30%, #acaeaf 60%);
    animation-delay: 0.5s;
    animation-duration: 1.7s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: gpayPlaceHolderShimmer;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_BASE_CLASS}-${
    Constants.NEW_BUTTON_STYLE_CLASS} {
    border-radius: 4px 4px 0px 0px;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: 1;
    animation-name: gpayProgressFill;
    animation-timing-function: cubic-bezier(0.97, 0.33, 1, 1);
    background: #caccce;
    width: 100%;
    height: 2px;
    max-height: 2px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_BASE_CLASS}-${
    Constants.NEW_BUTTON_STYLE_CLASS} {
    border-radius: 4px 4px 0px 0px;
    max-width: 20px;
    min-width: 20px;
    height: 2px;
    max-height: 2px;
    background: linear-gradient(to right, #caccce 30%, #acaeaf 60%);
    animation-delay: 0.5s;
    animation-duration: 1.7s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: gpayPlaceHolderShimmer;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_IFRAME_FADE_IN_CLASS} {
    animation-fill-mode: forwards;
    animation-duration: 0.6s;
    animation-name: gpayIframeFadeIn;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_FADE_OUT_CLASS} {
    animation-fill-mode: forwards;
    animation-duration: 0.6s;
    animation-name: gpayPlaceHolderFadeOut;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS} {
    margin: 13px 7px 0px  39px;
    background-origin: content-box;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: contain;
    height: 17px;
    max-height: 17px;
    max-width: 41px;
    min-width: 41px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS}.black {
    background-image: url("https://www.gstatic.com/instantbuy/svg/dark_gpay.svg");
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS}.${
    Constants.NEW_BUTTON_STYLE_CLASS} {
    background-image: url("https://www.gstatic.com/instantbuy/svg/refreshedgraphicaldesign/dark_gpay.svg");
    background-size: contain;
    height: 19px;
    max-height: 19px;
    max-width: 50px;
    min-width: 50px;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS}.white {
    background-image: url("https://www.gstatic.com/instantbuy/svg/light_gpay.svg");
  }

  @keyframes gpayPlaceHolderShimmer{
    0% {
      margin-left: 0px;
    }
    100% {
      margin-left: calc(100% - 20px);
    }
  }

  @keyframes gpayIframeFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
  }

  @keyframes gpayPlaceHolderFadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
  }

  @keyframes gpayProgressFill {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}{
    top: 0;
    width: 100%;
    height: 100%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}.${
    Constants.NEW_BUTTON_STYLE_CLASS}{
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 100vh;
    left: 0%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-fill .${
    Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS}{
    background-position: right;
    margin: 0 0 0 0;
    max-width: none;
    width: 25%;
    height:inherit;
    max-height: 50%;
  }

  .${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS}-${
    Constants.NEW_BUTTON_FILL_STYLE_CLASS} .${
    Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_GPAY_LOGO_CLASS}{
    background-position: right;
    background-size: contain;
    margin: 0 0 0 0;
    max-width: none;
    width: 35%;
    min-width: 35%;
    height:inherit;
    max-height: 50%;
  }
`;

Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_WHITE = Const.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" direction="ltr" ' +
    'height="36px" width="130px"><style>@import url(//fonts.googleapis.com/css?family=Google+Sans:500)</style><line x1="2" y1="10.5" x2="2" ' +
    'y2="29.5" style="stroke: #d9d9d9; stroke-width:2"></line>' +
    '<image x="11" y="6" width="37.5" height="29" preserveAspectRatio="none" ' +
    'xlink:href="https://www.gstatic.com/images/icons/material/system/' +
    '1x/payment_grey600_36dp.png"></image>' +
    '<text x="52" y="25.5" class="small" style="font: 15px ' +
    '\'Google Sans\', sans-serif; fill: #5F6368">••••••</text></svg>');

Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_BLACK = Const.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" direction="ltr" ' +
    'height="36px" width="130px"><style>@import url(//fonts.googleapis.com/css?family=Google+Sans:500)</style><line x1="2" y1="10.5" x2="2" ' +
    'y2="29.5" style="stroke: #5F6368; stroke-width:2"></line>' +
    '<image x="11" y="6" width="37.5" height="29" preserveAspectRatio="none" ' +
    'xlink:href="https://www.gstatic.com/images/icons/material/system/' +
    '1x/payment_white_36dp.png"></image>' +
    '<text x="52" y="25.5" class="small" style="font: 15px ' +
    '\'Google Sans\', sans-serif; fill: #FFFFFF">••••••</text></svg>');

Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_NEW_BLACK = Const.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" direction="ltr" ' +
    'height="36px" width="130px"><style>@import url(//fonts.googleapis.com/css?family=Google+Sans:500)</style><line x1="2" y1="12.5" x2="2" ' +
    'y2="31.5" style="stroke: #5F6368; stroke-width:2"></line>' +
    '<image x="11" y="7" width="36.5" height="29" preserveAspectRatio="none" ' +
    'xlink:href="https://www.gstatic.com/images/icons/material/system/' +
    '1x/payment_white_36dp.png"></image>' +
    '<text x="52" y="26.5" class="small" style="font: 15px ' +
    '\'Google Sans\', sans-serif; fill: #FFFFFF">••••••</text></svg>');

Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_WHITE_FILL = Const.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" direction="ltr" ' +
    'viewBox="0 0 130 36"><style>@import url(//fonts.googleapis.com/css?family=Google+Sans:500)</style><line x1="8" y1="7" x2="8" ' +
    'y2="26" style="stroke: #d9d9d9; stroke-width:2"></line>' +
    '<image x="16" y="2.5" width="37.5" height="29" preserveAspectRatio="none" ' +
    'xlink:href="https://www.gstatic.com/images/icons/material/system/' +
    '1x/payment_grey600_36dp.png"></image>' +
    '<text x="57" y="22" class="small" style="font: 15px ' +
    '\'Google Sans\', sans-serif; fill: #5f6368">••••••</text></svg>');

Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_BLACK_FILL = Const.from(
    '<svg xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" direction="ltr" ' +
    'viewBox="0 0 130 36"><style>@import url(//fonts.googleapis.com/css?family=Google+Sans:500)</style><line x1="8" y1="7" x2="8" ' +
    'y2="26" style="stroke: #5f6368; stroke-width:2"></line>' +
    '<image x="16" y="2.5" width="37.5" height="29" preserveAspectRatio="none" ' +
    'xlink:href="https://www.gstatic.com/images/icons/material/system/' +
    '1x/payment_white_36dp.png"></image>' +
    '<text x="57" y="22" class="small" style="font: 15px ' +
    '\'Google Sans\', sans-serif; fill: #fff">••••••</text></svg>');

/**
 * Trusted domain for secure context validation
 *
 * @const {string}
 */
Constants.TRUSTED_DOMAIN = '.google.com';

export {Constants};
