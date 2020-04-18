const {
  Types: { ObjectId },
} = require('mongoose');
const omitBy = require('lodash/fp/omitBy');
const compose = require('lodash/fp/compose');

const Service = require('../models/service');
const User = require('../models/user');
const {
  USER: {
    FIELDS: { FIRST_NAME, LAST_NAME, PHONE_NUMBER, ADDRESS },
  },
  SERVICE: {
    FIELDS: { NAME, PROVIDER_ID, CATEGORY },
  },
} = require('../models/constants');
const { ERROR, SUCCESS, getQueryParams, getId, getBody, mapErrors } = require('./constants');

const getServiceWithoutProvider = compose(omitBy('providerId'), getBody);
const providerFields = `${FIRST_NAME} ${LAST_NAME} ${PHONE_NUMBER} ${ADDRESS}`;

const getServices = (req, res) => {
  const { name, category } = getQueryParams(req);
  if (name) {
    User.findOne({
      $or: [
        {
          [FIRST_NAME]: { $regex: name, $options: 'i' },
        },
        { [LAST_NAME]: { $regex: name, $options: 'i' } },
      ],
    })
      .then(user => {
        Service.find({
          $or: [
            {
              [NAME]: { $regex: name, $options: 'i' },
            },
            ...(user ? [{ [PROVIDER_ID]: user._id }] : []),
          ],
          ...(category && { [CATEGORY]: category }),
        })
          .populate(PROVIDER_ID, providerFields)
          .then(services => res.status(200).send(services))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  } else {
    Service.find({
      ...(category && { [CATEGORY]: category }),
    })
      .populate(PROVIDER_ID, providerFields)
      .then(services => res.status(200).send(services))
      .catch(error => res.status(400).send(error));
  }
};

const getServiceById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Service.findById(id)
      .populate(PROVIDER_ID, providerFields)
      .then(service => {
        if (service) res.status(200).send(service);
        else res.status(404).send({ error: ERROR.SERVICE.SERVICE_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

const getServicesByProvider = (req, res) => {
  const providerId = getId(req);
  if (ObjectId.isValid(providerId)) {
    Service.find({ providerId })
      .then(services => res.status(200).send(services))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

const createService = (req, res) => {
  const { providerId, name, price, category, duration, averageRating, pictures } = getBody(req);
  if (ObjectId.isValid(providerId)) {
    User.findById(providerId)
      .then(user => {
        if (user && user.isProvider) {
          const service = new Service({
            _id: new ObjectId(),
            providerId,
            name,
            price,
            category,
            duration,
            averageRating,
            pictures,
          });
          service
            .save()
            .then(mongoService =>
              res.status(201).send({
                message: SUCCESS.SERVICE.SERVICE_SUCCESSFULLY_CREATED,
                service: mongoService,
              })
            )
            .catch(error => res.status(400).send(mapErrors(error)));
        } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

const updateService = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    const service = getServiceWithoutProvider(req);
    Service.findByIdAndUpdate(id, service, { runValidators: true, new: true })
      .then(updatedService => {
        if (updatedService) {
          res.status(200).send({
            message: SUCCESS.SERVICE.SERVICE_SUCCESSFULLY_UPDATED,
            service: updatedService,
          });
        } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_NOT_FOUND });
      })
      .catch(error => res.status(400).send(mapErrors(error)));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

module.exports = {
  getServices,
  getServiceById,
  getServicesByProvider,
  createService,
  updateService,
};
