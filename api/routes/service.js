const express = require('express');
const serviceController = require('../controllers/service');

const router = express.Router();

router.get('/service/:id', serviceController.getServiceById);

router.get('/services', serviceController.getServices);

router.get('/services/search', serviceController.searchServices);

router.get('/provider/:id/services', serviceController.getServicesByProvider);

router.get('/provider/:id/serviceNames', serviceController.getServiceNamesByProvider);

router.post('/service', serviceController.createService);

router.put('/service/:id', serviceController.updateService);

// TO DO
router.delete('/service/:id');

module.exports = router;
