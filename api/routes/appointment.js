const express = require('express');
const appointmentController = require('../controllers/appointment');

const router = express.Router();

router.get('/appointment/:id', appointmentController.getAppointmentById);

router.get('/client/:id/appointments', appointmentController.getAppointmentsByClient);

router.get('/provider/:id/appointments', appointmentController.getAppointmentsByProvider);

module.exports = router;
