import Booking from '../model/booking.model.js';
import Station from '../model/manageStation.model.js';
import { Customer } from '../model/customer.model.js';
import nodemailer from 'nodemailer';
import { User } from '../model/user.model.js'
import {sendBookingConfirmation} from './whatsappController.js'
import {sendWhatsAppMessage} from '../services/whatsappServices.js'
import {ApiResponse} from "../utils/ApiResponse.js"
async function resolveStation(name) {
  const station = await Station.findOne({ stationName: new RegExp(`^${name}$`, 'i') });
  if (!station) throw new Error(`Station "${name}" not found`);
  return station._id;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail,
    pass: process.env.app_pass
  }
});
//base condition
const getBookingFilterByType = (type, user) => {
  let baseFilter = {};

  if (type === 'active') {
    baseFilter = { activeDelivery: true };
  } else if (type === 'cancelled') {
    baseFilter = { totalCancelled: { $gt: 0 } };
  } else {
    baseFilter = {
      activeDelivery: false,
      totalCancelled: 0,
      $or: [
        { createdByRole: { $in: ['admin', 'supervisor'] } },
        { requestedByRole: 'public', isApproved: true }
      ]
    };
  }

  if (user?.role === 'supervisor') {
    return {
      $and: [
        baseFilter,
        { createdByUser: user._id }
      ]
    };
  }

  return baseFilter;
};


export const viewBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findOne({
      $or: [{ bookingId: id }]
    })
      .populate('startStation endStation', 'stationName')
      .lean();

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const createBooking = async (req, res) => {
  try {
    const user = req.user;
    const {
      startStation: startName,
      endStation: endName,
      email,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal

    } = req.body;

    if (!email || !startName || !endName || !bookingDate || !deliveryDate || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find customer by email
    const customer = await Customer.findOne({ emailId: email });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found with provided email" });
    }

    // Resolve stations
    const startStation = await resolveStation(startName);
    const endStation = await resolveStation(endName);

    // Ensure resolved stations exist
    if (!startStation || !endStation) {
      return res.status(400).json({ message: "Invalid station names provided" });
    }

    // Create the booking object
    const booking = new Booking({
      customerId: customer._id,
      startStation,
      endStation,
      firstName: customer.firstName,
      middleName: customer.middleName || '',
      lastName: customer.lastName,
      mobile: customer.contactNumber,
      email: customer.emailId,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,  // Array of items passed in request body
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
      createdByUser: user._id,
      createdByRole: user.role,
      requestedByRole: user.role
    });

    // Save the booking
    await booking.save();

    // Send booking confirmation email to customer
    await sendBookingEmail(customer.emailId, booking);
    // Send success response
    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server Error" });
  }
};
export const createPublicBooking = async (req, res) => {
  try {
    const {
      email,
      firstName,
      middleName,
      lastName,
      mobile,
      startStation: startName,
      endStation: endName,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
    } = req.body;

    if (!email || !startName || !endName || !bookingDate || !deliveryDate || !items) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Resolve stations
    const startStation = await resolveStation(startName);
    const endStation = await resolveStation(endName);
    if (!startStation || !endStation) {
      return res.status(400).json({ message: "Invalid station names" });
    }

    // Create booking without customerId
    const booking = new Booking({
      firstName,
      middleName,
      lastName,
      mobile,
      startStation,
      endStation,
      bookingDate,
      deliveryDate,
      senderName,
      senderGgt,
      senderLocality,
      fromState,
      fromCity,
      senderPincode,
      receiverName,
      receiverGgt,
      receiverLocality,
      toState,
      toCity,
      toPincode,
      items,
      addComment,
      freight,
      ins_vpp,
      cgst,
      sgst,
      igst,
      billTotal,
      grandTotal,
      mobile,
      email, // store for reference
      isApproved: false, // pending approval
      requestedByRole: "public"
    });

    await booking.save();
    await sendBookingAcknowledgementEmail(email, booking);
    res.status(201).json({ message: "Booking request submitted. Awaiting admin approval.", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const sendBookingAcknowledgementEmail = async (email, booking) => {
  const {
    senderLocality,
    fromCity,
    fromState,
    senderPincode,
    receiverLocality,
    toCity,
    toState,
    toPincode,
    grandTotal,
    items = []
  } = booking;

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Booking Request Received for-${booking.bookingId}  Pending Confirmation`,
    html: `
      <h2>Booking Request Received</h2>

      <p>Dear Customer,</p>

      <p>Thank you for submitting your parcel booking request with us.</p>
      
      <p>Your request has been received and is currently <strong>awaiting admin approval</strong>.</p>

      <h3>Pickup Address:</h3>
      <p>${senderLocality}, ${fromCity}, ${fromState}, ${senderPincode}</p>

      <h3>Delivery Address:</h3>
      <p>${receiverLocality}, ${toCity}, ${toState}, ${toPincode}</p>

      <h3>Booking Summary:</h3>
      <p>Total Weight: ${totalWeight} kg</p>
      <p>Estimated Amount: ₹${grandTotal}</p>

      <p>You will receive another email with confirmation and tracking ID once your request is approved.</p>

      <p>Best regards, <br /> BharatParcel Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending acknowledgement email:', error);
  }
};

export const sendBookingEmail = async (email, booking) => {
  const {
    firstName,
    lastName,
    senderLocality,
    fromCity,
    fromState,
    senderPincode,
    receiverLocality,
    toState,
    toCity,
    toPincode,
    grandTotal,
    items = []
  } = booking;

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Booking Confirmation - ${booking.bookingId}`,
    html: `
      <h2>Booking Confirmation</h2>

      <p>Dear <strong>${firstName} ${lastName}</strong>,</p>

      <p>Your booking with <strong>Booking ID: ${booking.bookingId}</strong> has been successfully created.</p>

      <h3>From Address:</h3>
      <p>${senderLocality}, ${fromCity}, ${fromState}, ${senderPincode}</p>

      <h3>To Address:</h3>
      <p>${receiverLocality}, ${toCity}, ${toState}, ${toPincode}</p>

      <h3>Product Details:</h3>
      <p>Weight: ${totalWeight} kg</p>
      <p>Amount: ₹${grandTotal}</p>

      <p>Thank you for choosing our service.</p>

      <p>Best regards, <br /> BharatParcel Team</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
   
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

export const sendBookingEmailById = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Populate the 'customerId' field with email and name
    const booking = await Booking.findOne({ bookingId }).populate('customerId', 'emailId firstName lastName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check populated customer data
    const customer = booking.customerId;

    if (!customer?.emailId) {
      return res.status(400).json({ message: 'Customer email not available' });
    }

    // Send the email
    await sendBookingEmail(customer.emailId, {
      ...booking.toObject(),
      firstName: customer.firstName,
      lastName: customer.lastName
    });

    res.status(200).json({ message: 'Booking confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending booking email by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};




export const updateBooking = async (req, res) => {
  
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.startStation) {
      updates.startStation = await resolveStation(updates.startStation);
    }
    if (updates.endStation) {
      updates.endStation = await resolveStation(updates.endStation);
    }

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      updates,
      { new: true }
    ).populate('startStation endStation', 'stationName');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};




export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBooking = await Booking.findOneAndDelete({ bookingId: id });

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking permanently deleted",
      deletedBooking,
    });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: err.message });
  }
};



