const {
  Types: { ObjectId },
} = require('mongoose');

const Appointment = require('../models/appointment');
const { ERROR, getId, getQueryParams } = require('./constants');
const {
  USER: {
    FIELDS: { FIRST_NAME, LAST_NAME },
  },
  APPOINTMENT: {
    FIELDS: { CLIENT_ID, PROVIDER_ID },
    VIRTUALS: { SERVICE, PROVIDER, CLIENT },
  },
  SERVICE: {
    FIELDS: { NAME, PICTURES, CATEGORY, PRICE },
  },
} = require('../models/constants');

const populateService = { path: SERVICE, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` };
const populateProvider = { path: PROVIDER, select: `${FIRST_NAME} ${LAST_NAME}` };
const populateClient = { path: CLIENT, select: `${FIRST_NAME} ${LAST_NAME}` };

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

const getAppointmentsByClient = async (req, res) => {
  const clientId = getId(req);
  const { month, year } = getQueryParams(req);
  if (ObjectId.isValid(clientId)) {
    const appointments = await Appointment.aggregate([
      { $match: { [CLIENT_ID]: ObjectId(clientId) } },
      ...(month
        ? [{ $addFields: { month: { $month: '$date' } } }, { $match: { month: +month } }]
        : []),
      ...(year ? [{ $addFields: { year: { $year: '$date' } } }, { $match: { year: +year } }] : []),
      { $unset: 'month' },
      { $unset: 'year' },
    ]).exec();
    Appointment.populate(appointments, [populateService, populateProvider])
      .then(apps => res.status(200).send(apps))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.REVIEW.CLIENT_ID_NOT_VALID });
};

const getAppointmentsByProvider = async (req, res) => {
  const providerId = getId(req);
  const { month, year, date } = getQueryParams(req);
  if (ObjectId.isValid(providerId)) {
    try {
      const appointments = await Appointment.aggregate([
        { $match: { [PROVIDER_ID]: ObjectId(providerId) } },
        ...(month
          ? [{ $addFields: { month: { $month: '$date' } } }, { $match: { month: +month } }]
          : []),
        ...(year
          ? [{ $addFields: { year: { $year: '$date' } } }, { $match: { year: +year } }]
          : []),
        ...(date
          ? [
              {
                $addFields: {
                  parsedDate: { $dateToString: { date: '$date', format: '%Y-%m-%d' } },
                },
              },
              { $match: { parsedDate: date } },
            ]
          : []),
        ...(month ? [{ $unset: 'month' }] : []),
        ...(year ? [{ $unset: 'year' }] : []),
        ...(date ? [{ $unset: 'parsedDate' }] : []),
      ]).exec();
      Appointment.populate(appointments, [populateService, populateClient])
        .then(apps => res.status(200).send(apps))
        .catch(error => res.status(400).send(error));
    } catch (err) {
      res.status(400).send(err);
    }
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

module.exports = { getAppointmentById, getAppointmentsByClient, getAppointmentsByProvider };
