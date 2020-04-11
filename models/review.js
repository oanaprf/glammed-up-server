const mongoose = require('mongoose');
const { REVIEW } = require('./constants');

const ReviewSchema = new mongoose.Schema({
  [REVIEW.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
  [REVIEW.FIELDS.SERVICE_ID]: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, REVIEW.REQUIRED.SERVICE_ID],
  },
  [REVIEW.FIELDS.CLIENT_ID]: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, REVIEW.REQUIRED.CLIENT_ID],
  },
  [REVIEW.FIELDS.PROVIDER_ID]: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, REVIEW.REQUIRED.PROVIDER_ID],
  },
  [REVIEW.FIELDS.DATE]: {
    type: Date,
    required: [true, REVIEW.REQUIRED.DATE],
  },
  [REVIEW.FIELDS.RATING]: {
    type: Number,
    required: [true, REVIEW.REQUIRED.RATING],
    min: 0,
    max: 5,
  },
  [REVIEW.FIELDS.COMMENT]: {
    type: String,
    minLength: 3,
    maxLength: 100,
    trim: true,
  },
});

const Review = mongoose.model('review', ReviewSchema);

module.exports = Review;