export const getBookingStatusList = async (req, res) => {
  try {
    const { type } = req.query;
    let filter;
    const user = req.user;
    if (type === 'active') {
      filter = { activeDelivery: true };
    } else if (type === 'cancelled') {
      filter = { totalCancelled: { $gt: 0 } };
    } else {

      filter = {
        activeDelivery: false,
        isDelivered: { $ne: true },
        totalCancelled: 0,
        $or: [
          { createdByRole: { $in: ['admin', 'supervisor'] } }, // Always include bookings created by admin/supervisor
          { requestedByRole: 'public', isApproved: true }        // Only approved bookings created by public users
        ]

      }

    }
    if (user.role === 'supervisor') {

      filter = {
        $and: [
          filter,
          { createdByUser: user._id }
        ]
      };
    }

    const bookings = await Booking.find(filter)

      .select('bookingId firstName lastName senderName receiverName bookingDate mobile startStation endStation requestedByRole')
      .populate('startStation endStation', 'stationName')
      .populate('createdByRole', ' role')
      .lean();

    // Filter out bookings with missing station references
    const validBookings = bookings.filter(b => b.startStation && b.endStation);

    const data = validBookings.map((b, i) => ({
      SNo: i + 1,
      orderBy:
    b.requestedByRole === 'public'
      ? 'Third Party'
      : b.createdByRole || 'N/A',
      date: b.bookingDate?.toISOString().slice(0, 10) || 'N/A',
      fromName: b.senderName || 'N/A',
      pickup: b.startStation?.stationName || 'N/A',
      toName: b.receiverName || 'N/A',
      drop: b.endStation?.stationName || 'N/A',
      contact: b.mobile || 'N/A',
      bookingId: b.bookingId,
      action: {
        view: `/bookings/${b.bookingId}`,
        edit: `/bookings/edit/${b.bookingId}`,
        delete: `/bookings/delete/${b.bookingId}`
      }
    }));

    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getPendingThirdPartyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      requestedByRole: "public",
      isApproved: false,
    })
      .populate('startStation endStation', 'stationName')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};
