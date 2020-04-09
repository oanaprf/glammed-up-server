const mongoose = require('mongoose');
const { USER, notValidMessage } = require('./constants');

const isValidName = value => /^[a-zA-Z]*$/.test(value);

const UserSchema = new mongoose.Schema({
  [USER.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
  [USER.FIELDS.FIRST_NAME]: {
    type: String,
    required: [true, USER.REQUIRED.FIRST_NAME],
    validate: {
      validator: isValidName,
      message: notValidMessage(USER.FIELDS.FIRST_NAME),
    },
  },
  [USER.FIELDS.LAST_NAME]: {
    type: String,
    required: [true, USER.REQUIRED.LAST_NAME],
    validate: {
      validator: isValidName,
      message: notValidMessage(USER.FIELDS.LAST_NAME),
    },
  },
  [USER.FIELDS.EMAIL]: {
    type: String,
    required: [true, USER.REQUIRED.EMAIL],
    validate: {
      validator: value => /^[^@\s]+@[^@\s.]+\.[^@.\s]+$/.test(value),
      message: notValidMessage(USER.FIELDS.EMAIL),
      unique: true,
    },
  },
  [USER.FIELDS.PHONE_NUMBER]: {
    type: String,
    validate: {
      validator: value => /^\d{10}$/.test(value),
      message: notValidMessage(USER.FIELDS.PHONE_NUMBER),
    },
  },
  [USER.FIELDS.ADDRESS]: String,
  [USER.FIELDS.IS_PROVIDER]: { type: Boolean, default: false },
  [USER.FIELDS.PROFILE_PICTURE]: Buffer,
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
