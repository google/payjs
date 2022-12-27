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
 * @fileoverview Externs for Payment APIs.
 * @externs
 */

/**
 * @typedef {function(!IntermediatePaymentData) :
 *     (!PaymentDataRequestUpdate|!Promise<!PaymentDataRequestUpdate>)}
 */
let OnPaymentDataChangedCallback;

/**
 * @typedef {function(!PaymentData) :
 * (!PaymentAuthorizationResult|!Promise<!PaymentAuthorizationResult>)}
 */
let OnPaymentAuthorizedCallback;

/**
 * This contains all callbacks in Payment APIs.
 * @record
 */
class PaymentDataCallbacks {
  constructor() {
    /** @type {!OnPaymentDataChangedCallback|undefined} */
    this.onPaymentDataChanged;

    /** @type {!OnPaymentAuthorizedCallback|undefined} */
    this.onPaymentAuthorized;
  }
}

/**
 * Options for using the Payment APIs.
 * @record
 */
class PaymentsClientOptions {
  constructor() {
    /**
     * The environment to use. Current available environments are PRODUCTION or
     * TEST. If not set, defaults to environment PRODUCTION.
     * @type {?string|undefined}
     */
    this.environment;

    /** @type {?MerchantInfo|undefined} */
    this.merchantInfo;

    // TODO: Remove after paymentDataCallbacks is officially rolled
    // out.
    /** @type {!OnPaymentDataChangedCallback|undefined} */
    this.paymentDataCallback;

    /** @type {!PaymentDataCallbacks|undefined} */
    this.paymentDataCallbacks;

    /** @type {!InternalParameters|undefined} */
    this.i;
  }
}

/**
 * @typedef{{
 *  type: string,
 *  parameters: !Object
 * }}
 *
 * @property {string} type The type of allowed payment method.
 * @property {Object} parameters The parameters for the payment type.
 */
let PaymentMethod;

/**
 * Request object of isReadyToPay.
 *
 * @typedef {{
 *   activityModeRequired: (boolean|undefined),
 *   allowedPaymentMethods: (?Array<string>|?Array<PaymentMethod>|undefined),
 *   apiVersion: (?number|undefined),
 *   apiVersionMinor: (?number|undefined),
 *   environment: (?string|undefined),
 *   existingPaymentMethodRequired: (boolean|undefined),
 *   merchantInfo: (?MerchantInfo|undefined),
 * }}
 *
 * @property {boolean} activityModeRequired
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 * @property {number} apiVersion.
 * @property {number} apiVersionMinor.
 * @property {string} environment
 * @property {boolean} existingPaymentMethodRequired
 * @property {MerchantInfo} merchantInfo
 */
let IsReadyToPayRequest;


/**
 * Request object of loadPaymentData.
 *
 * @typedef {{
 *   merchantId: (?string|undefined),
 *   allowedPaymentMethods: (?Array<string>|undefined),
 *   apiVersion: (?number|undefined),
 *   paymentMethodTokenizationParameters:
 * (?PaymentMethodTokenizationParameters|undefined), cardRequirements:
 * (?CardRequirements|undefined), phoneNumberRequired: (?boolean|undefined),
 *   emailRequired: (?boolean|undefined),
 *   merchantInfo: (?MerchantInfo|undefined),
 *   shippingAddressRequired: (?boolean|undefined),
 *   shippingAddressRequirements: (?ShippingAddressRequirements|undefined),
 *   transactionInfo: (?TransactionInfo|undefined),
 *   swg: (?SwgParameters|undefined),
 *   callbackIntents: (?Array<string>|undefined),
 *   i: (?InternalParameters|undefined),
 * }}
 *
 * @property {string} merchantId The obfuscated merchant gaia id.
 * @property {Array<string>} allowedPaymentMethods The allowedPaymentMethods can
 *     be 'CARD' or 'TOKENIZED_CARD'.
 * @property {number} apiVersion.
 * @property {PaymentMethodTokenizationParameters}
 *     paymentMethodTokenizationParameters.
 * @property {CardRequirements} cardRequirements.
 * @property {boolean} phoneNumberRequired.
 * @property {boolean} emailRequired.
 * @property {boolean} shippingAddressRequired.
 * @property {MerchantInfo} merchantInfo
 * @property {ShippingAddressRequirements} shippingAddressRequirements.
 * @property {TransactionInfo} transactionInfo
 * @property {SwgParameters} swg
 * @property {Array<string>} callbackIntents
 * @property {InternalParameters} i
 */
let PaymentDataRequest;


/**
 * An updated request for payment data.
 * @record
 */
