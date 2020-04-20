const express = require('express');
const reviewController = require('../controllers/review');

const router = express.Router();

router.get('/review/:id', reviewController.getReviewById);

router.get('/client/:id/reviews', reviewController.getReviewsByClient);

router.get('/service/:id/reviews', reviewController.getReviewsByService);

router.post('/review', reviewController.createReview);

router.put('/review/:id', reviewController.updateReview);

router.delete('/review/:id', reviewController.deleteReview);

module.exports = router;
