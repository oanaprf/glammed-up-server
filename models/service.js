const mongoose = require('mongoose');
const { SERVICE } = require('./constants');

const CATEGORY_ARRAY = Object.values(SERVICE.CATEGORY_ENUM);

const ServiceSchema = new mongoose.Schema({
  [SERVICE.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
  [SERVICE.FIELDS.NAME]: {
    type: String,
    required: [true, SERVICE.REQUIRED.NAME],
    trim: true,
  },
  [SERVICE.FIELDS.PROVIDER_ID]: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, SERVICE.REQUIRED.PROVIDER_ID],
  },
  [SERVICE.FIELDS.CATEGORY]: {
    type: String,
    required: [true, SERVICE.REQUIRED.CATEGORY],
    enum: CATEGORY_ARRAY,
  },
  [SERVICE.FIELDS.PRICE]: {
    type: Number,
    required: [true, SERVICE.REQUIRED.PRICE],
    min: 0,
    max: Number.MAX_VALUE,
  },
  [SERVICE.FIELDS.DURATION]: {
    type: Number,
    min: 0,
    max: 6,
  },
  [SERVICE.FIELDS.AVERAGE_RATING]: {
    type: Number,
    min: 0,
    max: 5,
  },
  [SERVICE.FIELDS.PICTURES]: [{ type: Buffer }],
});

const Service = mongoose.model('service', ServiceSchema);

module.exports = Service;
