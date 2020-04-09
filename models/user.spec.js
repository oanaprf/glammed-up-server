const getOr = require('lodash/fp/getOr');
const User = require('./user');
const { USER, notValidMessage } = require('./constants');

const FIELDS_TO_VALIDATE = [
  USER.FIELDS.FIRST_NAME,
  USER.FIELDS.LAST_NAME,
  USER.FIELDS.EMAIL,
  USER.FIELDS.PHONE_NUMBER,
];

const getErrorMessage = (field, error) =>
  getOr(undefined, ['errors', field, 'message'], error);

const getErrorActualValue = (field, error) =>
  getOr(undefined, ['errors', field, 'value'], error);

describe('test user model', () => {
  test('all good', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(error).toBe(undefined);
  });

  test('all wrong', () => {
    const user = new User({
      firstName: 'John2',
      lastName: 'Doe2',
      email: 'john.doeyahoo.com',
      phoneNumber: '07123',
    });
    const error = user.validateSync();
    FIELDS_TO_VALIDATE.forEach(field =>
      expect(getErrorMessage(field, error)).toBe(
        notValidMessage(field)({
          value: getErrorActualValue(field, error),
        })
      )
    );
  });

  test('first name required', () => {
    const user = new User({
      lastName: 'Doe',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.FIRST_NAME, error)).toBe(USER.REQUIRED.FIRST_NAME);
  });

  test('last name required', () => {
    const user = new User({
      firstName: 'John',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.LAST_NAME, error)).toBe(USER.REQUIRED.LAST_NAME);
  });

  test('email required', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.EMAIL, error)).toBe(USER.REQUIRED.EMAIL);
  });

  test('first name not valid', () => {
    const user = new User({
      firstName: '2Pac',
      lastName: 'Doe',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.FIRST_NAME, error)).toBe(
      notValidMessage(USER.FIELDS.FIRST_NAME)({
        value: getErrorActualValue(USER.FIELDS.FIRST_NAME, error),
      })
    );
  });

  test('last name not valid', () => {
    const user = new User({
      firstName: 'John',
      lastName: '2Pac',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.LAST_NAME, error)).toBe(
      notValidMessage(USER.FIELDS.LAST_NAME)({
        value: getErrorActualValue(USER.FIELDS.LAST_NAME, error),
      })
    );
  });

  test('email not valid', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doeyahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.EMAIL, error)).toBe(
      notValidMessage(USER.FIELDS.EMAIL)({
        value: getErrorActualValue(USER.FIELDS.EMAIL, error),
      })
    );
  });

  test('phoneNumber number not valid', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@yahoo.com',
      phoneNumber: '0712',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.PHONE_NUMBER, error)).toBe(
      notValidMessage(USER.FIELDS.PHONE_NUMBER)({
        value: getErrorActualValue(USER.FIELDS.PHONE_NUMBER, error),
      })
    );
  });
});
