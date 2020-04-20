const {
  Types: { ObjectId },
} = require('mongoose');
const compose = require('lodash/fp/compose');
const getOr = require('lodash/fp/getOr');
const entries = require('lodash/fp/entries');
const reduce = require('lodash/fp/reduce');
const isEqual = require('lodash/fp/isEqual');
const negate = require('lodash/fp/negate');
const identity = require('lodash/fp/identity');

const {
  REVIEW: {
    FIELDS: { SERVICE_ID, PROVIDER_ID, CLIENT_ID },
  },
} = require('../models/constants');

const SUCCESS = {
  USER: {
    USER_SUCCESSFULLY_CREATED: 'USER_SUCCESSFULLY_CREATED',
    USER_SUCCESSFULLY_UPDATED: 'USER_SUCCESSFULLY_UPDATED',
    USER_NOT_CHANGED: 'USER_NOT_CHANGED',
  },
  SERVICE: {
    SERVICE_SUCCESSFULLY_CREATED: 'SERVICE_SUCCESSFULLY_CREATED',
    SERVICE_SUCCESSFULLY_UPDATED: 'SERVICE_SUCCESSFULLY_UPDATED',
  },
  REVIEW: {
    REVIEW_SUCCESSFULLY_CREATED: 'REVIEW_SUCCESSFULLY_CREATED',
    REVIEW_SUCCESSFULLY_UPDATED: 'REVIEW_SUCCESSFULLY_UPDATED',
    REVIEW_SUCCESSFULLY_DELETED: 'REVIEW_SUCCESSFULLY_DELETED',
  },
};

const ERROR = {
  APP: {
    UNAUTHORIZED: 'UNAUTHORIZED',
  },
  USER: {
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_ID_NOT_VALID: 'USER_ID_NOT_VALID',
  },
  SERVICE: {
    SERVICE_ID_NOT_VALID: 'SERVICE_ID_NOT_VALID',
    SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
    PROVIDER_ID_NOT_VALID: 'PROVIDER_ID_NOT_VALID',
    PROVIDER_NOT_FOUND: 'PROVIDER_NOT_FOUND',
  },
  REVIEW: {
    CLIENT_DOES_HAVE_REVIEWS: 'CLIENT_DOES_HAVE_REVIEWS',
    REVIEW_ID_NOT_VALID: 'REVIEW_ID_NOT_VALID',
    REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
    CLIENT_ID_NOT_VALID: 'CLIENT_ID_NOT_VALID',
    CLIENT_NOT_FOUND: 'CLIENT_NOT_FOUND',
    CLIENT_ALREADY_REVIEWED_SERVICE: 'CLIENT_ALREADY_REVIEWED_SERVICE',
  },
};

const getLength = getOr(0, 'length');
const getBody = getOr({}, 'body');
const getParams = getOr({}, 'params');
const getQueryParams = getOr({}, 'query');
const getId = compose(getOr('', 'id'), getParams);

const getErrors = getOr({}, 'errors');
const mapErrors = compose(
  reduce(
    (result, [key, { message }]) => ({
      ...result,
      errors: { ...result.errors, [key]: message },
    }),
    {}
  ),
  entries,
  getErrors
);

const getObjectDiff = (obj1, obj2) =>
  Object.entries(obj2).reduce(
    (res, [key, value]) => ({
      ...res,
      ...(!isEqual(value, obj1[key]) && { [key]: value }),
    }),
    {}
  );

const isIdInvalid = negate(ObjectId.isValid);
const isNotTruthy = negate(identity);
const providerNotValid = provider => !provider || !provider.isProvider;
const clientNotValid = client => !client || client.isProvider;
const invalidIdErrorMessages = {
  [SERVICE_ID]: [isIdInvalid, ERROR.SERVICE.SERVICE_ID_NOT_VALID],
  [PROVIDER_ID]: [isIdInvalid, ERROR.SERVICE.PROVIDER_ID_NOT_VALID],
  [CLIENT_ID]: [isIdInvalid, ERROR.REVIEW.CLIENT_ID_NOT_VALID],
};
const notFoundErrorMessages = {
  [SERVICE_ID]: [isNotTruthy, ERROR.SERVICE.SERVICE_NOT_FOUND],
  [PROVIDER_ID]: [providerNotValid, ERROR.SERVICE.PROVIDER_NOT_FOUND],
  [CLIENT_ID]: [clientNotValid, ERROR.REVIEW.CLIENT_NOT_FOUND],
};
const findErrorMessage = errorMessages =>
  compose(
    reduce((res, [key, value]) => (errorMessages[key][0](value) ? errorMessages[key][1] : res), ''),
    entries
  );
const findInvalidIdErrorMessage = findErrorMessage(invalidIdErrorMessages);
const findNotFoundErrorMessage = findErrorMessage(notFoundErrorMessages);

module.exports = {
  SUCCESS,
  ERROR,
  getBody,
  getParams,
  getQueryParams,
  getId,
  getErrors,
  mapErrors,
  getObjectDiff,
  getLength,
  findInvalidIdErrorMessage,
  findNotFoundErrorMessage,
};
