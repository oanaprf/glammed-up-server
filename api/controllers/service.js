const {
  Types: { ObjectId },
} = require('mongoose');
const omit = require('lodash/fp/omit');
const compose = require('lodash/fp/compose');

const Service = require('../models/service');
const Review = require('../models/review');
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

const getServiceWithoutProvider = compose(omit('providerId'), getBody);
const providerFields = `${FIRST_NAME} ${LAST_NAME} ${PHONE_NUMBER} ${ADDRESS}`;

const getServiceById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Service.findById(id)
      .lean()
      .populate(PROVIDER_ID, providerFields)
      .then(async service => {
        if (service) {
          res
            .status(200)
            .send({ ...service, reviews: await Review.find({ serviceId: service._id }).exec() });
        } else res.status(404).send({ error: ERROR.SERVICE.SERVICE_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

const getServices = (_, res) => {
  Service.find()
    .populate(PROVIDER_ID, providerFields)
    .lean()
    .then(async services =>
      res.status(200).send({
        services: await Promise.all(
          services.map(async service => ({
            ...service,
            reviews: await Review.find({ serviceId: service._id }).exec(),
          }))
        ),
      })
    )
    .catch(err => res.status(400).send(err));
};

const searchServices = async (req, res) => {
  const { name, category } = getQueryParams(req);
  let users = [];
  try {
    if (name) {
      users = await User.find({
        $or: [
          {
            [FIRST_NAME]: { $regex: name, $options: 'i' },
          },
          { [LAST_NAME]: { $regex: name, $options: 'i' } },
        ],
      })
        .lean()
        .exec();

      users = await Promise.all(
        users.map(async user => ({
          ...user,
          services: await Service.find({
            providerId: user._id,
          })
            .lean()
            .exec(),
        }))
      );

      users = await Promise.all(
        users.map(async user => ({
          ...user,
          services: await Promise.all(
            user.services.map(async service => ({
              ...service,
              reviews: await Review.find({ serviceId: service._id }).exec(),
            }))
          ),
        }))
      );
    }

    let services = await Service.find({
      ...(name && { [NAME]: { $regex: name, $options: 'i' } }),
      ...(category && { [CATEGORY]: category }),
    })
      .populate(PROVIDER_ID, providerFields)
      .lean()
      .exec();

    services = await Promise.all(
      services.map(async service => ({
        ...service,
        reviews: await Review.find({ serviceId: service._id }).exec(),
      }))
    );

    res.status(200).send({ users, services });
  } catch (err) {
    res.status(400).send(err);
  }
};

const getServicesByProvider = (req, res) => {
  const providerId = getId(req);
  if (ObjectId.isValid(providerId)) {
    Service.find({ providerId })
      .lean()
      .then(async services =>
        res.status(200).send({
          services: await Promise.all(
            services.map(async service => ({
              ...service,
              reviews: await Review.find({ serviceId: service._id }).exec(),
            }))
          ),
        })
      )
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
  searchServices,
  getServiceById,
  getServicesByProvider,
  createService,
  updateService,
};