class PaymentDataRequestUpdate {
  constructor() {
    /**
     * @type {?Object|undefined}
     */
    this.newShippingOptionParameters;

    /**
     * @type {?TransactionInfo|undefined}
     */
    this.newTransactionInfo;

    /**
     * @type {?OfferInfo|undefined}
     */
    this.newOfferInfo;

    /**
     * @type {?PaymentDataError|undefined}
     */
    this.error;
  }
}

/**
 * The result of handling payment authorization data.
 * @record
 */
class PaymentAuthorizationResult {
  constructor() {
    /**
     * The value must be either 'SUCCESS' or 'ERROR'.
     * @type {string}
     */
    this.transactionState;

    /**
     * @type {!PaymentDataError|undefined}
     */
    this.error;
  }
}


/**
 * Payment method tokenization parameters which will be used to tokenize the
 * returned payment method.
 *
 * @typedef {{
 *   tokenizationType: (?string|undefined),
 *   parameters: ?Object<string>,
 * }}
 *
 * @property {string} tokenizationType The payment method tokenization type -
 *     PAYMENT_GATEWAY or DIRECT.
 * @property {Object<string>} parameters The payment method tokenization
 *     parameters.
 */
let PaymentMethodTokenizationParameters;


/**
 * Card requirements for the returned payment card.
 *
 * @typedef {{
 *   allowedCardNetworks: ?Array<string>,
 *   billingAddressRequired: (?boolean|undefined),
 *   billingAddressFormat: (?string|undefined),
 * }}
 *
 * @property {string} allowedCardNetworks Current supported card networks are
 *     AMEX, DISCOVER, JCB, MASTERCARD, VISA.
 * @property {boolean} billingAddressRequired Whether a billing address is
 *     required from the buyer.
 * @property {string} billingAddressFormat The required format for the returned
 *     billing address. Current available formats are:
 *         MIN - only contain the minimal info, including name, country code,
 *     and postal code. FULL - the full address.
 */
let CardRequirements;


/**
 * Shipping address requirements.
 *
 * @typedef {{
 *   allowedCountries: ?Array<string>
 * }}
 *
 * @property {Array<string>} allowedCountries The countries allowed for shipping
 *     address.
 */
let ShippingAddressRequirements;


/**
 * Transaction info.
 *
 * @typedef {{
 *   currencyCode: (?string|undefined),
 *   totalPriceStatus: (?string|undefined),
 *   totalPrice: (?string|undefined),
 *   checkoutOption: (?string|undefined),
 * }}
 *
 * @property {string} currencyCode The ISO 4217 currency code of the
 *     transaction.
 * @property {string} totalPriceStatus The status of total price used -
 *     NOT_CURRENTLY_KNOWN, ESTIMATED, FINAL.
 * @property {string} totalPrice The the total price of this transaction. The
 *     format of this string should follow the regex format:
 *         [0-9]+(\.[0-9][0-9])? (e.g., "10.45").
 * @property {string} checkoutOption. The checkoutOptions can be
 *     either 'DEFAULT' or 'COMPLETE_IMMEDIATE_PURCHASE'
 *
 */
let TransactionInfo;

/**
 * Offer info.
 *
 * @typedef {{
 *   offers: ?Array<OfferDetail>
 * }}
 *
 * @property {Array<OfferDetail>} offers The offers that are applicable to this
 *     transaction.
 */
let OfferInfo;

/**
 * Offer detail.
 *
 * @typedef {{
 *   redemptionCode: (?string|undefined),
 *   description: (?string|undefined),
 * }}
 *
 * @property {string} redemptionCode The redemption code for this offer.
 * @property {string} description The description of this offer.
 */
let OfferDetail;

/**
 * @typedef {{
 *   merchantId: (?string|undefined),
 *   merchantOrigin: (?string|undefined),
 *   merchantName: (?string|undefined),
 *   authJwt: (?string|undefined),
 *   softwareInfo: (?SoftwareInfo|undefined),
 *   buttonInfo: (?ButtonInfo|undefined)
 * }}
 */
let MerchantInfo;

/**
 * @typedef {{
 *   id: (?string|undefined),
 *   version: (?string|undefined),
 * }}
 */
let SoftwareInfo;

/**
 * @typedef {{
 *   buttonType: number,
 *   buttonSizeMode: number,
 *   buttonRootNode: number,
 * }}
 */
let ButtonInfo;

