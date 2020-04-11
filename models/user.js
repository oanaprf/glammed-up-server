const mongoose = require('mongoose');
const { USER, notValidMessage, isNameValid } = require('./constants');

const UserSchema = new mongoose.Schema({
  [USER.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
  [USER.FIELDS.FIRST_NAME]: {
    type: String,
    required: [true, USER.REQUIRED.FIRST_NAME],
    validate: {
      validator: isNameValid,
      message: notValidMessage(USER.FIELDS.FIRST_NAME),
    },
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  [USER.FIELDS.LAST_NAME]: {
    type: String,
    required: [true, USER.REQUIRED.LAST_NAME],
    validate: {
      validator: isNameValid,
      message: notValidMessage(USER.FIELDS.LAST_NAME),
    },
    trim: true,
    minlength: 3,
    maxlength: 20,
  },
  [USER.FIELDS.EMAIL]: {
    type: String,
    required: [true, USER.REQUIRED.EMAIL],
    validate: {
      validator: value => /^[^@\s]+@[^@\s.]+\.[^@.\s]+$/.test(value),
      message: notValidMessage(USER.FIELDS.EMAIL),
      unique: true,
    },
    trim: true,
    minlength: 5,
    maxlength: 20,
  },
  [USER.FIELDS.PHONE_NUMBER]: {
    type: String,
    validate: {
      validator: value => /^\d{10}$/.test(value),
      message: notValidMessage(USER.FIELDS.PHONE_NUMBER),
    },
    trim: true,
  },
  [USER.FIELDS.ADDRESS]: {
    type: String,
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  [USER.FIELDS.IS_PROVIDER]: { type: Boolean, default: false },
  [USER.FIELDS.PROFILE_PICTURE]: Buffer,
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
