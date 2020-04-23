const express = require('express');
const appointmentController = require('../controllers/appointment');

const router = express.Router();

router.get('/appointment/:id', appointmentController.getAppointmentById);

router.get('/client/:id/appointments', appointmentController.getAppointmentsByClient);

router.get('/provider/:id/appointments', appointmentController.getAppointmentsByProvider);

router.post('/appointment', appointmentController.createAppointment);

router.put('/appointment/:id', appointmentController.updateAppointment);

module.exports = router;
