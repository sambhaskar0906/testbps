import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, TextField, Paper,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Dummy API data structure placeholder
const apiData = [
    { id: 1, bookingCount: 5, billAmount: 15000, taxAmount: 1350, total: 16350 },
];

const BookingReport = () => {
    const [fromDate, setFromDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [data, setData] = useState([]);

    useEffect(() => {
        setData(apiData);
    }, []);

    return (
        <Box p={3}>
            <Typography variant="h5" mb={3} fontWeight="bold" color="primary" gutterBottom>
                📋 Booking Report
            </Typography>

            <Grid container spacing={2} mb={3}>
                {[{ label: "From Date", value: fromDate, set: setFromDate }, { label: "End Date", value: endDate, set: setEndDate }].map((item, i) => (
                    <Grid size={{ xs: 12, md: 6 }} key={i}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label={item.label}
                                value={item.value}
                                onChange={item.set}
                                renderInput={(params) => <TextField fullWidth {...params} />}
                            />
                        </LocalizationProvider>
                    </Grid>
                ))}
            </Grid>

            {data.map(({ id, bookingCount, billAmount, taxAmount, total }) => (
                <Paper key={id} sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: '#f0f8ff' }}>
                    <Grid container spacing={2}>
                        {[["Booking Count", bookingCount], ["Bill Amount", billAmount], ["Tax Amount", taxAmount], ["Total Amount", total]].map(
                            ([label, value], idx) => (
                                <Grid size={{ xs: 6, md: 3 }} key={idx}>
                                    <Typography fontWeight={label === "Total Amount" ? 'bold' : 500}>
                                        {label}: ₹{value}
                                    </Typography>
                                </Grid>
                            )
                        )}
                    </Grid>
                </Paper>
            ))}
        </Box>
    );
};

export default BookingReport;
