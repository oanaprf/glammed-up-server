const USER = {
  FIELDS: {
    ID: '_id',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    PHONE_NUMBER: 'phoneNumber',
    ADDRESS: 'address',
    IS_PROVIDER: 'isProvider',
    PROFILE_PICTURE: 'profilePicture',
  },
  REQUIRED: {
    FIRST_NAME: 'First name is required',
    LAST_NAME: 'First name is required',
    EMAIL: 'Email is required',
  },
};

const notValidMessage = field => ({ value }) => `${value} is not a valid ${field}`;

module.exports = {
  USER,
  notValidMessage,
};
