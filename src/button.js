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
import {injectStyleSheet} from './element_injector.js';

/** @private */
let hasStylesheetBeenInjected_ = false;

/**
 * Return a <div> element containing a Google Pay payment button.
 *
 * @param {ButtonOptions=} options
 * @return {!Element}
 */
function createButtonHelper(options = {}) {
  if (null) {
    const button = createButtonWithCardInfo();
    if (options.onClick) {
      button.addEventListener('click', options.onClick);
    }
    return button;
  }

  if (!hasStylesheetBeenInjected_) {
    injectStyleSheet(Constants.BUTTON_STYLE);
    injectStyleSheet(getLongGPayButtonCss_());
    hasStylesheetBeenInjected_ = true;
  }
  const button = document.createElement('button');
  if (!Object.values(Constants.ButtonType).includes(options.buttonType)) {
    options.buttonType = Constants.ButtonType.LONG;
  }
  if (!Object.values(Constants.ButtonColor).includes(options.buttonColor)) {
    options.buttonColor = Constants.ButtonColor.DEFAULT;
  }
  if (options.buttonColor == Constants.ButtonColor.DEFAULT) {
    options.buttonColor = Constants.ButtonColor.BLACK;
  }
  const classForGpayButton = getClassForGpayButton_(options);
  button.setAttribute(
      'class', `${Constants.GPAY_BUTTON_CLASS} ${classForGpayButton}`);
  addButtonEventListenersForStyling(button);

  if (options.onClick) {
    button.addEventListener('click', options.onClick);
  } else {
    throw new Error('Parameter \'onClick\' must be set.');
  }
  const div = document.createElement('div');
  div.appendChild(button);

  if (options.hasOffers) {
    if (null) {
      button.setAttribute(
          'style', Constants.GPAY_BUTTON_WITH_OFFER_ICON_ADDITIONAL_STYLE);
      addOfferDescription(button, options);
    } else if (null) {
      addOfferIcon(button);
    } else if (google.payments.api
                   .OffersButtonWithPercentSignAndOffersAvailableText) {
      button.setAttribute(
          'style', Constants.GPAY_BUTTON_WITH_OFFER_ICON_ADDITIONAL_STYLE);
      addOfferIcon(button);
      addOfferDescription(button, options);
    }
  }

  return div;
}

/**
 * Return a <div> element containing a Google Pay payment button with the user's
 * card information (last 4 digits of card number and card network).
 *
 * @return {!Element}
 * @private
 */
function createButtonWithCardInfo() {
  if (!hasStylesheetBeenInjected_) {
    injectStyleSheet(Constants.GPAY_BUTTON_CARD_INFO_BUTTON_STYLE);
    hasStylesheetBeenInjected_ = true;
  }
  const button = document.createElement('button');
  button.setAttribute('class', Constants.GPAY_BUTTON_CARD_INFO_CLASS);
  button.setAttribute('style', Constants.GPAY_BUTTON_WITH_CARD_INFO_IMAGE);
  addButtonEventListenersForStyling(button);
  const div = document.createElement('div');
  div.appendChild(button);
  return div;
}

/**
 * Add the offer icon to the top corner of the Google Pay Button.
 *
 * @param {!Element} button
 * @private
 */
