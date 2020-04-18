const Review = require('../models/review');
const { getId } = require('./constants');
const {
  REVIEW: {
    FIELDS: { SERVICE_ID, PROVIDER_ID },
  },
  SERVICE: {
    FIELDS: { NAME, PICTURES, CATEGORY, PRICE },
  },
  USER: {
    FIELDS: { FIRST_NAME, LAST_NAME },
  },
} = require('../models/constants');

const populateQuery = [
  { path: SERVICE_ID, select: `${NAME} ${CATEGORY} ${PRICE} ${PICTURES}` },
  { path: PROVIDER_ID, select: `${FIRST_NAME} ${LAST_NAME}` },
];

const getReviewsByClient = (req, res) => {
  const clientId = getId(req);
  Review.find({ clientId })
    .populate(populateQuery)
    .then(reviews => res.status(200).send(reviews))
    .catch(error => res.status(400).send(error));
};

module.exports = { getReviewsByClient };
