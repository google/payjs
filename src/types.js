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
 * @typedef {function(!IntermediatePaymentData) :
 *     (!PaymentDataRequestUpdate|!Promise<!PaymentDataRequestUpdate>)}
 */
let PaymentDataCallback;

/**
 * Options for using the Payment APIs.
 * @record
 */
class PaymentOptions {
  constructor() {
    /**
     * The environment to use. Current available environments are PRODUCTION or
     * TEST. If not set, defaults to environment PRODUCTION.
     * @export {?string|undefined}
     */
    this.environment;

    /**
     * @export {?MerchantInfo|undefined}
     */
    this.merchantInfo;

    /**
     * @export {?PaymentDataCallback|undefined}
     */
    this.paymentDataCallback;

    /**
     * @export {?InternalParameters|undefined}
     */
    this.i;
  }
}

/**
 * An updated request for payment data.
 * @record
 */
class PaymentDataRequestUpdate {
  constructor() {
    /**
     * @export {?Object|undefined}
     */
    this.newShippingOptionParameters;

    /**
     * @export {?TransactionInfo|undefined}
     */
    this.transactionInfo;

    /**
     * @export {?PaymentDataError|undefined}
     */
    this.error;
  }
}
/**
 * The intermediate payment data response object returned to the integrator.
 * This is returned in the middle of a transaction for developer callbacks.
 * @record
 */
class IntermediatePaymentData {
  constructor() {
    /**
     * @export {?IntermediatePaymentMethodData|undefined}
     */
    this.paymentMethodData;

    /**
     * @export {?IntermediateUserAddress|undefined}
     */
    this.shippingAddress;
  }
}


/**
 * Limited information about a requested postal address.
 * @record
 */
class IntermediateUserAddress {
  constructor() {
    /**
     * @export {string}
     */
    this.postalCode;

    /**
     * @export {string}
     */
    this.countryCode;

    /**
     * @export {string}
     */
    this.administrativeArea;
  }
}


/**
 * Limited information about a payment method.
 * @record
 */
class IntermediatePaymentMethodData {
  constructor() {
    /**
     * @export {string}
     */
    this.type;

    /**
     * @export {!IntermediateCardInfo|undefined}
     */
    this.info;
  }
}


/**
 * Limited information about a card.
 * @record
 */
class IntermediateCardInfo {
  constructor() {
    /**
     * @export {string}
     */
    this.cardNetwork;
  }
}

/**
 * Definition of an error in PaymentData.
 * @record
 */
class PaymentDataError {
  constructor() {
    /**
     * @export {string}
     */
    this.reason;

    /**
     * @export {string}
     */
    this.intent;

    /**
     * @export {string}
     */
    this.message;
  }
}

export {
  PaymentDataCallback,
  PaymentOptions,
};