function addOfferIcon(button) {
  // TODO: Update offer button creation logic to use gStatic link
  // instead of the raw SVG text
  const svgText =
      "<svg width='20px' height='20px' viewBox='0 0 20 20' " +
      "version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink=" +
      "'http://www.w3.org/1999/xlink'><defs><path d='M19.41,9.58 L10.41,0.58 " +
      "C10.05,0.22 9.55,0 9,0 L2,0 C0.9,0 0,0.9 0,2 L0,9 C0,9.55 0.22,10.05 " +
      "0.59,10.42 L9.59,19.42 C9.95,19.78 10.45,20 11,20 C11.55,20 12.05,19.78 " +
      "12.41,19.41 L19.41,12.41 C19.78,12.05 20,11.55 20,11 C20,10.45 19.77," +
      "9.94 19.41,9.58 Z' id='path-1'></path></defs><g id='buttons_10.05'" +
      " stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'>" +
      "<g id='Artboard' transform='translate(-40.000000, -43.000000)'>" +
      "<g id='Group-3' transform='translate(40.000000, 43.000000)'>" +
      "<g id='Group-2-Copy-2'><g id='Group-Copy'><g id='ic_loyalty_24px'>" +
      "<mask id='mask-2' fill='white'><use xlink:href='#path-1'></use>" +
      "</mask><use id='gpay-Shape' fill='#FF6100' fill-rule='nonzero' " +
      "xlink:href='#path-1'></use><path d='M3.5,5 C2.67,5 2,4.33 2,3.5 C2," +
      "2.67 2.67,2 3.5,2 C4.33,2 5,2.67 5,3.5 C5,4.33 4.33,5 3.5,5 Z' " +
      "id='Path' fill='#FFFFFF' fill-rule='nonzero' mask='url(#mask-2)'>" +
      "</path></g></g></g><g id='Group-13-Copy-7' transform='translate" +
      "(6.000000, 6.000000)' fill='#FFFFFF' fill-rule='nonzero'>" +
      "<g id='Group-13-Copy-2'><path d='M2.15217391,4.55172414 C0.963561082," +
      "4.55172414 1.99840144e-14,3.53278598 1.99840144e-14,2.27586207 " +
      "C1.99840144e-14,1.01893816 0.963561082,6.30606678e-14 2.15217391,6." +
      "30606678e-14 C3.34078674,6.30606678e-14 4.30434783,1.01893816 4.30434783," +
      "2.27586207 C4.30434783,3.53278598 3.34078674,4.55172414 2.15217391," +
      "4.55172414 Z M2.15217391,3.31034483 C2.69245247,3.31034483 3.13043478,2." +
      "84719112 3.13043478,2.27586207 C3.13043478,1.70453302 2.69245247," +
      "1.24137931 2.15217391,1.24137931 C1.61189535,1.24137931 1.17391304,1" +
      ".70453302 1.17391304,2.27586207 C1.17391304,2.84719112 1.61189535,3." +
      "31034483 2.15217391,3.31034483 Z' id='Combined-Shape'></path>" +
      "<path d='M6.84782609,9 C5.65921326,9 4.69565217,7.98106184 4.69565217," +
      "6.72413793 C4.69565217,5.46721402 5.65921326,4.44827586 6.84782609," +
      "4.44827586 C8.03643892,4.44827586 9,5.46721402 9,6.72413793 C9,7.98106184" +
      " 8.03643892,9 6.84782609,9 Z M6.84782609,7.75862069 C7.38810465," +
      "7.75862069 7.82608696,7.29546698 7.82608696,6.72413793 C7.82608696" +
      ",6.15280888 7.38810465,5.68965517 6.84782609,5.68965517 C6.30754753," +
      "5.68965517 5.86956522,6.15280888 5.86956522,6.72413793 C5.86956522," +
      "7.29546698 6.30754753,7.75862069 6.84782609,7.75862069 Z' " +
      "id='Combined-Shape'></path><polygon id='Rectangle' " +
      "transform='translate(4.497720, 4.541938) rotate(34.000000) " +
      "translate(-4.497720, -4.541938) ' points='3.77901778 -0.202295978 " +
      "4.9740273 -0.171019161 5.21642263 9.28617278 4.02141311 9.25489596'>" +
      "</polygon></g></g></g></g></g></svg>";
  const svgIcon = dom.constHtmlToNode(Const.from(svgText));
  svgIcon.setAttribute('class', Constants.GPAY_OFFER_ICON_CLASS);
  button.appendChild(svgIcon);
  injectStyleSheet(Constants.GPAY_OFFER_ICON_STYLE);
}

/**
 * Add the offer description under the Google Pay button.
 *
 * @param {!Element} button
 * @param {!ButtonOptions} options
 * @private
 */
