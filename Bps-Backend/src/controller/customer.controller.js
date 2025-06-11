import { Customer } from "../model/customer.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs/promises";
// Helper function to format customer list
const formatCustomerList = (customers) => {
  return customers.map((customer, index) => ({
    sNo: index + 1,
    customerId: customer.customerId,
    name: `${customer.firstName} ${customer.middleName ? customer.middleName + " " : ""}${customer.lastName}`,
    contactNumber: customer.contactNumber,
    firstName: customer.firstName,
    lastName:customer.lastName,
    emailId:customer.emailId

  }));
};

// CREATE Customer
export const createCustomer = asyncHandler(async (req, res) => {
  
  const {
    firstName,
    middleName,
    lastName,
    contactNumber,
    emailId,
    address,
    district,
    state,
    city,
    idProof,
    pincode,
    status = "active",
    isBlacklisted = false,
  } = req.body;

  // Validate required fields
  if ([firstName, lastName, emailId, address, state, city, idProof].some(field => typeof field === "string" && field.trim() === "")) {
    throw new ApiError(400, "All required fields must be provided.");
  }

  // Check for existing email
  const existingCustomer = await Customer.findOne({ emailId });
  if (existingCustomer) {
    throw new ApiError(409, "Email is already registered.");
  }

  // Handle file uploads
  const idProofPhoto = req.files?.idProofPhoto?.[0]?.path || null;
  const customerProfilePhoto = req.files?.customerProfilePhoto?.[0]?.path || null;

  // Create new customer
  const customer = await Customer.create({
    firstName,
    middleName,
    lastName,
    contactNumber,
    emailId,
    address,
    district,
    state,
    city,
    idProof,
    status,
    isBlacklisted,
    idProofPhoto,
    customerProfilePhoto,
    pincode,
    createdBy: req.user._id,
  });


  return res.status(201).json(new ApiResponse(201, "Customer created successfully", customer));
});

// GET All Customers
export const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find(req.roleQueryFilter).lean();
  const customerList = formatCustomerList(customers);

  return res.status(200).json(new ApiResponse(200, "Customers fetched successfully", customerList));
});

// GET Customer by customerId (Full details)
export const getCustomerByCustomerId = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({ customerId: req.params.customerId });

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res.status(200).json(new ApiResponse(200, "Customer fetched successfully", customer));
});

// UPDATE Customer (Full details)
export const updateCustomer = asyncHandler(async (req, res) => {
  const updatedFields = req.body;
  const files = req.files || {};

  // Handle file paths if files were uploaded
  if (files.idProofPhoto) {
    updatedFields.idProofPhoto = files.idProofPhoto[0].path;
  }
  if (files.customerProfilePhoto) {
    updatedFields.customerProfilePhoto = files.customerProfilePhoto[0].path;
  }

  const updatedCustomer = await Customer.findOneAndUpdate(
    { customerId: req.params.customerId },
    updatedFields,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  // Return the updated customer with file paths
  return res.status(200).json(
    new ApiResponse(200, "Customer updated successfully", {
      ...updatedCustomer._doc,
      idProofPhoto: updatedCustomer.idProofPhoto,
      customerProfilePhoto: updatedCustomer.customerProfilePhoto,
    })
  );
});

// DELETE Customer
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const deletedCustomer = await Customer.findOneAndDelete({ customerId });

  if (!deletedCustomer) {
    throw new ApiError(404, "Customer not found");
  }

  return res.status(200).json(new ApiResponse(200, "Customer deleted successfully"));
});

// GET Total Customer Count
export const getTotalCustomerCount = asyncHandler(async (req, res) => {
  const totalCustomer = await Customer.countDocuments(req.roleQueryFilter);

  return res.status(200).json(new ApiResponse(200, "Total customer count fetched successfully", { totalCustomer }));
});

// GET Active Customer Count
export const getActiveCustomerCount = asyncHandler(async (req, res) => {
  const activeCount = await Customer.countDocuments({...req.roleQueryFilter, status: "active", isBlacklisted: { $ne: true }, });

  return res.status(200).json(new ApiResponse(200, "Active customer count fetched successfully", { activeCount }));
});

// GET Blacklisted Customer Count
export const getBlacklistedCustomerCount = asyncHandler(async (req, res) => {
  const blacklistedCount = await Customer.countDocuments({...req.roleQueryFilter, isBlacklisted: true });

  return res.status(200).json(new ApiResponse(200, "Blacklisted customer count fetched successfully", { blacklistedCount }));
});

// GET Active Customers (List)
export const getActiveCustomers = asyncHandler(async (req, res) => {
  const activeCustomers = await Customer.find({...req.roleQueryFilter, status: "active", isBlacklisted: { $ne: true }, }).lean();
  const customerList = formatCustomerList(activeCustomers);

  return res.status(200).json(new ApiResponse(200, "Active customers fetched successfully", customerList));
});

// GET Blacklisted (Blocked) Customers (List)
export const getBlockedCustomers = asyncHandler(async (req, res) => {
  const blockedCustomers = await Customer.find({...req.roleQueryFilter, isBlacklisted: true }).lean();
  const customerList = formatCustomerList(blockedCustomers);

  return res.status(200).json(new ApiResponse(200, "Blocked customers fetched successfully", customerList));
});
// UPDATE customer status to ACTIVE using customerId
export const updateCustomerStatusToActive = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findOne({ customerId });
  if (!customer) {
    throw new ApiError(404, "Customer not found with the given customerId.");
  }

  customer.status = "active";
  customer.isBlacklisted = false;

  await customer.save({ validateModifiedOnly: true });

  return res.status(200).json(
    new ApiResponse(200, "Customer status updated to 'active' successfully", {
      customerId: customer.customerId,
      status: customer.status,
      isBlacklisted: customer.isBlacklisted,
    })
  );
});

// UPDATE customer status to BLACKLISTED using customerId
export const updateCustomerStatusToBlacklisted = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  const customer = await Customer.findOne({ customerId });
  if (!customer) {
    throw new ApiError(404, "Customer not found with the given customerId.");
  }

  customer.isBlacklisted = true;

  await customer.save({ validateModifiedOnly: true });

  return res.status(200).json(
    new ApiResponse(200, "Customer status updated to 'blacklisted' successfully", {
      customerId: customer.customerId,
      status: customer.status,
      isBlacklisted: customer.isBlacklisted,
    })
  );
});

