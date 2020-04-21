const {
  Types: { ObjectId },
} = require('mongoose');

const Appointment = require('../models/appointment');
const { ERROR, getId } = require('./constants');
const {
  REVIEW: {
    FIELDS: { SERVICE_ID, PROVIDER_ID, CLIENT_ID },
  },
  SERVICE: {
    FIELDS: { NAME, PICTURES, CATEGORY, PRICE },
  },
} = require('../models/constants');

const populateService = { path: SERVICE_ID, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` };
const populateProvider = { path: PROVIDER_ID, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` };
const populateClient = { path: CLIENT_ID, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` };

const getAppointmentById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Appointment.findById(id)
      .populate([populateService, populateProvider, populateClient])
      .then(appointment => {
        if (appointment) res.status(200).send(appointment);
        else res.status(404).send({ error: ERROR.APPOINTMENT.APPOINTMENT_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.APPOINTMENT.APPOINTMENT_ID_NOT_VALID });
};

module.exports = { getAppointmentById };
