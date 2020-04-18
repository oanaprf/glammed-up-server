const express = require('express');
const serviceController = require('../controllers/service');

const router = express.Router();

router.get('/services', serviceController.getServices);

router.get('/service/:id', serviceController.getServiceById);

router.get('/provider/:id/services', serviceController.getServicesByProvider);

router.post('/service', serviceController.createService);

router.put('/service/:id', serviceController.updateService);

// TO DO
router.delete('/service/:id');

module.exports = router;
