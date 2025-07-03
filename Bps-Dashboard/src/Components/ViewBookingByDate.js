import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Container,
} from '@mui/material';
import { useParams } from 'react-router-dom';

const bookings = [
    {
        referenceNo: 'REF123',
        fromDate: '03-07-2025',
        senderName: 'Shubham Bhaskar',
        receiverName: 'Ankit Kumar',
        article: '1',
        fromCity: 'Patna',
        toCity: 'Delhi',
        insurance: 'Yes',
        vpp: '500',
        weight: '2kg',
        charge: '150',
        paid: '100',
        toPay: '50',
    },
    {
        referenceNo: 'REF124',
        fromDate: '03-07-2025',
        senderName: 'Amit Singh',
        receiverName: 'Ravi Verma',
        article: '1',
        fromCity: 'Ranchi',
        toCity: 'Kolkata',
        insurance: 'No',
        vpp: '0',
        weight: '0.5kg',
        charge: '80',
        paid: '80',
        toPay: '0',
    },
];

const ViewBookingByDate = () => {
    const { date } = useParams();

    return (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Paper elevation={4} sx={{ p: 3, width: '100%', overflow: 'hidden' }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                    Bookings on: {date}
                </Typography>

                <Box mt={3} sx={{ width: '100%', overflowX: 'hidden' }}>
                    <Table sx={{ width: '100%', tableLayout: 'fixed' }}>
                        <TableHead sx={{ bgcolor: '#1976d2' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>S.No</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Reference No.</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>From Date</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Sender's Name</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Receiver's Name</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Article</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>From City</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>To City</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>V.P.P Rs</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Insurance</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Weight</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Charge</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>Paid</TableCell>
                                <TableCell sx={{ color: '#fff', px: 2, py: 1 }}>To Pay</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.map((booking, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ px: 2, py: 1 }}>{index + 1}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.referenceNo}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.fromDate}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.senderName}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.receiverName}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.article}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.fromCity}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.toCity}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.vpp}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.insurance}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.weight}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.charge}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.paid}</TableCell>
                                    <TableCell sx={{ px: 2, py: 1 }}>{booking.toPay}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>
        </Container>
    );
};

export default ViewBookingByDate;
