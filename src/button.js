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
import {hashStringTo32BitInt, logDevErrorToConsole} from './utils.js';
import {injectStyleSheet} from './element_injector.js';

/**
 * The list of roots that have the common button CSS injected.
 * For example this list could be like [document, root1, root2]. This is to
 * prevent adding redundant css to each root.
 * @type {!Array<!ShadowRoot|!HTMLDocument>}
 */
let rootsWithInjectedStylesheet = [];
/**
 * The list of prop-specific button CSS injected for each root.
 * For example: [['buy_en', 'pay_zh'], ['donate_en']]. The order corresponds
 * to the rootsWithInjectedStylesheet, e.g. [document, root1, root2].
 * It means that for document, CSS of 'buy_en' and 'pay_zh' have been injected,
 * and for root1, button CSS of 'donate_en' have been injected.
 * @type {!Array<!Array<string>>}
 */
let injectedButtonPropsForEachRoot = [];
/**
 * @type {!Array<!ShadowRoot|!HTMLDocument>}
 * @private
 */
let injectedDynamicButtonStylesheetList_ = [];
/** @private */
let windowLocationHostname_ = window.location.hostname;
/**
 * @type {!Array}
 * @private
 */
let whitelistedDomainsHashedValueListForGpayButtonWithCardInfo_ =
    window['whitelistedDomainsHashedValueListForGpayButtonWithCardInfo'] || [];
/**
 * @type {!Array<number>}
 * @private
 */
let denylistedDomainsHashedValueListForGpayButtonWithCardInfo_ =
    window['denylistedDomainsHashedValueListForGpayButtonWithCardInfo'] || [];

/**
 * @type {!Array<number>}
 * @private
 */
let denylistedMerchentIdsHashedValueListForGpayButtonWithCardInfo_ =
    window['denylistedMerchentIdsHashedValueListForGpayButtonWithCardInfo'] ||
    [];

/**
 * Return a <div> element containing a Google Pay payment button.
 *
 * @param {ButtonOptions=} options
 * @param {string=} merchantId
 * @return {!Element}
 */
function createButtonHelper(options = {}, merchantId) {
  if (!Object.values(Constants.ButtonType).includes(options.buttonType)) {
    options.buttonType = Constants.ButtonType.LONG;
  }
  if (!Object.values(Constants.ButtonSizeMode)
           .includes(options.buttonSizeMode)) {
    options.buttonSizeMode = Constants.ButtonSizeMode.STATIC;
  }
  if (!Object.values(Constants.ButtonColor).includes(options.buttonColor) ||
      null) {
    options.buttonColor = Constants.ButtonColor.BLACK;
  }
  if (shouldRenderGPayButtonWithCardInfo_(options, merchantId)) {
    return createButtonWithCardInfo(options);
  }
  injectButtonStyleSheet(options);
  const button = document.createElement('button');
  addAttributesToButtonForAccessbility(button);

  // Defaulting the DEFAULT color as BLACK for static buttons.
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
  if (options.buttonSizeMode === Constants.ButtonSizeMode.FILL) {
    if (null) {
      div.setAttribute(
          'class',
          `${Constants.GPAY_BUTTON_CLASS}-${
              Constants.NEW_BUTTON_FILL_STYLE_CLASS}`);
    } else {
      div.setAttribute('class', `${Constants.GPAY_BUTTON_CLASS}-fill`);
    }
  }
  div.appendChild(button);

  return div;
}

/**
 * Return a <div> element containing a Google Pay payment button with the user's
 * card information (last 4 digits of card number and card network).
 *
 * @param {!ButtonOptions} options
 * @return {!Element}
 * @private
 */
