import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    InputAdornment,
    Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveCustomer } from '../features/customers/customerSlice';
import { useNavigate } from 'react-router-dom';

const CustomerSearch = ({ onCustomerSelect }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: customerList } = useSelector((state) => state.customers);

    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        dispatch(fetchActiveCustomer());
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            customerSearch: '',
        },
        validationSchema: Yup.object({
            customerSearch: Yup.string().required('Required'),
        }),
        onSubmit: () => {},
    });

    const { values, touched, errors, handleChange, handleBlur } = formik;

    const handleSearch = () => {
        const value = values.customerSearch.trim().toLowerCase();
        const found = customerList.find((customer) => {
            const contact = customer.contactNumber?.toString().toLowerCase();
            const email = customer.emailId?.toString().toLowerCase();
            return contact === value || email === value;
        });

        if (found) {
            setNotFound(false);
            if (onCustomerSelect) {
                onCustomerSelect(found);
            }
        } else {
            setNotFound(true);
            if (onCustomerSelect) {
                onCustomerSelect(null); // clear in parent
            }
        }
    };

    const handleRegister = () => {
        navigate('/customerForm');
    };

    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                    <TextField
                        fullWidth
                        label="Search Customer (by Contact No. or Email)"
                        name="customerSearch"
                        value={values.customerSearch}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.customerSearch && Boolean(errors.customerSearch)}
                        helperText={
                            (touched.customerSearch && errors.customerSearch) ||
                            (notFound && 'Customer not found')
                        }
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Button onClick={handleSearch} variant="contained">
                                        Search
                                    </Button>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Button fullWidth onClick={handleRegister} variant="contained" sx={{ mt: { xs: 2, sm: 0 } }}>
                        Registration
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomerSearch;
