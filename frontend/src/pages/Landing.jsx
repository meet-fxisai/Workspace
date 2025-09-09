import React from 'react';
import Navbar from '../components/Navbar';
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center px-4 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Welcome to Workspace Chat
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Connect, collaborate, and communicate with your team in real-time
                        </p>
                        <button 
                            onClick={handleGetStarted}
                            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Get Started
                        </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="flex justify-center items-center py-10">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                            Features
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                                <div className="flex flex-col items-center p-6">
                                    <img src="chat-with-friends.jpg" alt="Real-time Chat" className="w-48 h-48 mb-4 rounded-lg" />
                                    <h3 className="text-xl font-semibold mb-2 text-center">
                                        Real-time Chat
                                    </h3>
                                    <p className="text-center text-gray-600">
                                        Instant messaging with your team members and colleagues
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                                <div className="flex flex-col items-center p-6">
                                    <img src="explore-new-friends.jpeg" alt="Team Collaboration" className="w-48 h-48 mb-4 rounded-lg" />
                                    <h3 className="text-xl font-semibold mb-2 text-center">
                                        Team Collaboration
                                    </h3>
                                    <p className="text-center text-gray-600">
                                        Work together seamlessly across different workspaces
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow-lg cursor-pointer transition-transform transform hover:scale-105">
                                <div className="flex flex-col items-center p-6">
                                    <img src="friend-requests.png" alt="Secure Communication" className="w-48 h-48 mb-4 rounded-lg" />
                                    <h3 className="text-xl font-semibold mb-2 text-center">
                                        Secure Communication
                                    </h3>
                                    <p className="text-center text-gray-600">
                                        Enterprise-grade security for your conversations
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center py-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join your workspace and start collaborating today
                    </p>
                    <button 
                        onClick={handleGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg text-white font-medium rounded-lg transition-colors duration-200"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        </>
    );
}
