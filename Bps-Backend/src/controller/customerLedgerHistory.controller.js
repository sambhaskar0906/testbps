import Booking from "../model/booking.model.js";
import Quotation from "../model/customerQuotation.model.js";

import { Customer } from "../model/customer.model.js";

/**
 * Preview invoices based on customer and date range
 * This does NOT mark invoices as generated.
 */
export const previewInvoices = async (req, res) => {
  try {
    const { emailId, contactNumber, orderType, fromDate, endDate } = req.body;

    const customerQuery = emailId ? { emailId } : { mobile: contactNumber };
    const customer = await Customer.findOne(customerQuery);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const startDate = new Date(fromDate);
    const finalEndDate = new Date(endDate);
    let orders = [];

    if (orderType === "Booking") {
      orders = await Booking.find({
        ...req.roleQueryFilter,
        customerId: customer._id,
        bookingDate: { $gte: startDate, $lte: finalEndDate },
      })
        .populate("startStation", "stationName")
        .populate("endStation", "stationName")
        .select("bookingId bookingDate startStation endStation items grandTotal");
    } else if (orderType === "Quotation") {
      orders = await Quotation.find({
        ...req.roleQueryFilter,
        customerId: customer._id,
        quotationDate: { $gte: startDate, $lte: finalEndDate },
      })
        .populate("startStation", "stationName")
        .populate("endStation", "stationName")
        .select("bookingId quotationDate startStation endStation items amount");
    } else {
      return res.status(400).json({ message: "Invalid order type" });
    }

    // Map to include paid & remaining amount logic
    const invoicePreview = orders.map((order, index) => {
      const hasToPay = order.items?.some(item => item.toPay === "pay");
      const totalAmount = order.grandTotal || order.amount || 0;

      const paidAmount = hasToPay ? 0 : totalAmount;
      const remainingAmount = hasToPay ? totalAmount : 0;

      return {
        sno: index + 1,
        bookingId: order.bookingId,
        date: order.bookingDate || order.quotationDate,
        pickupLocation: order.startStation?.stationName || "",
        dropLocation: order.endStation?.stationName || "",
        amount: totalAmount,
        paidAmount,
        remainingAmount
      };
    });

    return res.status(200).json(invoicePreview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error previewing invoices" });
  }
};


/**
 * Mark specific invoices as generated
 * Requires bookingId[] and orderType
 */
export const generateInvoices = async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ message: "No booking IDs provided" });
    }

    // Fetch all bookings and quotations matching the IDs
    const bookings = await Booking.find({ bookingId: { $in: bookingIds } });
    const quotations = await Quotation.find({ bookingId: { $in: bookingIds } });

    // Helper function to determine payment fields
    const determinePaymentStatus = (entry) => {
      const hasToPay = entry.items?.some(item => item.toPay === 'pay');
      const totalAmount = entry.grandTotal || entry.amount || 0;

      return {
        paidAmount: hasToPay ? 0 : totalAmount,
        remainingAmount: hasToPay ? totalAmount : 0,
        totalAmount,
      };
    };

    // Prepare booking update promises
    const bookingPromises = bookings.map(b => {
      const { paidAmount, remainingAmount } = determinePaymentStatus(b);
      return Booking.updateOne(
        { _id: b._id },
        {
          $set: {
            invoiceGenerated: true,
            paidAmount,
            remainingAmount,
          }
        }
      );
    });

    // Prepare quotation update promises
    const quotationPromises = quotations.map(q => {
      const { paidAmount, remainingAmount } = determinePaymentStatus(q);
      return Quotation.updateOne(
        { _id: q._id },
        {
          $set: {
            invoiceGenerated: true,
            paidAmount,
            remainingAmount,
          }
        }
      );
    });

    // Execute all updates in parallel
    const results = await Promise.all([...bookingPromises, ...quotationPromises]);

    const updatedCount = results.reduce((sum, r) => sum + (r.modifiedCount || 0), 0);

    return res.status(200).json({
      message: `Invoices generated for ${updatedCount} records`
    });

  } catch (error) {
    console.error("Error generating invoices:", error);
    return res.status(500).json({ message: "Error generating invoices" });
  }
};





/**
 * Fetch all generated invoices
 */
export const getAllInvoices = async (req, res) => {
  try {
    const bookings = await Booking.find({ ...req.roleQueryFilter, invoiceGenerated: true }).populate(
      "customerId",
      "firstName lastName"
    );

    const quotations = await Quotation.find({ ...req.roleQueryFilter, invoiceGenerated: true }).populate(
      "customerId",
      "firstName lastName"
    );

    const allInvoices = [...bookings, ...quotations];

    const invoiceList = allInvoices.map((invoice, index) => {
      const invoiceId = `BHPAR${String(index + 1).padStart(4, "0")}INVO`;

      const totalAmount = invoice.grandTotal || invoice.amount || 0;

      // If ANY item is marked 'pay', full amount is due
      const hasToPay = invoice.items?.some(item => item.toPay === 'pay');

      const paidAmount = hasToPay ? 0 : totalAmount;
      const remainingAmount = hasToPay ? totalAmount : 0;

      const customerName = invoice.customerId
        ? `${invoice.customerId.firstName} ${invoice.customerId.lastName}`
        : "Unknown Customer";

      return {
        sno: index + 1,
        invoiceId,
        bookingId: invoice.bookingId,
        date: invoice.bookingDate || invoice.quotationDate,
        name: customerName,
        order: invoice.bookingDate ? "Booking" : "Quotation",
        amount: totalAmount,
        paidAmount,
        remainingAmount,
        invoiceLink: `http://localhost:8000/invoices/${invoiceId}`,
      };
    });

    return res.status(200).json(invoiceList);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).json({ message: "Error fetching invoices" });
  }
};