function addOfferDescription(button, options) {
  const pTag = document.createElement('p');
  pTag.textContent = 'Offer available';
  button.parentNode.appendChild(pTag);
  if (options.buttonType === Constants.ButtonType.SHORT) {
    pTag.setAttribute(
        'class', `${Constants.GPAY_OFFER_DESCRIPTION_CLASS} short`);
  } else {
    pTag.setAttribute(
        'class', `${Constants.GPAY_OFFER_DESCRIPTION_CLASS} long`);
  }
  ['mouseover', 'mouseout'].map(function(e) {
    button.addEventListener(e, /** @this {!Element}*/ function(e) {
      pTag.classList.toggle('gpay-btn-clicked', e.type == 'mouseover');
    });
  });
  injectStyleSheet(Constants.GPAY_OFFER_DESCRIPTION_STYLE);
}

/**
 * Applies the hover, active, and focus event listeners to update
 * CSS styles.
 *
 * @param {!Element} button
 * @private
 */
function addButtonEventListenersForStyling(button) {
  // Set :hover styling
  ['mouseover', 'mouseout'].map(function(e) {
    button.addEventListener(e, /** @this {!Element}*/ function(e) {
      // The second argument in toggle either sets or removes the class
      // depending on the boolean value passed in. We only want to set it
      // when the initial event takes place (i.e: mouseover, mousedown, focus),
      // and otherwise we remove it.
      button.classList.toggle('hover', e.type == 'mouseover');
      const icon = document.getElementById('gpay-Shape');
      if (icon !== null) {
        icon.classList.toggle('hover', e.type == 'mouseover');
      }
    });
  });

  // Set :active styling
  ['mousedown', 'mouseup', 'mouseout'].map(function(e) {
    button.addEventListener(e, /** @this {!Element}*/ function(e) {
      button.classList.toggle('active', e.type == 'mousedown');
    });
  });

  // Set :focus styling
  ['focus', 'blur'].map(function(e) {
    button.addEventListener(e, /** @this {!Element}*/ function(e) {
      button.classList.toggle('focus', e.type == 'focus');
    });
  });
}

/**
 * Gets the class for the Google Pay button.
 *
 * @param {!ButtonOptions} options
 * @return {string}
 * @private
 */
function getClassForGpayButton_(options) {
  if (options.buttonType == Constants.ButtonType.LONG) {
    if (options.buttonColor == Constants.ButtonColor.WHITE) {
      return 'white long';
    } else {
      return 'black long';
    }
  } else if (options.buttonType == Constants.ButtonType.SHORT) {
    if (options.buttonColor == Constants.ButtonColor.WHITE) {
      return 'white short';
    } else {
      return 'black short';
    }
  }
  return 'black long';
}

/**
 * Gets the CSS for the long gpay button depending on the locale.
 *
 * @return {string}
 * @private
 */
function getLongGPayButtonCss_() {
  // navigator.userLanguage is used for IE
  const defaultLocale = 'en';
  let locale = navigator.language ||
      /** @type {string} */ (navigator.userLanguage) || defaultLocale;
  if (locale != defaultLocale) {
    // Get language part of locale (e.g: fr-FR is fr) and check if it is
    // supported, otherwise default to en
    locale = locale.substring(0, 2);
    if (!Constants.BUTTON_LOCALE_TO_MIN_WIDTH[locale]) {
      locale = defaultLocale;
    }
  }
  const minWidth = Constants.BUTTON_LOCALE_TO_MIN_WIDTH[locale];

  return `
    .${Constants.GPAY_BUTTON_CLASS}.long {
      min-width: ${minWidth}px;
      width: 240px;
    }

    .${Constants.GPAY_BUTTON_CLASS}.white.long {
      background-image: url(https://www.gstatic.com/instantbuy/svg/light/${
      locale}.svg);
    }

    .${Constants.GPAY_BUTTON_CLASS}.black.long {
      background-image: url(https://www.gstatic.com/instantbuy/svg/dark/${
      locale}.svg);
    }`;
}

/**
 * Returns true if the white color is selected.
 *
 * @param {!ButtonOptions} options
 * @return {boolean} True if the white color is selected.
 * @private
 */
function isWhiteColor_(options) {
  return options.buttonColor == Constants.ButtonColor.WHITE;
}

/** Visible for testing. */
function resetButtonStylesheet() {
  hasStylesheetBeenInjected_ = false;
}

export {
  createButtonHelper,
  resetButtonStylesheet
};
