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

import uuid from '../third_party/random_uuid/Random.uuid.js';

/**
 * Returns a google transaction id.
 *
 * @param {string} environment
 * @return {string}
 */
function createGoogleTransactionId(environment) {
  return uuid.uuidFast() + '.' + environment;
}

/**
 * Implementation of String.prototype.endsWith.
 * @param {string} string
 * @param {string} suffix
 * @return {boolean}
 */
function endsWith(string, suffix) {
  const index = string.length - suffix.length;
  return index >= 0 && string.indexOf(suffix, index) == index;
}

/**
 * Recursively merges src into dest.
 * Note that this reuses object references so this should be thought of an
 * inplace merge.
 * Copied from http://shortn/_q85qrSqPcQ
 *
 * @param {...?Object} dest
 * @return {?Object}
 */
function deepMergeInto(dest) {
  for (let i = 1; i < arguments.length; i++) {
    dest = deepMerge_(dest, arguments[i]);
  }
  return dest;
}

/**
 * Recursively merges src into dest
 * @param {?Object} dest
 * @param {?Object} src
 * @private
 * @return {?Object}
 */
function deepMerge_(dest, src) {
  if (typeof src !== 'object' || src === null) {
    return dest;
  }
  for (const p in src) {
    if (!src.hasOwnProperty(p)) {
      continue;
    }
    if (src[p] === undefined) {
      continue;
    }
    if (src[p] == null) {
      dest[p] = null;
    } else if (
        dest[p] == null || typeof dest[p] !== 'object' ||
        typeof src[p] !== 'object' || Array.isArray(src[p]) ||
        Array.isArray(dest[p])) {
      dest[p] = src[p];
    } else {
      // Both dest[p] and src[p] are objects but not arrays.
      deepMerge_(dest[p], src[p]);
    }
  }
  return dest;
}

/**
 * Calculate a simple hash of a string.
 * @param  {string} value value to hash
 * @return {number}
 */
function hashStringTo32BitInt(value) {
  let hash = 0;
  let i;
  let char;
  if (value.length == 0) return hash;
  for (i = 0; i < value.length; i++) {
    char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash &= hash;  // convert to 32bit integer
  }

  return hash;
}

/**
 * Logs developer error to console.
 *
 * @param {{apiName: string, errorMessage: ?string}} parameters
 */
function logDevErrorToConsole({apiName, errorMessage}) {
  console.error(`DEVELOPER_ERROR in ${apiName}: ${errorMessage}`);
}

export {
  createGoogleTransactionId,
  endsWith,
  deepMergeInto,
  hashStringTo32BitInt,
  logDevErrorToConsole,
};