function createButtonWithCardInfo(options) {
  if (!injectedDynamicButtonStylesheetList_.includes(
          options.buttonRootNode || document)) {
    injectStyleSheet(
        Constants.GPAY_BUTTON_CARD_INFO_BUTTON_STYLE, options.buttonRootNode);
    injectStyleSheet(
        Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_STYLE,
        options.buttonRootNode);
    injectedDynamicButtonStylesheetList_.push(
        options.buttonRootNode || document);
  }
  const classForGpayButton = getClassForGpayButton_(options);
  const buttonContainer = document.createElement('button');
  addAttributesToButtonForAccessbility(buttonContainer);
  // Adding the vanilla GPay button class to fix the top margin issue only for
  // www.jockey.com (b/129006185)
  const buttonContainerClass =
      `${
          hashStringTo32BitInt(windowLocationHostname_) === -1658203989 ?
              Constants.GPAY_BUTTON_CLASS :
              ''} ` +
      `${Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_CLASS} ${
          classForGpayButton}`;
  buttonContainer.setAttribute('class', buttonContainerClass);

  // Create the animation container element that contains both progress bar and
  // placeholder. For more detail on design, visit go/gpay-button-with-card-info
  const animationContainer = document.createElement('div');
  const animationContainerClass =
      shouldUseNewGraphicalAssetsForGpayButton(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_DARK_ANIMATION_CONTAINER_CLASS :
      isWhiteColor(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_OLD_LIGHT_ANIMATION_CONTAINER_CLASS :
      Constants.GPAY_BUTTON_CARD_INFO_OLD_DARK_ANIMATION_CONTAINER_CLASS;

  animationContainer.setAttribute('class', animationContainerClass);

  // Create the placeholder that will appear before/while the iframe containing
  // the image with the user's card information. The placeholder consists of
  // the GPay logo, vertical bar, generic card icon, and the text "****".
  const placeholderContainer = document.createElement('div');
  placeholderContainer.setAttribute(
      'class', Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_CONTAINER_CLASS);
  const gpayLogo = document.createElement('div');
  const gpayLogoClass = shouldUseNewGraphicalAssetsForGpayButton(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_DARK_GPAY_LOGO_CLASS :
      isWhiteColor(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_OLD_LIGHT_GPAY_LOGO_CLASS :
      Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_OLD_DARK_GPAY_LOGO_CLASS;
  gpayLogo.setAttribute('class', gpayLogoClass);
  // Create SVG element that contains vertical bar, generic card icon, and
  // the text "****".
  const placeholderSvgHtml = isWhiteColor(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_WHITE :
      (shouldUseNewGraphicalAssetsForGpayButton(options) ?
           Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_NEW_BLACK :
           Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_BLACK);
  const placeholderSvg = dom.constHtmlToNode(placeholderSvgHtml);

  // Create elements needed for the progress bar animation that will continue
  // until the iframe that contains the GPay button with card info image loads.
  const progressBarContainer = document.createElement('div');
  progressBarContainer.setAttribute(
      'class', Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_CONTAINER_CLASS);
  const progressBar = document.createElement('div');
  const progressBarClass = shouldUseNewGraphicalAssetsForGpayButton(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_CLASS :
      Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_OLD_CLASS;
  progressBar.setAttribute('class', progressBarClass);
  const progressBarIndicator = document.createElement('div');
  const progressBarIndicatorClass =
      shouldUseNewGraphicalAssetsForGpayButton(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_CLASS :
      Constants.GPAY_BUTTON_CARD_INFO_PROGRESS_BAR_INDICATOR_OLD_CLASS;
  progressBarIndicator.setAttribute('class', progressBarIndicatorClass);

  progressBar.appendChild(progressBarIndicator);
  placeholderContainer.appendChild(gpayLogo);
  if (options.buttonSizeMode !== Constants.ButtonSizeMode.FILL) {
    placeholderContainer.appendChild(placeholderSvg);
  } else {
    const placeholderSvgHtmlFill = isWhiteColor(options) ?
        Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_WHITE_FILL :
        Constants.GPAY_BUTTON_CARD_INFO_PLACEHOLDER_BLACK_FILL;
    const placeholderSvgFill = dom.constHtmlToNode(placeholderSvgHtmlFill);
    const placeholderSvgContainer = document.createElement('div');
    placeholderSvgContainer.appendChild(placeholderSvgFill);
    placeholderSvgContainer.setAttribute(
        'class', Constants.GPAY_BUTTON_PLACEHOLDER_SVG_CONTAINER_CLASS);
    placeholderContainer.appendChild(placeholderSvgContainer);
  }
  progressBarContainer.appendChild(progressBar);
  animationContainer.appendChild(placeholderContainer);
  animationContainer.appendChild(progressBarContainer);
  addButtonEventListenersForStyling(animationContainer);
  buttonContainer.appendChild(animationContainer);

  const buttonImageIframe =
      /** @type {!HTMLIFrameElement} */ (document.createElement('iframe'));
  buttonImageIframe.setAttribute(
      'class', Constants.GPAY_BUTTON_CARD_INFO_IFRAME_CLASS);
  buttonImageIframe.setAttribute('scrolling', 'no');
  const uri = new Uri(Constants.GPAY_BUTTON_WITH_CARD_INFO_IMAGE_SRC);
  uri.setParameterValue('buttonColor', options.buttonColor);
  uri.setParameterValue('browserLocale', getLocale_(options.buttonLocale));
  uri.setParameterValue('buttonSizeMode', options.buttonSizeMode);
  uri.setParameterValue(
      'enableGpayNewButtonAsset',
      null || false);
  if (options.allowedPaymentMethods !== undefined) {
    uri.setParameterValue(
        'allowedPaymentMethods', JSON.stringify(options.allowedPaymentMethods));
  }
  buttonImageIframe.src = uri.toString();
  buttonImageIframe.onload = () => {
    buttonImageIframe.classList.add(
        Constants.GPAY_BUTTON_CARD_INFO_IFRAME_FADE_IN_CLASS);
    animationContainer.classList.add(
        Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_FADE_OUT_CLASS);
  };
  if (options.onClick) {
    buttonContainer.addEventListener('click', options.onClick);
  }
  addButtonEventListenersForStyling(buttonContainer);
  buttonContainer.appendChild(buttonImageIframe);

  const buttonWrapper = document.createElement('div');
  const buttonWrapperClass = shouldUseNewGraphicalAssetsForGpayButton(options) ?
      Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_FILL_CLASS :
      Constants.GPAY_BUTTON_CARD_INFO_CONTAINER_OLD_FILL_CLASS;
  if (options.buttonSizeMode === Constants.ButtonSizeMode.FILL) {
    buttonWrapper.setAttribute('class', buttonWrapperClass);
  }
  buttonWrapper.appendChild(buttonContainer);

  return buttonWrapper;
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

      const gpayButtonCardInfoAnimationContainer = document.querySelector(
          `.${Constants.GPAY_BUTTON_CARD_INFO_ANIMATION_CONTAINER_CLASS}`);
      if (gpayButtonCardInfoAnimationContainer !== null) {
        gpayButtonCardInfoAnimationContainer.classList.toggle(
            'hover', e.type == 'mouseover');
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
 * Adds attributes 'type', 'title', and 'aria-labelledby' to the GPay button
 * element for the accessibility.
 *
 * @param {!Element} button
 * @private
 */
function addAttributesToButtonForAccessbility(button) {
  button.setAttribute(
      Constants.GpayButtonAttribute.TYPE, Constants.GPAY_BUTTON_TYPE);
  button.setAttribute(
      Constants.GpayButtonAttribute.ARIA_LABEL, Constants.GPAY_BUTTON_LABEL);
}

/**
 * Inject the style sheet to the shadowroot or document according to options.
 * This adds BUTTON_STYLE to each rootnode only once, and adds prop-specific
 * style sheet for each (root, prop) pair only once.
 *
 * @param {!ButtonOptions} options
 */
function injectButtonStyleSheet(options) {
  const locale = getLocale_(options.buttonLocale, true);
  const currentRoot = options.buttonRootNode || document;
  // If current root does not have any css injected, inject the common button
  // css to this root first. Then add an empty array to the injected prop list
  // for this root, as no prop-specific css has been injected to this root yet.
  if (!rootsWithInjectedStylesheet.includes(currentRoot)) {
    injectStyleSheet(Constants.BUTTON_STYLE, currentRoot);
    injectStyleSheet(Constants.GPAY_BUTTON_NEW_STYLE, currentRoot);
    rootsWithInjectedStylesheet.push(currentRoot);
    injectedButtonPropsForEachRoot.push([]);
  }
  const currentRootIndex = rootsWithInjectedStylesheet.indexOf(currentRoot);
  // If current root does not have this locale's css injected, inject the
  // prop-specific button style sheet to this root.
  const color = isWhiteColor(options) ? Constants.ButtonColor.WHITE :
                                        Constants.ButtonColor.BLACK;
  const prop = locale + '_' + options.buttonType + '_' + color;
  if (!isButtonTypeShortOrNull(options.buttonType)) {
    if (!injectedButtonPropsForEachRoot[currentRootIndex].includes(prop)) {
      injectStyleSheet(
          getGPayButtonCss(locale, options.buttonType, color), currentRoot);
      injectedButtonPropsForEachRoot[currentRootIndex].push(prop);
    }
  }
}

/**
 * Gets the class for the Google Pay button.
 *
 * @param {!ButtonOptions} options
 * @return {string}
 * @private
 */
function getClassForGpayButton_(options) {
  let color = Constants.ButtonColor.WHITE;
  if (!isWhiteColor(options)) {
    color = Constants.ButtonColor.BLACK;
  }

  let type = options.buttonType || `${Constants.ButtonType.BUY}`;

  // For CSS selector backwards compatibility
  if (options.buttonType === Constants.ButtonType.BUY) {
    type = `${Constants.ButtonType.BUY} ${Constants.ButtonType.LONG}`;
  } else if (options.buttonType === Constants.ButtonType.PLAIN) {
    type = `${Constants.ButtonType.PLAIN} ${Constants.ButtonType.SHORT}`;
  }

  if (!isWhiteColor(options) && null) {
    return `${color} ${type} ${Constants.NEW_BUTTON_STYLE_CLASS} ${
        getLocale_(options.buttonLocale)}`;
  }
  return `${color} ${type} ${getLocale_(options.buttonLocale)}`;
}

/**
 * Gets the CSS for the gpay button depending on the locale, the type and
 * the color.
 *
 * @param {string} locale
 * @param {string|null|undefined} buttonType
 * @param {string|null|undefined} buttonColor
 * @return {string}
 */
function getGPayButtonCss(locale, buttonType, buttonColor) {
  const buttonAttributes = getButtonAttributesByDesign(buttonColor);
  const cssStyleColorClass =
      buttonColor === Constants.ButtonColor.WHITE ? 'light' : 'dark';
  let minWidth = '';
  minWidth = buttonType === Constants.ButtonType.LONG ?
      buttonAttributes.minWidths[Constants.ButtonType.BUY][locale] :
      buttonAttributes
          .minWidths[buttonType || Constants.ButtonType.BUY][locale];
  if (buttonType == Constants.ButtonType.LONG ||
      buttonType == Constants.ButtonType.BUY) {
    return `
    .${Constants.GPAY_BUTTON_CLASS}.${buttonColor}.long.${locale}, .${
        Constants.GPAY_BUTTON_CLASS}.${buttonColor}.buy.${locale} {
      background-image: url(${buttonAttributes.assetUrlPath}/${
        cssStyleColorClass}/${locale}.svg);
        min-width: ${minWidth}px;
      }`;
  }

  return `
    .${Constants.GPAY_BUTTON_CLASS}.${buttonColor}.${buttonType}.${locale} {
      background-image: url(${buttonAttributes.assetUrlPath}/${
      cssStyleColorClass}/${buttonType}/${locale}.svg);
      min-width: ${minWidth}px;
    }
  `;
}

/**
 * Returns true if the button type is short or null
 * @param {string|null|undefined} buttonType
 * @return {boolean}
 */
function isButtonTypeShortOrNull(buttonType) {
  return !buttonType || buttonType == Constants.ButtonType.SHORT ||
      buttonType == Constants.ButtonType.PLAIN;
}

/**
 * Returns true if the white color is selected.
 *
 * @param {!ButtonOptions} options
 * @return {boolean} True if the white color is selected.
 * @private
 */
function isWhiteColor(options) {
  return options.buttonColor == Constants.ButtonColor.WHITE;
}

/**
 * Returns the specified button locale or user's browser locale for GPay button.
 *
 * @param {?string|undefined} buttonLocale
 * @param {boolean=} shouldLogDevError True if should log dev error. This
 *     avoids logging errors repeatedly.
 * @return {string} The specified button locale or user's browser locale.
 * @private
 */
function getLocale_(buttonLocale, shouldLogDevError = false) {
  const defaultLanguage = 'en';
  const browserLanguage = navigator.language != null ?
      navigator.language.substring(
          Constants.BROWSER_LOCALE_START, Constants.BROWSER_LOCALE_END) :
      defaultLanguage;
  const locale = buttonLocale || browserLanguage || defaultLanguage;
  const language = locale.substring(
      Constants.BROWSER_LOCALE_START, Constants.BROWSER_LOCALE_END);
  const minWidth = null ?
      Constants.NEW_BUTTON_MIN_WIDTH :
      Constants.BUTTON_MIN_WIDTH;
  if (language in minWidth[Constants.ButtonType.BUY]) {
    return language;
  }

  if (language !== browserLanguage && shouldLogDevError) {
    logDevErrorToConsole({
      apiName: 'createButton',
      errorMessage: `Button locale "${
          buttonLocale}" is not supported, falling back to browser locale.`,
    });
  }

  if (browserLanguage in minWidth[Constants.ButtonType.BUY]) {
    return browserLanguage;
  }

  return defaultLanguage;
}

/**
 * Get button attributes based on the old/new design
 *
 * @param {string|null|undefined} buttonColor
 * @return {{assetUrlPath: string, minWidths: !Constants.ButtonMinWidths}}
 */
function getButtonAttributesByDesign(buttonColor) {
  if (buttonColor === Constants.ButtonColor.WHITE ||
      !null) {
    return {
      assetUrlPath: 'https://www.gstatic.com/instantbuy/svg',
      minWidths: Constants.BUTTON_MIN_WIDTH,
    };
  }

  return {
    assetUrlPath:
        'https://www.gstatic.com/instantbuy/svg/refreshedgraphicaldesign',
    minWidths: Constants.NEW_BUTTON_MIN_WIDTH,
  };
}

/**
 * Returns true if should render GPay button with card info.
 * GPay button with card info should be rendered if one of following
 * conditions is met:
 *  1. The user is whitelisted for testing (regardless of domain or
 *     button type), AND ths user must be on the merchant domain or
 *     owned by a merchant that is NOT in the denylist AND
 *     uses the LONG type button.
 *  2. The experiment is enabled for the user, and the user is on the
 *     merchant website that uses the LONG type button.
 *  3. The user is on the whitelisted merchant website that uses the LONG type
 *     button.
 *
 *  Note that the denylist will override allowlist.
 *
 * @param {!ButtonOptions} options
 * @param {string=} merchantId
 * @return {boolean} True if should render GPay button with card info.
 * @private
 */
function shouldRenderGPayButtonWithCardInfo_(options, merchantId) {
  const isMerchantIdDenylisted = merchantId &&
      denylistedMerchentIdsHashedValueListForGpayButtonWithCardInfo_.includes(
          hashStringTo32BitInt(merchantId));
  const isMertchantDomainWhitelisted =
      whitelistedDomainsHashedValueListForGpayButtonWithCardInfo_.includes(
          hashStringTo32BitInt(windowLocationHostname_));
  const isMerchantDomainInDenylisted =
      denylistedDomainsHashedValueListForGpayButtonWithCardInfo_.includes(
          hashStringTo32BitInt(windowLocationHostname_));
  return (nullForTesting ||
          null ||
          isMertchantDomainWhitelisted) &&
      !isMerchantIdDenylisted && !isMerchantDomainInDenylisted &&
      (options.buttonType === Constants.ButtonType.LONG ||
       options.buttonType === Constants.ButtonType.BUY);
}

/**
 * Returns true if experiment flag for new asset is turned on and the button
 * color is dark.
 * @param {!ButtonOptions} options
 * @return {boolean} True if new asset experiment flag is turned on and the
 *     button color is dark.
 */
function shouldUseNewGraphicalAssetsForGpayButton(options) {
  return null && !isWhiteColor(options);
}
/**
 * Visible for testing.
 *
 * @return {string} Returns the image extension that should be used.
 */
function getImageExtension() {
  const userAgent = window.navigator.userAgent;

  if (null) {
    if (userAgent.indexOf('Safari') > 0 &&
        (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0)) {
      return 'png';
    }
  }
  return 'svg';
}

/** Visible for testing. */
function resetButtonStylesheet() {
  rootsWithInjectedStylesheet = [];
  injectedDynamicButtonStylesheetList_ = [];
  injectedButtonPropsForEachRoot = [];
}

/** Visible for testing. */
function setWindowLocationHostname(hostname) {
  windowLocationHostname_ = hostname;
}

/** Visible for testing. */
function setWhitelistedDomainsHashedValueList(whitelist) {
  whitelistedDomainsHashedValueListForGpayButtonWithCardInfo_ = whitelist;
}

/** Visible for testing. */
function setDenylistedDomainsHashedValueList(denylist) {
  denylistedDomainsHashedValueListForGpayButtonWithCardInfo_ = denylist;
}

/** Visible for testing. */
function setDenylistedMerchantIdsHashedValueList(denylist) {
  denylistedMerchentIdsHashedValueListForGpayButtonWithCardInfo_ = denylist;
}

export {
  createButtonHelper,
  resetButtonStylesheet,
  setWindowLocationHostname,
  setWhitelistedDomainsHashedValueList,
  setDenylistedDomainsHashedValueList,
  setDenylistedMerchantIdsHashedValueList,
  getImageExtension
};
