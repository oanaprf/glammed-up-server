const {
  Types: { ObjectId },
} = require('mongoose');
const omit = require('lodash/fp/omit');
const compose = require('lodash/fp/compose');

const Service = require('../models/service');
const User = require('../models/user');
const {
  USER: {
    FIELDS: { FIRST_NAME, LAST_NAME, FULL_NAME, PHONE_NUMBER, ADDRESS },
    VIRTUALS: { SERVICES },
  },
  SERVICE: {
    FIELDS: { NAME, PROVIDER_ID, CATEGORY },
    VIRTUALS: { PROVIDER, REVIEWS },
  },
  REVIEW: {
    VIRTUALS: { CLIENT },
  },
} = require('../models/constants');
const { ERROR, SUCCESS, getQueryParams, getId, getBody, mapErrors } = require('./constants');

const emptyUsers = { users: [] };
const getServiceWithoutProvider = compose(omit(PROVIDER_ID), getBody);
const populateProvider = {
  path: PROVIDER,
  select: `${FIRST_NAME} ${LAST_NAME} ${FULL_NAME} ${PHONE_NUMBER} ${ADDRESS}`,
};
const populateReview = {
  path: REVIEWS,
  populate: { path: CLIENT, select: `${FIRST_NAME} ${LAST_NAME} ${FULL_NAME}` },
};

const getServiceById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Service.findById(id)
      .populate([populateProvider, populateReview])
      .then(service => {
        if (service) {
          res.status(200).send(service);
        } else res.status(404).send({ error: ERROR.SERVICE.SERVICE_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

const getServices = (req, res) => {
  const { mostPopular } = getQueryParams(req);
  Service.find({
    ...(mostPopular
      ? { averageRating: 5 }
      : { $or: [{ averageRating: { $lt: 5 } }, { averageRating: { $exists: 0 } }] }),
  })
    .populate([populateProvider, populateReview])
    .then(services => res.status(200).send(services))
    .catch(err => res.status(400).send(err));
};

const searchServices = (req, res) => {
  const { name, category } = getQueryParams(req);
  User.find({
    ...(name && {
      $or: [
        {
          [FIRST_NAME]: { $regex: name, $options: 'i' },
        },
        { [LAST_NAME]: { $regex: name, $options: 'i' } },
      ],
      isProvider: true,
    }),
  })
    .populate(SERVICES)
    .then(users =>
      Service.find({
        ...(name && { [NAME]: { $regex: name, $options: 'i' } }),
        ...(category && { [CATEGORY]: category }),
      })
        .populate([populateProvider, populateReview])
        .then(services => res.status(200).send({ ...(name ? { users } : emptyUsers), services }))
        .catch(err => res.status(400).send(err))
    )
    .catch(err => res.status(200).send(err));
};

const getServicesByProvider = (req, res) => {
  const providerId = getId(req);
  if (ObjectId.isValid(providerId)) {
    Service.find({ providerId })
      .populate(populateReview)
      .then(services => res.status(200).send(services))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.PROVIDER_ID_NOT_VALID });
};

const getServiceNamesByProvider = (req, res) => {
  const providerId = getId(req);
  if (ObjectId.isValid(providerId)) {
    Service.find({ providerId }, { name: 1, duration: 1 })
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
                data: mongoService,
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
            data: updatedService,
          });
        } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_NOT_FOUND });
      })
      .catch(error => res.status(400).send(mapErrors(error)));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

module.exports = {
  getServices,
  searchServices,
  getServiceById,
  getServicesByProvider,
  getServiceNamesByProvider,
  createService,
  updateService,
};
