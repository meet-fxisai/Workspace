import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Navbar from '../components/Navbar';
import { decodeToken, deleteToken, getUserByEmail } from '../Services/auth.service';
import { toast } from 'react-toastify';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Container, Paper, Box, Button } from '@mui/material'; // Import Button

export default function Account({ changeAuth, auth }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const t = decodeToken();
        const email = t.userEmail;
        getUserByEmail(email).then(resp => {
            setUser(resp);
        }).catch(err => {
            toast.error(err.response.data.message);
            deleteToken();
            changeAuth(false);
        });
    }, [changeAuth]);

    if (!user) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const { firstName, lastName, email, dateOfBirth, gender } = user;
    const avatarSrc = gender === 'Female' ? 'female.png' : 'male.png';

    return (
        <>
            <Navbar auth={auth} changeAuth={changeAuth} user={user} />
            <Container maxWidth="sm" className="mt-10">
                <Paper elevation={3} className="p-6">
                    <Box className="flex flex-col items-start">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate(-1)} // Navigate to /home when clicked
                            className="mb-4"
                        >
                            Back
                        </Button>
                        <Box className="flex flex-col items-center w-full">
                            <Avatar 
                                alt="Avatar" 
                                src={avatarSrc} 
                                sx={{ width: 200, height: 200 }} 
                                className="mb-4"
                            />
                            <Typography variant="h5" component="h2" className="mb-2 font-bold">
                                {`${firstName} ${lastName}`}
                            </Typography>
                            <Typography variant="body1" className="mb-1">
                                <strong>Email:</strong> {email} | <strong>Date of Birth:</strong> {new Date(dateOfBirth).toLocaleDateString('en-GB')}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </>
    );
}
