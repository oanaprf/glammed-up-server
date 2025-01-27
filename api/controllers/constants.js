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
const omit = require('lodash/fp/omit');
const map = require('lodash/fp/map');
const difference = require('lodash/fp/difference');
const { Expo } = require('expo-server-sdk');

const expo = new Expo();

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
  APPOINTMENT: {
    APPOINTMENT_SUCCESSFULLY_UPDATED: 'APPOINTMENT_SUCCESSFULLY_UPDATED',
    APPOINTMENT_SUCCESSFULLY_CREATED: 'APPOINTMENT_SUCCESSFULLY_CREATED',
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
  APPOINTMENT: {
    APPOINTMENT_ID_NOT_VALID: 'APPOINTMENT_ID_NOT_VALID',
    APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
    APPOINTMENT_WITH_THIS_DATETIME_ALREADY_EXISTS: 'APPOINTMENT_WITH_THIS_DATETIME_ALREADY_EXISTS',
    DATE_AND_DURATION_REQUIRED: 'DATE_AND_DURATION_REQUIRED',
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
const clientNotValid = client => !client;
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
const getPayloadWithoutIds = compose(omit([SERVICE_ID, PROVIDER_ID, CLIENT_ID]), getBody);

const getMinutesBetweenDates = (startDate, endDate) => (endDate - startDate) / 60000;
const getTimeInMinutes = date => date.getUTCHours() * 60 + date.getUTCMinutes();
const getTimeFromMinutes = minutes => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}${hours === 0 ? '0' : ''}:${mins}${mins === 0 ? '0' : ''}`;
};

const getProviderTime = (date, time) => {
  const newDate = new Date(date);
  newDate.setUTCHours(time.split(':')[0]);
  newDate.setUTCMinutes(time.split(':')[1]);
  return newDate;
};

const getFreeSpots = (dates, duration, startTime, endTime) => {
  const appointments = map(({ date: serviceDate, service: { duration: serviceDuration } }) => ({
    date: getTimeInMinutes(serviceDate),
    duration: serviceDuration,
  }))(dates);

  let freeSpots = [];
  const intervalCount = getMinutesBetweenDates(startTime, endTime) / 15;
  const startTimeMinutes = getTimeInMinutes(startTime);
  const endTimeMinutes = getTimeInMinutes(endTime);
  for (let i = 0; i < intervalCount; i++) {
    freeSpots = [...freeSpots, startTimeMinutes + i * 15];
  }

  let overlap = [];
  for (let i = 0; i < getLength(freeSpots); i++) {
    if (freeSpots[i] + duration >= startTimeMinutes && freeSpots[i] + duration <= endTimeMinutes) {
      for (let j = 0; j < getLength(appointments); j++) {
        if (
          !(
            freeSpots[i] + duration <= appointments[j].date ||
            freeSpots[i] >= appointments[j].date + appointments[j].duration
          )
        ) {
          overlap = [...overlap, freeSpots[i]];
        }
      }
    }
  }
  return map(getTimeFromMinutes)(difference(freeSpots, overlap));
};

const sendPushNotification = async (pushToken, title, message, data) => {
  if (Expo.isExpoPushToken(pushToken)) {
    await expo.sendPushNotificationsAsync([
      {
        to: pushToken,
        sound: 'default',
        title,
        body: message,
        _displayInForeground: true,
        data,
      },
    ]);
    // eslint-disable-next-line no-console
  } else console.log('Not a valid Expo push token');
};

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
  getPayloadWithoutIds,
  getProviderTime,
  getFreeSpots,
  sendPushNotification,
};
