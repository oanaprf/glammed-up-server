const mongoose = require('mongoose');
const { SERVICE } = require('./constants');
const User = require('./user');

const CATEGORY_ARRAY = Object.values(SERVICE.CATEGORY_ENUM);

const ServiceSchema = new mongoose.Schema(
  {
    [SERVICE.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
    [SERVICE.FIELDS.NAME]: {
      type: String,
      required: [true, SERVICE.REQUIRED.NAME],
      trim: true,
    },
    [SERVICE.FIELDS.PROVIDER_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, SERVICE.REQUIRED.PROVIDER_ID],
      ref: User,
    },
    [SERVICE.FIELDS.CATEGORY]: {
      type: String,
      required: [true, SERVICE.REQUIRED.CATEGORY],
      enum: { values: CATEGORY_ARRAY, message: SERVICE.CATEGORY_NOT_IN_ENUM },
    },
    [SERVICE.FIELDS.PRICE]: {
      type: Number,
      required: [true, SERVICE.REQUIRED.PRICE],
      min: [0, SERVICE.MIN.PRICE],
      max: [Number.MAX_VALUE, SERVICE.MAX.PRICE],
    },
    [SERVICE.FIELDS.DURATION]: {
      type: Number,
      min: [0, SERVICE.MIN.DURATION],
      max: [360, SERVICE.MAX.DURATION],
    },
    [SERVICE.FIELDS.AVERAGE_RATING]: {
      type: Number,
      min: [0, SERVICE.MIN.AVERAGE_RATING],
      max: [5, SERVICE.MAX.AVERAGE_RATING],
    },
    [SERVICE.FIELDS.PICTURES]: [{ type: Buffer }],
  },
  { versionKey: false }
);

const Service = mongoose.model('service', ServiceSchema);

module.exports = Service;