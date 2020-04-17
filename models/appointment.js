const mongoose = require('mongoose');
const { APPOINTMENT } = require('./constants');
const User = require('./user');
const Service = require('./service');

const STATUS_ARRAY = Object.values(APPOINTMENT.STATUS_ENUM);

const AppointmentSchema = new mongoose.Schema(
  {
    [APPOINTMENT.FIELDS.ID]: mongoose.Schema.Types.ObjectId,
    [APPOINTMENT.FIELDS.SERVICE_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, APPOINTMENT.REQUIRED.SERVICE_ID],
      ref: Service,
    },
    [APPOINTMENT.FIELDS.PROVIDER_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, APPOINTMENT.REQUIRED.PROVIDER_ID],
      ref: User,
    },
    [APPOINTMENT.FIELDS.CLIENT_ID]: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, APPOINTMENT.REQUIRED.CLIENT_ID],
      ref: User,
    },
    [APPOINTMENT.FIELDS.DATE]: {
      type: Date,
      required: [true, APPOINTMENT.REQUIRED.DATE],
    },
    [APPOINTMENT.FIELDS.STATUS]: {
      type: String,
      required: [true, APPOINTMENT.REQUIRED.STATUS],
      enum: { values: STATUS_ARRAY, message: APPOINTMENT.STATUS_NOT_IN_ENUM },
    },
  },
  { versionKey: false }
);

const Appointment = mongoose.model('appointment', AppointmentSchema);

module.exports = Appointment;
