const mongoose = require('mongoose');
const { REVIEW, SERVICE, USER } = require('./constants');
const User = require('./user');
const Service = require('./service');

const ReviewSchema = new mongoose.Schema(
  {
    [REVIEW.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
    [REVIEW.FIELDS.SERVICE_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, REVIEW.REQUIRED.SERVICE_ID],
      ref: Service,
    },
    [REVIEW.FIELDS.CLIENT_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, REVIEW.REQUIRED.CLIENT_ID],
      ref: User,
    },
    [REVIEW.FIELDS.PROVIDER_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, REVIEW.REQUIRED.PROVIDER_ID],
      ref: User,
    },
    [REVIEW.FIELDS.DATE]: {
      type: Date,
      required: [true, REVIEW.REQUIRED.DATE],
    },
    [REVIEW.FIELDS.RATING]: {
      type: Number,
      required: [true, REVIEW.REQUIRED.RATING],
      min: [0, REVIEW.MIN.RATING],
      max: [5, REVIEW.MAX.RATING],
    },
    [REVIEW.FIELDS.COMMENT]: {
      type: String,
      minLength: [3, REVIEW.MIN_LENGTH.COMMENT],
      maxLength: [100, REVIEW.MAX_LENGTH.COMMENT],
      trim: true,
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

ReviewSchema.virtual(REVIEW.VIRTUALS.SERVICE, {
  ref: SERVICE.MODEL,
  localField: REVIEW.FIELDS.SERVICE_ID,
  foreignField: SERVICE.FIELDS.ID,
  justOne: true,
});

ReviewSchema.virtual(REVIEW.VIRTUALS.PROVIDER, {
  ref: USER.MODEL,
  localField: REVIEW.FIELDS.PROVIDER_ID,
  foreignField: USER.FIELDS.ID,
  justOne: true,
});

ReviewSchema.virtual(REVIEW.VIRTUALS.CLIENT, {
  ref: USER.MODEL,
  localField: REVIEW.FIELDS.CLIENT_ID,
  foreignField: USER.FIELDS.ID,
  justOne: true,
});

const Review = mongoose.model(REVIEW.MODEL, ReviewSchema);

module.exports = Review;
