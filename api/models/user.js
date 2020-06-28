const mongoose = require('mongoose');
const { USER, SERVICE, isNameValid, isTimeValid } = require('./constants');

const UserSchema = new mongoose.Schema(
  {
    [USER.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
    [USER.FIELDS.FIRST_NAME]: {
      type: String,
      required: [true, USER.REQUIRED.FIRST_NAME],
      validate: {
        validator: isNameValid,
        message: USER.NOT_VALID.FIRST_NAME,
      },
      trim: true,
      minlength: [3, USER.MIN_LENGTH.FIRST_NAME],
      maxlength: [30, USER.MAX_LENGTH.FIRST_NAME],
    },
    [USER.FIELDS.LAST_NAME]: {
      type: String,
      required: [true, USER.REQUIRED.LAST_NAME],
      validate: {
        validator: isNameValid,
        message: USER.NOT_VALID.LAST_NAME,
      },
      trim: true,
      minlength: [3, USER.MIN_LENGTH.LAST_NAME],
      maxlength: [20, USER.MAX_LENGTH.LAST_NAME],
    },
    [USER.FIELDS.EMAIL]: {
      type: String,
      required: [true, USER.REQUIRED.EMAIL],
      validate: {
        validator: value => /^[^@\s]+@[^@\s.]+\.[^@.\s]+$/.test(value),
        message: USER.NOT_VALID.EMAIL,
      },
      trim: true,
      minlength: [5, USER.MIN_LENGTH.EMAIL],
      maxlength: [50, USER.MAX_LENGTH.EMAIL],
      unique: true,
    },
    [USER.FIELDS.PHONE_NUMBER]: {
      type: String,
      validate: {
        validator: value => /^\d{10}$/.test(value),
        message: USER.NOT_VALID.PHONE_NUMBER,
      },
      trim: true,
    },
    [USER.FIELDS.ADDRESS]: {
      type: String,
      trim: true,
      minlength: [5, USER.MIN_LENGTH.ADDRESS],
      maxlength: [50, USER.MAX_LENGTH.ADDRESS],
    },
    [USER.FIELDS.IS_PROVIDER]: { type: Boolean, default: false },
    [USER.FIELDS.PROFILE_PICTURE]: String,
    [USER.FIELDS.START_TIME]: {
      type: String,
      default: '10:00',
      trim: true,
      validate: {
        validator: isTimeValid,
        message: USER.NOT_VALID.START_TIME,
      },
    },
    [USER.FIELDS.END_TIME]: {
      type: String,
      default: '18:00',
      trim: true,
      validate: {
        validator: isTimeValid,
        message: USER.NOT_VALID.END_TIME,
      },
    },
    [USER.FIELDS.PUSH_TOKEN]: {
      type: String,
    },
  },
  {
    versionKey: false,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

// eslint-disable-next-line func-names
UserSchema.virtual(USER.VIRTUALS.FULL_NAME).get(function () {
  return `${this[USER.FIELDS.FIRST_NAME]} ${this[USER.FIELDS.LAST_NAME]}`;
});

UserSchema.virtual(USER.VIRTUALS.SERVICES, {
  ref: SERVICE.MODEL,
  localField: USER.FIELDS.ID,
  foreignField: SERVICE.FIELDS.PROVIDER_ID,
});

const User = mongoose.model(USER.MODEL, UserSchema);

module.exports = User;