export const approveThirdPartyBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

    if (!["admin", "supervisor"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.isApproved) {
      return res.status(400).json({ message: "Booking already approved" });
    }

    booking.isApproved = true;
    booking.approvedBy = user.adminId;
    booking.approvedAt = new Date();

    await booking.save();
    await sendBookingEmail(booking.email, booking);
    res.status(200).json({ message: "Booking approved successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const rejectThirdPartyBookingRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = req.user;

   
    

   
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    
    if (booking.isApproved) {
      return res.status(400).json({ message: "Booking already approved, cannot reject" });
    }

    

    await Booking.deleteOne({ bookingId });
    res.status(200).json({ message: "Booking rejected successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// PATCH /api/v2/bookings/:bookingId/cancel
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { bookingId },
      { $inc: { totalCancelled: 1 }, activeDelivery: false },
      { new: true }
    ).populate('startStation endStation', 'stationName');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



export const getBookingRevenueList = async (req, res) => {
  try {
    const user = req.user;
    

    const bookings = await Booking.find(req.roleQueryFilter)
      .select('bookingId bookingDate startStation endStation grandTotal')
      .populate('startStation endStation', 'stationName')
      .lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    const data = bookings
      .filter(b => b.startStation && b.endStation) // Filter out bookings with missing stations
      .map((b, i) => ({
        SNo: i + 1,
        bookingId: b.bookingId,
        date: b.bookingDate?.toISOString().slice(0, 10) || 'N/A',
        pickup: b.startStation?.stationName || 'Unknown',
        drop: b.endStation?.stationName || 'Unknown',
        revenue: b.grandTotal?.toFixed(2) || '0.00',
        action: {
          view: `/bookings/${b.bookingId}`,
          edit: `/bookings/edit/${b.bookingId}`,
          delete: `/bookings/delete/${b.bookingId}`
        }
      }));

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      count: data.length,
      data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// GET /api/v2/bookings/count/requests
export const getBookingRequestsCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('request', user);
    const count = await Booking.countDocuments(filter);
    res.json({ bookingRequests: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/count/active
export const getActiveDeliveriesCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('active', user);
    const count = await Booking.countDocuments(filter);
    res.json({ activeDeliveries: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/count/cancelled
export const getCancelledBookingsCount = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('cancelled', user);
    const count = await Booking.countDocuments(filter);
    res.json({ cancelledCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/v2/bookings/revenue/total
export const getTotalRevenue = async (req, res) => {
  try {
    const user = req.user;
    const filter = getBookingFilterByType('request', user); // request = non-active, non-cancelled
    const bookings = await Booking.find(filter).select('grandTotal').lean();

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    res.json({ totalRevenue: totalRevenue.toFixed(2) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// PATCH /api/v2/bookings/:id/activate
export const activateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { bookingId: id },
      { activeDelivery: true },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking marked as active delivery', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const customerWiseData = async(req,res) =>{
   
  const {fromDate,endDate} = req.body;
  const summary = await Booking.aggregate([
  {
    $match: {
      bookingDate: {
        $gte: new Date(fromDate),
        $lte: new Date(endDate)
      }
    }
  },
  {
    $group: {
      _id: "$customerId",
      totalBookings: { $sum: 1 },
      billTotal: { $sum: "$billTotal" }
    }
  },
  {
    $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "_id",
      as: "customerDetails"
    }
  },
  {
    $unwind: {
      path: "$customerDetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      customerName: {
        $concat: [
          "$customerDetails.firstName", " ",
          { $ifNull: ["$customerDetails.middleName", ""] }, " ",
          "$customerDetails.lastName"
        ]
      },
      totalBookings: 1,
      billTotal: 1
    }
  }
]);

  res.status(200).json(new ApiResponse(200,summary,"Customer booking succesfully fetched sucessfully"));
}
;
