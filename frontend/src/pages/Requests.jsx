import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { decodeToken, getUserByEmail } from "../Services/auth.service";
import { toast } from "react-toastify";
import {
  getMyRequests,
  acceptRequest,
  rejectRequest,
} from "../Services/request.service";

export default function Requests({ changeAuth, auth }) {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    const t = decodeToken();
    const email = t.userEmail;
    getMyRequests(email)
      .then((resp) => {
        setRequests(resp.data);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  }, [flag]);

  useEffect(() => {
    const t = decodeToken();
    const email = t.userEmail;
    getUserByEmail(email)
      .then((resp) => {
        setUser(resp);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  }, []);

  const handleReject = (from) => {
    // logic to reject friend request
    const rejReq = {
      from,
      to: user.email,
    };
    console.log(rejReq);
    rejectRequest(rejReq)
      .then((resp) => {
        toast.success(resp.message);
        setFlag((f) => !f);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleAccept = (from) => {
    const accReq = {
      from,
      to: user.email,
    };
    console.log(accReq);
    acceptRequest(accReq)
      .then((resp) => {
        toast.success(resp.message);
        setFlag((f) => !f);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  return (
    <>
      <Navbar auth={auth} changeAuth={changeAuth} user={user} />
      {requests.length > 0 && (
        <h1 className="text-3xl font-bold mt-4 text-center text-blue-600">
          Friend Requests
        </h1>
      )}

      <div className="p-4 flex flex-wrap gap-4">
        {requests.map((request) => (
          <div key={request._id} className="w-full max-w-xs bg-white rounded-lg shadow-lg">
            <div className="p-4 text-center">
              <img
                className="mx-auto mb-4 rounded-full"
                src={request.from.gender === "Male" ? "male.png" : "female.png"}
                width="200px"
                alt={request.from.firstName}
              />
              <h3 className="text-lg font-bold mb-2">
                {request.from.firstName} {request.from.lastName}
              </h3>
              <p className="text-gray-600 mb-4">
                {request.from.email}
              </p>
              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => handleAccept(request.from.email)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(request.from.email)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="w-full text-center mt-8">
            <h1 className="text-3xl font-bold text-white">
              No new requests
            </h1>
          </div>
        )}
      </div>
    </>
  );
}
