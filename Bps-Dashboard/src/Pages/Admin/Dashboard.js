import React, { useEffect } from 'react';
import {
    Typography,
    Paper,
    Grid,
    Card,
    Box,
    Avatar,
} from '@mui/material';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import Graph from './Graph';

// Import SVG as a React component
import { ReactComponent as CustomIcon } from '../../../src/assets/station/mng1.svg';
import { ReactComponent as WrongIcon } from '../../../src/assets/station/wrong.svg';
import { ReactComponent as ActiveIcon } from '../../../src/assets/station/active.svg';
import { ReactComponent as RsIcon } from '../../../src/assets/station/rs.svg';
import { ReactComponent as CustomerIcon } from '../../../src/assets/station/driver.svg';
import { ReactComponent as TruckIcon } from '../../../src/assets/truck.svg';
import { useSelector, useDispatch } from 'react-redux'
import { bookingRequestCount, activeBookingCount, cancelledBookingCount, revenueList } from '../../features/booking/bookingSlice';
import { getAvailableVehiclesCount } from '../../features/vehicle/vehicleSlice';
import { fetchavailableCount } from '../../features/Driver/driverSlice';
import { fetchActiveCustomerCount } from '../../features/customers/customerSlice';


const cardStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    height: '100%',
    boxShadow: 4,
    backgroundColor: '#fff',
    borderRadius: 3,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.03)',
        boxShadow: 6,
    },
};

const Dashboard = () => {
    const dispatch = useDispatch();
    const { requestCount, activeDeliveriesCount, cancelledDeliveriesCount, totalRevenue } = useSelector(state => state.bookings);
    const { availablecount } = useSelector(state => state.vehicles);
    const { availableCount } = useSelector(state => state.drivers);
    const { activeCount } = useSelector(state => state.customers);
    useEffect(() => {
        dispatch(bookingRequestCount());
        dispatch(activeBookingCount());
        dispatch(cancelledBookingCount());
        dispatch(revenueList());
        dispatch(getAvailableVehiclesCount());
        dispatch(fetchActiveCustomerCount());
        dispatch(fetchavailableCount())

    }, [dispatch])

    const summaryData = [
        {
            title: 'Booking Requests',
            value: requestCount,
            icon: <CustomIcon style={{ width: 32, height: 32 }} />,
        },
        {
            title: 'Active Deliveries',
            value: activeDeliveriesCount,
            icon: <ActiveIcon style={{ width: 32, height: 32 }} />,
        },
        {
            title: 'Total Cancelled',
            value: cancelledDeliveriesCount,
            icon: <WrongIcon style={{ width: 32, height: 32 }} />,

        },
        {
            title: 'Total Revenue',
            value: totalRevenue,
            icon: <RsIcon style={{ width: 32, height: 32 }} />,
        },
        {
            title: 'Customers',
            value: activeCount,
            icon: <CustomerIcon style={{ width: 110, height: 110 }} />,
        },
        {
            title: 'Vehicles Available',
            value: availablecount,
            icon: <TruckIcon style={{ width: 110, height: 110 }} />,
        },
        {
            title: 'Drivers Available',
            value: availableCount,
            icon: <CustomerIcon style={{ width: 110, height: 110 }} />,
        },
    ];
    return (
        <Box sx={{ p: 3 }}>
            {/* Dashboard Title */}
            <Typography variant="h5" fontWeight="bold" mb={3}>
                Dashboard
            </Typography>

            {/* Row 1 - 4 Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {summaryData.slice(0, 4).map((item, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index} sx={{ height: '100%' }}>
                        <Card sx={cardStyles}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                {item.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {item.title}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {item.value}
                                </Typography>
                                {item.subtitle && (
                                    <Typography variant="caption" color="text.secondary">
                                        {item.subtitle}
                                    </Typography>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Row 2 - 3 Cards with bottom spacing */}
            <Grid container spacing={3} sx={{ mb: 4 }} mr={6}>
                {summaryData.slice(4).map((item, index) => (
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }} key={index} sx={{ height: '100%' }}>
                        <Card sx={cardStyles}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 122, height: 122 }}>
                                {item.icon}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">
                                    {item.title}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {item.value}
                                </Typography>
                                {item.subtitle && (
                                    <Typography variant="caption" color="text.secondary">
                                        {item.subtitle}
                                    </Typography>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Graph Section */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Performance Overview
                </Typography>
                <Graph />
            </Paper>
        </Box>
    );
};

export default Dashboard;