/**
 * Subscribe with Google specific parameters.
 * TODO: Clean up incoming parameters.
 *
 * @typedef {{
 *   swgVersion: (?string|undefined),
 *   skuId: string,
 *   sku: (?string|undefined),
 *   publicationId: string,
 *   oldSku: (?string|undefined),
 *   metadata: (?VirtualGiftsMetadata|undefined),
 * }}
 *
 * @property {string} swgVersion The version of Subscribe with Google, to
 *     trigger different buyflows.
 * @property {string} skuId The ID of the SKU/offer that the publisher has
 *     setup. Old name. Finish migrating to 'sku'.
 * @property {string} sku The ID of the SKU/offer that the publisher has setup.
 * @property {string} publicationId The publicationId that the publisher has
 *  setup.
 * @property {string} oldSku The ID of the SKU/offer to replace.
 * @property {?VirtualGiftsMetadata|undefined} metadata Additional metadata.
 */
let SwgParameters;

/**
 * Additional metadata for Virtual Gifts that needs to be passed through the
 * Subscribe with Google buy flow.
 *
 * @typedef {{
 *   anonymous: boolean,
 *   contentId: string,
 *   contentTitle: string,
 *   customMessage: ?string,
 *   readerSurface: ?string,
 *   webSharingPolicy: ?string,
 *   creatorSharingPolicy: ?string,
 * }}
 *
 * @property {boolean} anonymous Whether the contribution is anonymous.
 * @property {string} contentId The id of the content receiving a contribution.
 * @property {string} contentTitle The title of the content receiving a
 *     contribution.
 * @property {?string} customMessage A custom private message sent to
 *     the creator of the content receiving a contribution.
 * @property {?string} readerSurface The reader surface to distinguish
 *     contributions from different surfaces containing a CTA to open the buy
 *     flow, eg. Wordpress, Chrome, Tenor integrations.
 * @property {?string} webSharingPolicy The policy that dictates how the
 *     contribution will be displayed on the web.
 * @property {?string} creatorSharingPolicy The policy that dictates how the
 *     contribution will be displayed to the Creator.
 */
let VirtualGiftsMetadata;

/**
 * Internal parameters.
 *
 * @typedef {{
 *   ampMerchantOrigin: (string|undefined),
 *   coordinationToken: (string|undefined),
 *   expandInstrumentSelector: (boolean|undefined),
 *   googleTransactionId: (string|undefined),
 *   startTimeMs: (number|undefined),
 *   preferredAccountId: (string|undefined),
 *   userIndex: (string|undefined),
 *   renderContainerCenter: (boolean|undefined),
 *   redirectVerifier: (string|undefined),
 *   redirectKey: (string|undefined),
 *   firstPartyMerchantIdentifier: (string|undefined),
 * }}
 *
 * @property {(string|undefined)} ampMerchantOrigin The origin of an amp page.
 *     This field should only be trusted if loaded in Google Viewer.
 * @property {(string|undefined)} coordinationToken The coordination token
 *     provided by the AMP viewer to coordinate experiments.
 * @property {(boolean|undefined)} expandInstrumentSelector Expand the
 *     instrument selector by default when opening the bottom sheet.
 * @property {(string|undefined)} googleTransactionId The google transaction id
 *     to keep track of the current transaction.
 * @property {(number|undefined)} startTimeMs The unix time for when an API
 *     method was called.
 * @property {(string|undefined)} preferredAccountId The obfuscated id of the
 *     user.
 * @property {(string|undefined)} userIndex The current user's Gaia session
 *     cookie index, a string (e.g. "0" or "5").
 * @property {(boolean|undefined)} renderContainerCenter The flag to decide
 *     whether he PayJS container should be vertically centered or loaded from
 *     the bottom.
 * @property {(string|undefined)} redirectVerifier The redirect verifier. Can
 *     only be used for a payment request.
 * @property {(string|undefined)} redirectKey The redirect verifier. Can only
 *     be used for the payment client initialization.
 * @property {{string|undefined}} firstPartyMerchantIdentifier merchant
 *     identifier of a first party product.
 */
let InternalParameters;

/**
 * Instant buy parameters.
 *
 * @typedef {{
 *   clientParameters: (string|undefined),
 *   encryptedParameters: (string|undefined),
 * }}
 *
 * @property {(string|undefined)} clientParameters The buyflow client
 * parameters.
 * @property {(string|undefined)} encryptedParameters The encrypted buyflow
 * client parameters.
 */
let InstantBuyParameters;

