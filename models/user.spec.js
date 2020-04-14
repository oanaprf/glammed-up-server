const getOr = require('lodash/fp/getOr');
const User = require('./user');
const { USER } = require('./constants');

const FIELDS_TO_VALIDATE = {
  FIRST_NAME: USER.FIELDS.FIRST_NAME,
  LAST_NAME: USER.FIELDS.LAST_NAME,
  EMAIL: USER.FIELDS.EMAIL,
  PHONE_NUMBER: USER.FIELDS.PHONE_NUMBER,
};

const getErrorMessage = (field, error) =>
  getOr(undefined, ['errors', field, 'message'], error);

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
    Object.entries(FIELDS_TO_VALIDATE).forEach(([key, value]) =>
      expect(getErrorMessage(value, error)).toBe(USER.NOT_VALID[key])
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
      USER.NOT_VALID.FIRST_NAME
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
    expect(getErrorMessage(USER.FIELDS.LAST_NAME, error)).toBe(USER.NOT_VALID.LAST_NAME);
  });

  test('email not valid', () => {
    const user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doeyahoo.com',
      phoneNumber: '0712345678',
    });
    const error = user.validateSync();
    expect(getErrorMessage(USER.FIELDS.EMAIL, error)).toBe(USER.NOT_VALID.EMAIL);
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
      USER.NOT_VALID.PHONE_NUMBER
    );
  });
});
