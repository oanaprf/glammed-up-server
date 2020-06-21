const {
  Types: { ObjectId },
} = require('mongoose');

const Appointment = require('../models/appointment');
const Service = require('../models/service');
const User = require('../models/user');
const {
  ERROR,
  SUCCESS,
  mapErrors,
  findInvalidIdErrorMessage,
  findNotFoundErrorMessage,
  getId,
  getQueryParams,
  getBody,
  getPayloadWithoutIds,
  getProviderTime,
  getFreeSpots,
} = require('./constants');
const {
  USER: {
    FIELDS: { FULL_NAME, START_TIME, END_TIME },
  },
  APPOINTMENT: {
    FIELDS: { ID, SERVICE_ID, PROVIDER_ID, CLIENT_ID, DATE },
    VIRTUALS: { SERVICE, PROVIDER, CLIENT },
  },
  SERVICE: {
    FIELDS: { NAME, PICTURES, CATEGORY, PRICE, DURATION },
  },
} = require('../models/constants');

const populateService = { path: SERVICE, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` };
const populateProvider = { path: PROVIDER, select: `${FULL_NAME}` };
const populateClient = { path: CLIENT, select: `${FULL_NAME}` };

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

const getAppointmentsByClient = (req, res) => {
  const clientId = getId(req);
  const { month, year } = getQueryParams(req);
  if (ObjectId.isValid(clientId)) {
    Appointment.find({
      clientId,
      // eslint-disable-next-line no-nested-ternary
      ...(year
        ? month
          ? {
              date: {
                $gte: new Date(Date.UTC(year, +month - 1, 1)),
                $lt: new Date(Date.UTC(year, month, 1)),
              },
            }
          : {
              date: {
                $gte: new Date(Date.UTC(year, 0)),
                $lt: new Date(Date.UTC(+year + 1, 0)),
              },
            }
        : {}),
    })
      .populate([populateService, populateProvider])
      .then(apps => res.status(200).send(apps))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.REVIEW.CLIENT_ID_NOT_VALID });
};

const getAppointmentsByProvider = async (req, res) => {
  const providerId = getId(req);
  const { month, year, date = '' } = getQueryParams(req);
  if (ObjectId.isValid(providerId)) {
    const dateFromString = new Date(date);
    const dateAfter = new Date(new Date(date).setDate(dateFromString.getDate() + 1));
    Appointment.find({
      providerId,
      // eslint-disable-next-line no-nested-ternary
      ...(date
        ? {
            date: {
              $gte: dateFromString,
              $lt: dateAfter,
            },
          }
        : // eslint-disable-next-line no-nested-ternary
        year
        ? month
          ? {
              date: {
                $gte: new Date(Date.UTC(year, +month - 1, 1)),
                $lt: new Date(Date.UTC(year, month, 1)),
              },
            }
          : {
              date: {
                $gte: new Date(Date.UTC(year, 0)),
                $lt: new Date(Date.UTC(+year + 1, 0)),
              },
            }
        : {}),
    })
      .populate([populateService, populateClient])
      .then(apps => res.status(200).send(apps))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

const createAppointment = async (req, res) => {
  const { serviceId, providerId, clientId, date } = getBody(req);
  const invalidIdErrorMessage = findInvalidIdErrorMessage({
    [SERVICE_ID]: serviceId,
    [PROVIDER_ID]: providerId,
    [CLIENT_ID]: clientId,
  });
  if (invalidIdErrorMessage) res.status(400).send({ error: invalidIdErrorMessage });
  else {
    try {
      const service = await Service.findById(serviceId).exec();
      const provider = await User.findById(providerId).exec();
      const client = await User.findById(clientId).exec();
      const notFoundErrorMessage = findNotFoundErrorMessage({
        [SERVICE_ID]: service,
        [PROVIDER_ID]: provider,
        [CLIENT_ID]: client,
      });
      if (notFoundErrorMessage) res.status(400).send({ error: notFoundErrorMessage });
      else if (await Appointment.findOne({ serviceId, providerId, clientId, date }).exec()) {
        res
          .status(400)
          .send({ error: ERROR.APPOINTMENT.APPOINTMENT_WITH_THIS_DATETIME_ALREADY_EXISTS });
      } else {
        const appointment = new Appointment({
          _id: new ObjectId(),
          serviceId,
          providerId,
          clientId,
          date,
        });
        appointment
          .save()
          .then(mongoAppointment =>
            res.status(201).send({
              message: SUCCESS.APPOINTMENT.APPOINTMENT_SUCCESSFULLY_CREATED,
              data: mongoAppointment,
            })
          )
          .catch(error => res.status(400).send(mapErrors(error)));
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
};

const updateAppointment = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    const appointment = getPayloadWithoutIds(req);
    Appointment.findByIdAndUpdate(id, appointment, { runValidators: true, new: true })
      .then(updatedAppointment => {
        if (updatedAppointment) {
          res.status(200).send({
            message: SUCCESS.APPOINTMENT.APPOINTMENT_SUCCESSFULLY_UPDATED,
            data: updatedAppointment,
          });
        } else res.status(400).send({ error: ERROR.APPOINTMENT.APPOINTMENT_NOT_FOUND });
      })
      .catch(error => res.status(400).send(mapErrors(error)));
  } else res.status(400).send({ error: ERROR.APPOINTMENT.APPOINTMENT_ID_NOT_VALID });
};

const getProviderFreeSpots = async (req, res) => {
  const id = getId(req);
  const { date } = getQueryParams(req);
  let { duration } = getQueryParams(req);
  if (ObjectId.isValid(id)) {
    if (date && duration) {
      duration = +duration;

      const { startTime: start, endTime: end } = await User.findById(
        id,
        `${START_TIME} ${END_TIME}`
      ).exec();

      const startTime = getProviderTime(date, start);
      const endTime = getProviderTime(date, end);

      let appointments = await Appointment.aggregate([
        { $match: { providerId: ObjectId(id) } },
        {
          $match: {
            date: {
              $gte: startTime,
              $lte: endTime,
            },
          },
        },
        {
          $project: {
            [ID]: 0,
            [SERVICE_ID]: 1,
            [PROVIDER_ID]: 1,
            [DATE]: 1,
          },
        },
        { $sort: { date: 1 } },
      ]).exec();
      appointments = await Appointment.populate(appointments, {
        path: SERVICE,
        select: `${DURATION}`,
      });

      appointments = getFreeSpots(appointments, duration, startTime, endTime);
      res.status(200).send(appointments);
    } else res.status(400).send({ error: ERROR.APPOINTMENT.DATE_AND_DURATION_REQUIRED });
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

module.exports = {
  getAppointmentById,
  getAppointmentsByClient,
  getAppointmentsByProvider,
  createAppointment,
  updateAppointment,
  getProviderFreeSpots,
};
