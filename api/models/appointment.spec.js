const mongoose = require('mongoose');
const getOr = require('lodash/fp/getOr');
const Appointment = require('./appointment');
const { APPOINTMENT } = require('./constants');

const getErrorMessage = (field, error) => getOr(undefined, ['errors', field, 'message'], error);

describe('test appointment model', () => {
  test('all good', () => {
    const appointment = new Appointment({
      serviceId: new mongoose.Types.ObjectId(),
      providerId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      date: Date.now(),
      status: 'APPROVED',
    });
    const error = appointment.validateSync();
    expect(error).toBe(undefined);
  });

  test('service required', () => {
    const appointment = new Appointment({
      providerId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      date: Date.now(),
      status: 'APPROVED',
    });
    const error = appointment.validateSync();
    expect(getErrorMessage(APPOINTMENT.FIELDS.SERVICE_ID, error)).toBe(
      APPOINTMENT.REQUIRED.SERVICE_ID
    );
  });

  test('provider required', () => {
    const appointment = new Appointment({
      serviceId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      date: Date.now(),
      status: 'APPROVED',
    });
    const error = appointment.validateSync();
    expect(getErrorMessage(APPOINTMENT.FIELDS.PROVIDER_ID, error)).toBe(
      APPOINTMENT.REQUIRED.PROVIDER_ID
    );
  });

  test('client required', () => {
    const appointment = new Appointment({
      serviceId: new mongoose.Types.ObjectId(),
      providerId: new mongoose.Types.ObjectId(),
      date: Date.now(),
      status: 'APPROVED',
    });
    const error = appointment.validateSync();
    expect(getErrorMessage(APPOINTMENT.FIELDS.CLIENT_ID, error)).toBe(
      APPOINTMENT.REQUIRED.CLIENT_ID
    );
  });

  test('date required', () => {
    const appointment = new Appointment({
      serviceId: new mongoose.Types.ObjectId(),
      providerId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      status: 'APPROVED',
    });
    const error = appointment.validateSync();
    expect(getErrorMessage(APPOINTMENT.FIELDS.DATE, error)).toBe(APPOINTMENT.REQUIRED.DATE);
  });

  test('status not in enum', () => {
    const appointment = new Appointment({
      serviceId: new mongoose.Types.ObjectId(),
      providerId: new mongoose.Types.ObjectId(),
      clientId: new mongoose.Types.ObjectId(),
      date: Date.now(),
      status: 'TEST',
    });
    const error = appointment.validateSync();
    expect(getErrorMessage(APPOINTMENT.FIELDS.STATUS, error)).toBe(APPOINTMENT.STATUS_NOT_IN_ENUM);
  });
});
