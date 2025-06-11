import React, { useEffect } from "react";
import { Formik, Form, Field, FieldArray } from "formik";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from 'react-redux';
import { fetchStates, fetchCities, clearCities } from '../../../../features/Location/locationSlice';
import { createBooking } from "../../../../features/quotation/quotationSlice";
import { fetchStations } from '../../../../features/stations/stationSlice'
import CustomerSearch from "../../../../Components/CustomerSearch";
import { Navigate, useNavigate } from "react-router-dom";
const toPay = ['pay', 'paid', 'none'];

const initialValues = {
  firstName: "",
  lastName: "",
  startStationName: null,
  endStation: null,
  locality: "",
  quotationDate: "",
  proposedDeliveryDate: "",
  fromCustomerName: "",
  fromAddress: "",
  fromState: "",
  fromCity: "",
  fromPincode: "",
  toCustomerName: "",
  toAddress: "",
  toState: "",
  toCity: "",
  toPincode: "",
  amount: "",
  sgst: "",
  additionalCmt: "",
  productDetails: [
    {
      name: "",
      quantity: "",
      weight: "",
      price: "",
      topay: "none",
    },
  ],

  addComment: "",


  billTotal: "",

  stax: "",

  grandTotal: "",
};

const QuotationForm = () => {
  const [senderCities, setSenderCities] = React.useState([]);
  const [receiverCities, setReceiverCities] = React.useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { states, cities } = useSelector((state) => state.location);
  const { list: stations } = useSelector((state) => state.stations);
  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchStations());
  }, [dispatch]);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values, formikHelpers) => {
          try {
            await dispatch(createBooking(values)).unwrap();
            formikHelpers.resetForm();
            navigate('/quotation')
          } catch (error) {
            console.log("Error while adding booking", error);
          }
        }}
      >
        {({ values, handleChange, setFieldValue }) => {
          const handleUpdate = (index) => {
            const item = values.productDetails[index];

            if (!item.No.OfParcel || !item.weightKgs || !item.amount) {
              setSnackbar({
                open: true,
                message: "Please fill all required fields for this item",
                severity: "error",
              });
              return;
            }

            console.log("Updating item:", item);
            setSnackbar({
              open: true,
              message: `Item ${index + 1} updated successfully!`,
              severity: "success",
            });
          };

          return (
            <Form>
              <EffectSyncCities values={values} dispatch={dispatch} setSenderCities={setSenderCities}
                setReceiverCities={setReceiverCities} />
              <EffectSyncTotal values={values} setFieldValue={setFieldValue} />
              <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Edit Customer Quotation
                  </Typography>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Start Station"
                      name="startStationName"
                      value={values.startStationName}
                      onChange={handleChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                          {station.stationName}

                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="Destination Station"
                      name="endStation"
                      value={values.endStation}
                      onChange={handleChange}
                    >
                      {stations.map((station) => (
                        <MenuItem key={station.stationId || station.sNo} value={station.stationName}>
                          {station.stationName}

                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid container columnSpacing={2} rowSpacing={2}>
                    <Grid xs={12} sm={6}>
                      <DatePicker
                        label="Booking Date"
                        value={values.quotationDate}
                        onChange={(val) => setFieldValue("quotationDate", val)}
                        minDate={new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "quotationDate",
                            error: false,
                            InputProps: {
                              sx: { width: 490 }, // Increase height here
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <DatePicker
                        label="Proposed Delivery Date"
                        value={values.proposedDeliveryDate}
                        onChange={(val) => setFieldValue("proposedDeliveryDate", val)}
                        minDate={values.quotationDate || new Date()}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            name: "proposedDeliveryDate",
                            error: false,
                            InputProps: {
                              sx: { width: 490 },// Increase height here too
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <CustomerSearch
                    onCustomerSelect={(customer) => {
                      if (customer) {
                        setFieldValue("firstName", customer.firstName || "");
                        setFieldValue("middleName", customer.middleName || "");
                        setFieldValue("lastName", customer.lastName || "");
                        setFieldValue("contactNumber", customer.contactNumber?.toString() || "");
                        setFieldValue("email", customer.emailId || "");
                      } else {
                        setFieldValue("firstName", "");
                        setFieldValue("middleName", "");
                        setFieldValue("lastName", "");
                        setFieldValue("contactNumber", "");
                        setFieldValue("email", "");
                      }
                    }}
                  />


                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">From (Address)</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="fromCustomerName"
                      value={values.fromCustomerName}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="fromAddress"
                      value={values.fromAddress}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="State"
                      name="fromState"
                      value={values.fromState}
                      onChange={handleChange}
                    >
                      {states.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="City"
                      name="fromCity"
                      value={values.fromCity}
                      onChange={handleChange}
                    >
                      {senderCities.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="fromPincode"
                      value={values.fromPincode}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">To (Address)</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="toCustomerName"
                      value={values.toCustomerName}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Locality / Street"
                      name="toAddress"
                      value={values.toAddress}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="State"
                      name="toState"
                      value={values.toState}
                      onChange={handleChange}
                    >
                      {states.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      fullWidth
                      label="City"
                      name="toCity"
                      value={values.toCity}
                      onChange={handleChange}
                    >
                      {receiverCities.map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Pin Code"
                      name="toPincode"
                      value={values.toPincode}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6">Product Details</Typography>
                  </Grid>

                  <FieldArray name="productDetails">
                    {({ push, remove, form }) => (
                      <>
                        {form.values.productDetails.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Field
                              name={`productDetails[${index}].name`}
                              as={TextField}
                              label="Product Name"
                              fullWidth
                            />
                            <Field
                              name={`productDetails[${index}].quantity`}
                              as={TextField}
                              label="Quantity"
                              type="number"
                              fullWidth
                            />
                            <Field
                              name={`productDetails[${index}].weight`}
                              as={TextField}
                              label="Weight (kg)"
                              type="number"
                              fullWidth
                            />
                            <Field
                              name={`productDetails[${index}].price`}
                              as={TextField}
                              label="Price"
                              type="number"
                              fullWidth
                            />
                            <Field
                              name={`productDetails[${index}].topay`}
                              as={TextField}
                              select
                              label="Topay / Paid"
                              fullWidth
                            >
                              <MenuItem value="paid">Paid</MenuItem>
                              <MenuItem value="toPay">To Pay</MenuItem>
                              <MenuItem value="none">None</MenuItem>
                            </Field>
                            <IconButton onClick={() => remove(index)}>
                              <DeleteIcon />
                            </IconButton>
                            <Button
                              type="button"
                              onClick={() =>
                                push({
                                  name: "",
                                  quantity: "",
                                  weight: "",
                                  price: "",
                                  topay: "none",
                                })
                              }
                              startIcon={<AddIcon />}
                            >
                              Add
                            </Button>
                          </Box>
                        ))}
                      </>
                    )}
                  </FieldArray>



                  <Grid size={{ xs: 12, md: 9 }}>
                    <TextField
                      name="comments"
                      label="Additional Comments"
                      multiline
                      minRows={10}
                      fullWidth
                      value={values.comments}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      name="sTax"
                      label="sTax %"
                      value={values.sTax}
                      onChange={(e) => {
                        // Convert to number and ensure it's valid
                        const value = parseFloat(e.target.value);
                        setFieldValue("sTax", isNaN(value) ? 0 : value); // Default to 0 if invalid
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          name="amount"
                          label="Amount"
                          value={values.amount}
                          InputProps={{ readOnly: true }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          name="grandTotal"
                          label="Grand Total"
                          value={values.grandTotal}
                          InputProps={{ readOnly: true }}
                          fullWidth
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Grid>




                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                    >
                      Submit All
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
              >
                <Alert
                  onClose={handleCloseSnackbar}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Form>
          );
        }}
      </Formik>
    </LocalizationProvider>
  );
};
const EffectSyncCities = ({ values, dispatch, setSenderCities, setReceiverCities }) => {
  useEffect(() => {
    if (values.fromState) {
      dispatch(fetchCities(values.fromState))
        .unwrap()
        .then((res) => setSenderCities(res))
        .catch(console.error);
    } else {
      setSenderCities([]);
    }
  }, [values.fromState, dispatch]);

  useEffect(() => {
    if (values.toState) {
      dispatch(fetchCities(values.toState))
        .unwrap()
        .then((res) => setReceiverCities(res))
        .catch(console.error);
    } else {
      setReceiverCities([]);
    }
  }, [values.toState, dispatch]);

  return null;
};
const EffectSyncTotal = ({ values, setFieldValue }) => {
  useEffect(() => {
    let totalAmount = 0;

    values.productDetails.forEach((item) => {
      const amount = parseFloat(item.price) || 0;
      totalAmount += amount;
    });

    const sTax = parseFloat(values.sTax) || 0;
    const grandTotal = totalAmount + sTax;

    setFieldValue("amount", totalAmount.toFixed(2));      // Store just the sum of product prices
    setFieldValue("grandTotal", grandTotal.toFixed(2));   // Add sTax for display
  }, [values.productDetails, values.sTax]);
};



export default QuotationForm;