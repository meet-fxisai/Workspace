import React from 'react';
import Navbar from '../components/Navbar';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();

    // No need to check for tokens on landing page since it's public
    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <>
            <Navbar auth={false} changeAuth={() => {}} user={null} />
            <Box className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center px-4 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <Typography variant="h2" component="h1" className="font-bold text-gray-900 mb-6">
                            Welcome to Workspace Chat
                        </Typography>
                        <Typography variant="h5" component="p" className="text-gray-600 mb-8">
                            Connect, collaborate, and communicate with your team in real-time
                        </Typography>
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={handleGetStarted}
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                        >
                            Get Started
                        </Button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="flex justify-center items-center py-10">
                    <div className="max-w-6xl mx-auto px-4">
                        <Typography variant="h4" component="h2" className="text-center font-bold text-gray-900 mb-12">
                            Features
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="cursor-pointer transition-transform transform hover:scale-105 shadow-lg">
                                <CardContent className="flex flex-col items-center p-6">
                                    <img src="chat-with-friends.jpg" alt="Real-time Chat" className="w-48 h-48 mb-4 rounded-lg" />
                                    <Typography variant="h5" component="div" className="text-center font-semibold mb-2">
                                        Real-time Chat
                                    </Typography>
                                    <Typography variant="body2" className="text-center text-gray-600">
                                        Instant messaging with your team members and colleagues
                                    </Typography>
                                </CardContent>
                            </Card>
                            
                            <Card className="cursor-pointer transition-transform transform hover:scale-105 shadow-lg">
                                <CardContent className="flex flex-col items-center p-6">
                                    <img src="explore-new-friends.jpeg" alt="Team Collaboration" className="w-48 h-48 mb-4 rounded-lg" />
                                    <Typography variant="h5" component="div" className="text-center font-semibold mb-2">
                                        Team Collaboration
                                    </Typography>
                                    <Typography variant="body2" className="text-center text-gray-600">
                                        Work together seamlessly across different workspaces
                                    </Typography>
                                </CardContent>
                            </Card>
                            
                            <Card className="cursor-pointer transition-transform transform hover:scale-105 shadow-lg">
                                <CardContent className="flex flex-col items-center p-6">
                                    <img src="friend-requests.png" alt="Secure Communication" className="w-48 h-48 mb-4 rounded-lg" />
                                    <Typography variant="h5" component="div" className="text-center font-semibold mb-2">
                                        Secure Communication
                                    </Typography>
                                    <Typography variant="body2" className="text-center text-gray-600">
                                        Enterprise-grade security for your conversations
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center py-16">
                    <Typography variant="h4" component="h2" className="font-bold text-gray-900 mb-4">
                        Ready to get started?
                    </Typography>
                    <Typography variant="h6" component="p" className="text-gray-600 mb-8">
                        Join your workspace and start collaborating today
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large"
                        onClick={handleGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg"
                    >
                        Login to Continue
                    </Button>
                </div>
            </Box>
        </>
    );
}
