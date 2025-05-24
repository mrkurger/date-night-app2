import express from 'express';
import { protect } from '../middleware/auth.js';
import appointmentController from '../controllers/appointment.controller.js';
import { ValidationUtils, zodSchemas } from '../utils/validation-utils.js';
import AppointmentSchemas from '../middleware/validators/appointment.validator.js';

const router = express.Router();

// Protect all appointment routes
router.use(protect);

// Get all appointments for current user (customer or advertiser)
router.get('/', appointmentController.getMyAppointments);
// Get single appointment by ID
router.get(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  appointmentController.getAppointmentById
);
// Create a new appointment
router.post(
  '/',
  ValidationUtils.validateWithZod(AppointmentSchemas.createAppointment),
  appointmentController.createAppointment
);
// Update appointment (e.g., confirm/cancel)
router.put(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  ValidationUtils.validateWithZod(AppointmentSchemas.updateAppointment),
  appointmentController.updateAppointment
);
// Delete (cancel) an appointment
router.delete(
  '/:id',
  ValidationUtils.validateWithZod(zodSchemas.objectId, 'params'),
  appointmentController.deleteAppointment
);

export default router;
