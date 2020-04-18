const express = require('express');
const reviewController = require('../controllers/review');

const router = express.Router();

router.get('/client/:id/reviews', reviewController.getReviewsByClient);

module.exports = router;
