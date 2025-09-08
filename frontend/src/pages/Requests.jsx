import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { decodeToken, getUserByEmail } from "../Services/auth.service";
import { toast } from "react-toastify";
import { Card, CardContent, Typography, Button } from "@mui/material";
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
      {requests.length >0 && <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          marginTop: 2,
          textAlign: "center",
          color: "blue",
        }}
      >
        Friend Requests
      </Typography>}

      <div className="p-4 flex flex-wrap gap-4">
        {requests.map((request) => (
          <Card key={request._id} className="w-full max-w-xs shadow-lg">
            <CardContent className="text-center">
              <img
                className=" mx-auto"
                src={request.from.gender === "Male" ? "male.png" : "female.png"}
                width={"200px"}
                alt={request.from.firstName}
              />
              <Typography variant="h6" className="font-bold">
                {request.from.firstName} {request.from.lastName}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                {request.from.email}
              </Typography>
              <div className="mt-2 flex justify-between space-x-4">
                <Button
                  onClick={() => handleAccept(request.from.email)}
                  sx={{
                    backgroundColor: "green",
                    "&:hover": {
                      backgroundColor: "darkgreen",
                    },
                    color: "white",
                    width: "100%",
                  }}
                >
                  Accept
                </Button>
                <Button
                  onClick={() => handleReject(request.from.email)}
                  sx={{
                    backgroundColor: "red",
                    "&:hover": {
                      backgroundColor: "darkred",
                    },
                    color: "white",
                    width: "100%",
                  }}
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 4,
              width:'100%',
              color: "white",
            }}
          >
            No new requests
          </Typography>
        )}
      </div>
    </>
  );
}
