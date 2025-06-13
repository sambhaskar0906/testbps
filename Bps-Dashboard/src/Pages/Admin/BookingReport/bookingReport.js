import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, TextField, Paper, Stack,
    Button,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

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
        <Box p={3} bgcolor="#f9fafe" minHeight="100vh">
            <Typography variant="h4" fontWeight="bold" color="primary" mb={4} display="flex" alignItems="center" gap={1}>
                <CalendarMonthIcon fontSize="large" />
                Booking Report
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems={'center'}>
                    {[{ label: "From Date", value: fromDate, set: setFromDate }, { label: "End Date", value: endDate, set: setEndDate }].map((item, i) => (
                        <Grid size={{ xs: 12, md: 4 }} key={i}>
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

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Button variant="contained" fullWidth>Submit</Button>
                    </Grid>
                </Grid>

            </Paper>

            {data.map(({ id, bookingCount, billAmount, taxAmount, total }) => (
                <Paper
                    key={id}
                    elevation={3}
                    sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)",
                    }}
                >
                    <Grid container spacing={3}>
                        {[["📦 Booking Count", bookingCount], ["🧾 Bill Amount", billAmount], ["💰 Tax Amount", taxAmount], ["🧮 Total Amount", total]].map(
                            ([label, value], idx) => (
                                <Grid size={{ xs: 12, md: 3 }} key={idx}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" color="textSecondary">{label}</Typography>
                                        <Typography variant="h6" fontWeight={label.includes("Total") ? 'bold' : 'medium'} color={label.includes("Total") ? 'green' : 'black'}>
                                            ₹{value.toLocaleString()}
                                        </Typography>
                                    </Stack>
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