/**
 * A configuration object for rendering the button.
 *
 * @typedef {{
 *   buttonColor: (?string|undefined),
 *   buttonType: (?string|undefined),
 *   buttonSizeMode: (?string|undefined),
 *   buttonRootNode: (?ShadowRoot|?HTMLDocument|undefined),
 *   buttonLocale: (?string|undefined),
 *   onClick: (?function():void|undefined),
 *   hasOffers: (?boolean|undefined),
 *   allowedPaymentMethods: (?Array<string>|?Array<PaymentMethod>|undefined),
 * }}
 *
 * @property {string} buttonColor Color theme: black; white; default.
 *     The default value currently maps to black.
 * @property {string} buttonType: plain; buy (default); donate; book; checkout;
 *     order; pay; subscribe; short (alias of plain); long (alias of buy).
 * @property {string} buttonSizeMode Either static or fill (default: static).
 * @property {ShadowRoot|HTMLDocument} buttonRootNode: The element that we
 * attach styles on.
 * @property {string} buttonLocale The locale for the button in ISO 639-1 codes.
 *   Supported locales are {@link
 *   boq.instantbuyfrontendjs.Constants.BUTTON_LOCALE_TO_MIN_WIDTH}
 * @property {function()} onClick Callback on clicking the button.
 * @property {boolean} hasOffers When set to true, the Google Pay button will
 *     indicate that an offer is available for the user.
 * @property {Array<string>} allowedPaymentMethods When this field is set,
 *     user's card info on dynamic buttons will be filtered by allowed methods.
 */
let ButtonOptions;

/**
 * Information about the selected payment method.
 *
 * @typedef {{
 *   cardDescription: string,
 *   cardClass: string,
 *   cardDetails: string,
 *   cardNetwork: string,
 *   cardImageUri: string,
 * }}
 */
let CardInfo;

/**
 * The payment data response object returned to the integrator.
 * This can have different contents depending upon the context in which the
 * buyflow is triggered.
 *
 * @typedef {{
 *   cardInfo: (CardInfo|undefined),
 *   paymentMethodToken: (Object|undefined),
 *   shippingAddress: (UserAddress|undefined),
 * }}
 */
let PaymentData;

/**
 * The intermediate payment data response object returned to the integrator.
 * This is returned in the middle of a transaction for developer callbacks.
 * @record
 */
class IntermediatePaymentData {
  constructor() {
    /** @type {?IntermediatePaymentMethodData|undefined} */
    this.paymentMethodData;

    /** @type {?IntermediateAddress|undefined} */
    this.shippingAddress;

    /** @type {?SelectionOptionData|undefined} */
    this.shippingOptionData;

    /** @type {?OfferData|undefined} */
    this.offerData;

    /** @type {?string|undefined} */
    this.callbackTrigger;
  }
}


/**
 * Information about a requested postal address. All properties are strings.
 *
 * @typedef {{
 *   name: string,
 *   postalCode: string,
 *   countryCode: string,
 *   phoneNumber: string,
 *   companyName: string,
 *   address1: string,
 *   address2: string,
 *   address3: string,
 *   locality: string,
 *   administrativeArea: string,
 *   sortingCode: string,
 * }}
 */
let UserAddress;

/**
 * Limited information about a requested postal address.
 * @record
 */
class IntermediateAddress {
  constructor() {
    /** @type {string} */
    this.postalCode;

    /** @type {string} */
    this.countryCode;

    /** @type {string} */
    this.administrativeArea;
  }
}


/**
 * Offer details for pre-notification. Description for the offer should not
 * exceed 30 characters.
 *
 * @typedef {{
 *   description: string
 * }}
 */
let PreNotificationOfferDetails;

/**
 * Limited information about a payment method.
 * @record
 */
class IntermediatePaymentMethodData {
  constructor() {
    /** @type {string} */
    this.type;

    /** @type {!IntermediateCardInfo|undefined} */
    this.info;

    /** @type {?Array<string>|undefined} */
    this.tags;
  }
}


/**
 * Limited information about a card.
 * @record
 */
class IntermediateCardInfo {
  constructor() {
    /** @type {string} */
    this.cardNetwork;
  }
}

/**
 * Definition of an error in PaymentData.
 * @record
 */
class PaymentDataError {
  constructor() {
    /** @type {string} */
    this.reason;

    /** @type {string} */
    this.intent;

    /** @type {string} */
    this.message;
  }
}

/**
 * Definition of the value of a SelectionOption
 * @record
 */
class SelectionOptionData {
  constructor() {
    /** @type {string} */
    this.id;
  }
}

/**
 * The offer data to be returned to the integrator.
 * @record
 */
class OfferData {
  constructor() {
    /** @type {!Array<string>} */
    this.redemptionCodes;
  }
}
