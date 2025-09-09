import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { decodeToken, deleteToken, getUserByEmail } from '../Services/auth.service';
import { toast } from 'react-toastify';

export default function Account({ changeAuth, auth }) {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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
            <div className="max-w-md mx-auto mt-10 px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex flex-col items-start">
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            Back
                        </button>
                        <div className="flex flex-col items-center w-full">
                            <div className="w-48 h-48 mb-4 rounded-full overflow-hidden">
                                <img 
                                    alt="Avatar" 
                                    src={avatarSrc} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {`${firstName} ${lastName}`}
                            </h2>
                            <p className="text-gray-700 mb-1 text-center">
                                <strong>Email:</strong> {email}
                            </p>
                            <p className="text-gray-700">
                                <strong>Date of Birth:</strong> {new Date(dateOfBirth).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
