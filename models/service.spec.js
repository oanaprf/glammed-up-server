const getOr = require('lodash/fp/getOr');
const mongoose = require('mongoose');
const Service = require('./service');
const { SERVICE } = require('./constants');

const getErrorMessage = (field, error) =>
  getOr(undefined, ['errors', field, 'message'], error);

describe('test service model', () => {
  test('all good', () => {
    const service = new Service({
      name: 'Nails by Oana',
      providerId: new mongoose.Types.ObjectId(),
      category: 'NAILS',
      price: 25.5,
    });
    const error = service.validateSync();
    expect(error).toBe(undefined);
  });

  test('name required', () => {
    const service = new Service({
      providerId: new mongoose.Types.ObjectId(),
      category: 'NAILS',
      price: 25.5,
    });
    const error = service.validateSync();
    expect(getErrorMessage(SERVICE.FIELDS.NAME, error)).toBe(SERVICE.REQUIRED.NAME);
  });

  test('provider required', () => {
    const service = new Service({
      name: 'Nails by Oana',
      category: 'NAILS',
      price: 25.5,
    });
    const error = service.validateSync();
    expect(getErrorMessage(SERVICE.FIELDS.PROVIDER_ID, error)).toBe(
      SERVICE.REQUIRED.PROVIDER_ID
    );
  });

  test('category required', () => {
    const service = new Service({
      name: 'Nails by Oana',
      providerId: new mongoose.Types.ObjectId(),
      price: 25.5,
    });
    const error = service.validateSync();
    expect(getErrorMessage(SERVICE.FIELDS.CATEGORY, error)).toBe(
      SERVICE.REQUIRED.CATEGORY
    );
  });

  test('price required', () => {
    const service = new Service({
      name: 'Nails by Oana',
      providerId: new mongoose.Types.ObjectId(),
      category: 'NAILS',
    });
    const error = service.validateSync();
    expect(getErrorMessage(SERVICE.FIELDS.PRICE, error)).toBe(SERVICE.REQUIRED.PRICE);
  });

  test('category not in enum', () => {
    const service = new Service({
      name: '4Nails by Oana',
      providerId: new mongoose.Types.ObjectId(),
      category: 'TEST',
      price: 25.5,
    });
    const error = service.validateSync();
    expect(getErrorMessage(SERVICE.FIELDS.CATEGORY, error)).toBe(
      SERVICE.CATEGORY_NOT_IN_ENUM
    );
  });
});
