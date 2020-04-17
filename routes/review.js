const express = require('express');

const Review = require('../models/review');
const { getId } = require('./constants');

const router = express.Router();

router.get('client/:id/reviews', (req, res) => {
  const clientId = getId(req);
  Review.find({ clientId })
    .then(reviews => res.status(200).send(reviews))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
