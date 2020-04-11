const mongoose = require('mongoose');
const getOr = require('lodash/fp/getOr');
const Review = require('./review');
const { REVIEW } = require('./constants');

const getErrorMessage = (field, error) =>
  getOr(undefined, ['errors', field, 'message'], error);

describe('test review model', () => {
  test('all good', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      serviceId: mongoose.Types.ObjectId(),
      clientId: mongoose.Types.ObjectId(),
      providerId: mongoose.Types.ObjectId(),
      date: Date.now(),
      rating: 4,
    });
    const error = review.validateSync();
    expect(error).toBe(undefined);
  });

  test('service required', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      clientId: mongoose.Types.ObjectId(),
      providerId: mongoose.Types.ObjectId(),
      date: Date.now(),
      rating: 4,
    });
    const error = review.validateSync();
    expect(getErrorMessage(REVIEW.FIELDS.SERVICE_ID, error)).toBe(
      REVIEW.REQUIRED.SERVICE_ID
    );
  });

  test('client required', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      serviceId: mongoose.Types.ObjectId(),
      providerId: mongoose.Types.ObjectId(),
      date: Date.now(),
      rating: 4,
    });
    const error = review.validateSync();
    expect(getErrorMessage(REVIEW.FIELDS.CLIENT_ID, error)).toBe(
      REVIEW.REQUIRED.CLIENT_ID
    );
  });

  test('provider required', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      serviceId: mongoose.Types.ObjectId(),
      clientId: mongoose.Types.ObjectId(),
      date: Date.now(),
      rating: 4,
    });
    const error = review.validateSync();
    expect(getErrorMessage(REVIEW.FIELDS.PROVIDER_ID, error)).toBe(
      REVIEW.REQUIRED.PROVIDER_ID
    );
  });

  test('date required', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      serviceId: mongoose.Types.ObjectId(),
      clientId: mongoose.Types.ObjectId(),
      providerId: mongoose.Types.ObjectId(),
      rating: 4,
    });
    const error = review.validateSync();
    expect(getErrorMessage(REVIEW.FIELDS.DATE, error)).toBe(REVIEW.REQUIRED.DATE);
  });

  test('rating required', () => {
    const review = new Review({
      _id: mongoose.Types.ObjectId(),
      serviceId: mongoose.Types.ObjectId(),
      clientId: mongoose.Types.ObjectId(),
      providerId: mongoose.Types.ObjectId(),
      date: Date.now(),
    });
    const error = review.validateSync();
    expect(getErrorMessage(REVIEW.FIELDS.RATING, error)).toBe(REVIEW.REQUIRED.RATING);
  });
});
