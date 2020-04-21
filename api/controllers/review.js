const {
  Types: { ObjectId },
} = require('mongoose');
const compose = require('lodash/fp/compose');
const omit = require('lodash/fp/omit');

const Review = require('../models/review');
const User = require('../models/user');
const Service = require('../models/service');
const {
  ERROR,
  SUCCESS,
  mapErrors,
  getId,
  getBody,
  findInvalidIdErrorMessage,
  findNotFoundErrorMessage,
} = require('./constants');
const {
  REVIEW: {
    FIELDS: { SERVICE_ID, PROVIDER_ID, CLIENT_ID },
    VIRTUALS: { SERVICE, PROVIDER, CLIENT },
  },
  SERVICE: {
    FIELDS: { NAME, PICTURES, CATEGORY, PRICE },
  },
  USER: {
    FIELDS: { FIRST_NAME, LAST_NAME },
  },
} = require('../models/constants');

const populateQuery = [
  { path: SERVICE, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` },
  { path: PROVIDER, select: `${FIRST_NAME} ${LAST_NAME}` },
];
const getReviewWithoutIds = compose(omit([SERVICE_ID, PROVIDER_ID, CLIENT_ID]), getBody);

const getReviewById = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Review.findById(id)
      .populate(populateQuery)
      .then(review => {
        if (review) res.status(200).send(review);
        else res.status(404).send({ error: ERROR.REVIEW.REVIEW_NOT_FOUND });
      })
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.REVIEW.REVIEW_ID_NOT_VALID });
};

const getReviewsByClient = (req, res) => {
  const clientId = getId(req);
  if (ObjectId.isValid(clientId)) {
    Review.find({ clientId })
      .populate(populateQuery)
      .then(reviews => res.status(200).send(reviews))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.REVIEW.CLIENT_ID_NOT_VALID });
};

const getReviewsByService = (req, res) => {
  const serviceId = getId(req);
  if (ObjectId.isValid(serviceId)) {
    Review.find({ serviceId })
      .populate({ path: CLIENT, select: `${FIRST_NAME} ${LAST_NAME}` })
      .then(reviews => res.status(200).send(reviews))
      .catch(error => res.status(400).send(error));
  } else res.status(400).send({ error: ERROR.SERVICE.SERVICE_ID_NOT_VALID });
};

const createReview = async (req, res) => {
  const { serviceId, providerId, clientId, date, rating, comment } = getBody(req);
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
      else if (await Review.findOne({ serviceId, clientId }).exec()) {
        res.status(400).send({ error: ERROR.REVIEW.CLIENT_ALREADY_REVIEWED_SERVICE });
      } else {
        const review = new Review({
          _id: new ObjectId(),
          serviceId,
          providerId,
          clientId,
          date,
          rating,
          comment,
        });
        review
          .save()
          .then(mongoReview =>
            res.status(201).send({
              message: SUCCESS.REVIEW.REVIEW_SUCCESSFULLY_CREATED,
              review: mongoReview,
            })
          )
          .catch(error => res.status(400).send(mapErrors(error)));
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
};

const updateReview = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    const review = getReviewWithoutIds(req);
    Review.findByIdAndUpdate(id, review, { runValidators: true, new: true })
      .then(updatedReview => {
        if (updatedReview) {
          res.status(200).send({
            message: SUCCESS.REVIEW.REVIEW_SUCCESSFULLY_UPDATED,
            service: updatedReview,
          });
        } else res.status(400).send({ error: ERROR.REVIEW.REVIEW_NOT_FOUND });
      })
      .catch(error => res.status(400).send(mapErrors(error)));
  } else res.status(400).send({ error: ERROR.REVIEW.REVIEW_ID_NOT_VALID });
};

const deleteReview = (req, res) => {
  const id = getId(req);
  if (ObjectId.isValid(id)) {
    Review.findByIdAndDelete(id)
      .then(deletedReview => {
        if (deletedReview) {
          res.status(200).send({
            message: SUCCESS.REVIEW.REVIEW_SUCCESSFULLY_DELETED,
          });
        } else res.status(400).send({ error: ERROR.REVIEW.REVIEW_NOT_FOUND });
      })
      .catch(error => res.status(400).send(mapErrors(error)));
  } else res.status(400).send({ error: ERROR.REVIEW.REVIEW_ID_NOT_VALID });
};

module.exports = {
  getReviewById,
  getReviewsByClient,
  getReviewsByService,
  createReview,
  updateReview,
  deleteReview,
};
