const compose = require('lodash/fp/compose');
const getOr = require('lodash/fp/getOr');
const entries = require('lodash/fp/entries');
const reduce = require('lodash/fp/reduce');
const isEqual = require('lodash/fp/isEqual');

const ROUTES = { USER: '/user', CLIENT: '/client', REVIEWS: '/reviews' };

const SUCCESS = {
  USER: {
    USER_SUCCESSFULLY_CREATED: 'USER_SUCCESSFULLY_CREATED',
    USER_SUCCESSFULLY_UPDATED: 'USER_SUCCESSFULLY_UPDATED',
    USER_NOT_CHANGED: 'USER_NOT_CHANGED',
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
  REVIEW: {
    CLIENT_DOES_HAVE_REVIEWS: 'CLIENT_DOES_HAVE_REVIEWS',
  },
};

const getLength = getOr(0, 'length');
const getBody = getOr({}, 'body');
const getParams = getOr({}, 'params');
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

module.exports = {
  ROUTES,
  SUCCESS,
  ERROR,
  getBody,
  getParams,
  getId,
  getErrors,
  mapErrors,
  getObjectDiff,
  getLength,
};
