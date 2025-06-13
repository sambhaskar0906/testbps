import express from 'express';
import {
  viewBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingStatusList,
  getBookingRevenueList,
  activateBooking,
  cancelBooking,
  getBookingRequestsCount,
  getActiveDeliveriesCount,
  getCancelledBookingsCount,
  getTotalRevenue,
  sendBookingEmail,
  createPublicBooking,
  getPendingThirdPartyBookings,
  approveThirdPartyBookingRequest,
  rejectThirdPartyBookingRequest,
  sendBookingEmailById,
  customerWiseData,
  overallBookingSummary
} from '../controller/booking.controller.js';

import { parseFormData } from "../middleware/multerParser.middleware.js";
import { verifyJwt } from '../middleware/auth.middleware.js'
const router = express.Router();

router.get('/booking-list', verifyJwt, getBookingStatusList);
router.get('/revenue-list', verifyJwt, getBookingRevenueList);
router.get('/bookings/count/requests', verifyJwt, getBookingRequestsCount);
router.get('/bookings/count/active', verifyJwt, getActiveDeliveriesCount);
router.get('/bookings/count/cancelled', verifyJwt, getCancelledBookingsCount);
router.get('/bookings/revenue/total', verifyJwt, getTotalRevenue);
router.post('/send-booking-email', sendBookingEmail);
router.post('/send-booking-email/:bookingId', sendBookingEmailById);
router.patch('/reject/:bookingId', rejectThirdPartyBookingRequest);
router.get('/summary', customerWiseData);
//  CRUD routes AFTER static routes
router.post('/public', createPublicBooking);
router.get("/pending", verifyJwt, getPendingThirdPartyBookings);
router.patch("/:bookingId/approve", verifyJwt, approveThirdPartyBookingRequest);
router.post('/', verifyJwt, createBooking);           // Create a new booking
router.patch('/:id/activate', activateBooking);
router.patch('/:bookingId/cancel', cancelBooking);
router.get('/:id', viewBooking);           // View by bookingId (not _id!)
router.put('/:id', updateBooking);         // Update by bookingId
router.delete('/:id', deleteBooking);      // Delete by bookingId
router.post('/overallBookingSummary', overallBookingSummary);

export default router;