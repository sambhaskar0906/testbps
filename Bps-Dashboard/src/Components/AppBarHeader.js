import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Tooltip,
    Menu,
    MenuItem,
    Divider,
    ListItemIcon,
    Badge,
    Paper,
    Stack,
    Button,
    Card,
} from '@mui/material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { pendingList, approveList,rejectThridParty } from '../features/booking/bookingSlice'
import { changePassword } from '../features/user/userSlice';


const AppBarHeader = () => {
    const dispatch = useDispatch();
    const { list2: pending } = useSelector(state => state.bookings);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState(null);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const open = Boolean(anchorEl);
    const notifOpen = Boolean(notifAnchorEl);
    const userRole = localStorage.getItem('userRole');

    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        try {
            const result = await dispatch(changePassword({ oldpassword: oldPassword, newPassword }));

            if (result.type === 'auth/changePassword/fulfilled') {
                alert('Password changed successfully!');
                setOpenChangePassword(false);
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                alert(result.payload || 'Failed to change password');
            }
        } catch (err) {
            alert('Something went wrong');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.get('http://localhost:8000/api/v2/users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    setUser(response.data.message);
                })
                .catch(error => {
                    console.error('Failed to fetch profile:', error);
                    setUser(null);
                });
        }


        dispatch(pendingList());

    }, [dispatch]);


    useEffect(() => {
        console.log("Pending bookings:", pending);
        if (pending && pending.length > 0) {
            const exampleNotifications = pending.map(booking => ({
                id: booking.bookingId,
                type: 'Booking',
                message: booking.firstName,
            }));
            setNotifications(exampleNotifications);
        }
    }, [pending]);

    const handleOpenMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleNotifClick = (event) => {
        setNotifAnchorEl(event.currentTarget);
    };

    const handleNotifClose = () => {
        setNotifAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "http://localhost:5173/login";
    };

    const handleAccept = (bookingId) => {
        dispatch(approveList(bookingId))
        window.location.reload();

    };

    const handleReject = (bookingId) => {
      dispatch(rejectThridParty(bookingId))
       window.location.reload();

    };

    const getNotifIcon = (type) => {
        if (type === 'Booking') return <AssignmentTurnedInIcon color="info" />;
        return <NotificationsIcon />;
    };
    const handleView = (bookingId) => {
        handleNotifClose();
        navigate(`/booking/${bookingId}`);
    };

    return (
        <AppBar position="static" sx={{ zIndex: 1201, bgcolor: '#1976d2' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap>
                    {userRole} Dashboard
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* ✅ Show notifications ONLY to admin */}
                    {userRole === 'admin' && (
                        <Tooltip title="Notifications">
                            <IconButton onClick={handleNotifClick} color="inherit">
                                <Badge badgeContent={notifications.length} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}

                    <Tooltip title="Open Profile Menu">
                        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                            <Avatar
                                alt={user?.name}
                                src={`http://localhost:8000/${user?.adminProfilePhoto?.replace(/\\/g, '/')}`}
                                sx={{ width: 40, height: 40 }}
                            />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseMenu}
                    PaperProps={{
                        elevation: 6,
                        sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            minWidth: 220,
                            p: 1,
                            bgcolor: '#fff',
                            '& .MuiMenuItem-root': {
                                borderRadius: 1,
                                mb: 0.5,
                            },
                        },
                    }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                >
                    <MenuItem sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar
                            src={`http://localhost:8000/${user?.adminProfilePhoto?.replace(/\\/g, '/')}`}
                            sx={{ width: 40, height: 40 }}
                        />
                        <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary">
                                Admin Id: {user?.adminId}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.emailId}
                            </Typography>
                        </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography color="error">Logout</Typography>
                    </MenuItem>

                    <MenuItem onClick={() => setOpenChangePassword(true)}>
                        <ListItemIcon>
                            <LockResetIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <Typography>Change Password</Typography>
                    </MenuItem>
                </Menu>

                <Dialog open={openChangePassword} onClose={() => setOpenChangePassword(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                type="password"
                                label="Old Password"
                                fullWidth
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <TextField
                                type="password"
                                label="New Password"
                                fullWidth
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <TextField
                                type="password"
                                label="Confirm New Password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={() => setOpenChangePassword(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={handleChangePassword} variant="contained" color="primary">
                            Update Password
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Notification Menu */}
                <Menu
                    anchorEl={notifAnchorEl}
                    open={notifOpen}
                    onClose={handleNotifClose}
                    PaperProps={{
                        elevation: 6,
                        sx: {
                            mt: 1.5,
                            borderRadius: 2,
                            minWidth: 320,
                            maxWidth: 400,
                            maxHeight: 500,
                            p: 2,
                            bgcolor: '#f9f9f9',
                            overflowY: 'auto',
                        },
                    }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                >
                    <Typography variant="h6" sx={{ mb: 1, px: 1 }}>
                        Notifications
                    </Typography>

                    {notifications.length === 0 ? (
                        <Typography variant="body2" sx={{ px: 1 }}>
                            No new notifications
                        </Typography>
                    ) : (
                        notifications.map((notif) => (
                            <Paper
                                key={notif.id}
                                elevation={2}
                                sx={{
                                    p: 2,
                                    mb: 1.5,
                                    borderRadius: 2,
                                    transition: '0.3s',
                                    '&:hover': { boxShadow: 4 }
                                }}
                            >
                                <Card sx={{ mb: 1, p: 1 }}>
                                    <Box display="flex" alignItems="center">
                                        {getNotifIcon(notif.type)}
                                        <Typography variant="body1" fontWeight={500} sx={{ ml: 1 }}>
                                            {notif.message}
                                        </Typography>
                                        <Box sx={{ ml: 'auto' }}>
                                            <Tooltip title={`View ${notif.type}`}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleView(notif.id)}
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Card>
                                <Stack direction="row" spacing={1} mt={2}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleAccept(notif.id)}
                                        fullWidth
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleReject(notif.id)}
                                        fullWidth
                                    >
                                        Reject
                                    </Button>
                                </Stack>
                            </Paper>
                        ))
                    )}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default AppBarHeader;