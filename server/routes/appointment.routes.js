import express from 'express';
import { protect } from '../middleware/auth.js';
import appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

// Protect all appointment routes
router.use(protect);

// Get all appointments for current user (customer or advertiser)
router.get('/', appointmentController.getMyAppointments);
// Get single appointment by ID
router.get('/:id', appointmentController.getAppointmentById);
// Create a new appointment
router.post('/', appointmentController.createAppointment);
// Update appointment (e.g., confirm/cancel)
router.put('/:id', appointmentController.updateAppointment);
// Delete (cancel) an appointment
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
