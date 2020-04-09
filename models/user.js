const mongoose = require('mongoose');
const { USER } = require('./constants');

const isValidName = (value) => /^[a-zA-Z]*$/.test(value);

const notValidMessage = (field) => ({ value }) => `${value} is not a valid ${field}`;

const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  firstName: {
    type: String,
    required: [true, USER.REQUIRED.FIRST_NAME],
    validate: {
      validator: isValidName,
      message: notValidMessage(USER.FIELDS.FIRST_NAME),
    },
  },
  lastName: {
    type: String,
    required: [true, USER.REQUIRED.LAST_NAME],
    validate: {
      validator: isValidName,
      message: notValidMessage(USER.FIELDS.LAST_NAME),
    },
  },
  email: {
    type: String,
    required: [true, USER.REQUIRED.EMAIL],
    validate: {
      validator: (value) => /^[^@\s]+@[^@\s.]+\.[^@.\s]+$/.test(value),
      message: notValidMessage(USER.FIELDS.EMAIL),
      unique: true,
    },
  },
  phone: {
    type: String,
    validate: {
      validator: (value) => /^\d{10}$/.test(value),
      message: notValidMessage(USER.FIELDS.PHONE_NUMBER),
    },
  },
  address: String,
  isProvider: { type: Boolean, default: false },
  profilePicture: Buffer,
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
