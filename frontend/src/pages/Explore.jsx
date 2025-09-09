import React, { useEffect, useState } from "react";
import {
  decodeToken,
  getUserByEmail,
  searchQuery,
} from "../Services/auth.service";
import { toast } from "react-toastify";
import { Search, Check, X, MessageCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import {
  acceptRequest,
  rejectRequest,
  sendRequest,
} from "../Services/request.service";
import { getChatIdByFriend } from "../Services/chat.service";
import { useNavigate } from "react-router-dom";

export default function Explore({ changeAuth, auth }) {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [flag, setFlag] = useState(false);
  const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const isSmallScreen = window.innerWidth <= 600;

  useEffect(() => {
    const t = decodeToken();
    const email = t.userEmail;
    getUserByEmail(email)
      .then((resp) => {
        setUser(resp);
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
      });
  }, []);

  useEffect(() => {
    if (query) {
      searchQuery(query)
        .then((resp) => {
          setSearchResults(resp?.data);
        })
        .catch((err) => {
          toast.error(err.response?.data.message);
        });
    } else {
      setSearchResults([]);
    }
  }, [query, flag]);

  const handleSearch = (event) => {
    setQuery(event.target.value);
  };

  const handleAdd = (to) => {
    // logic to accept friend request
    const addReq = {
      from: user.email,
      to,
    };
    sendRequest(addReq)
      .then((resp) => {
        toast.success(resp.message);
        setFlag((f) => !f);
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
      });
  };

  const handleReject = (from) => {
    // logic to reject friend request
    const rejReq = {
      from,
      to: user.email,
    };
    rejectRequest(rejReq)
      .then((resp) => {
        toast.success(resp.message);
        setFlag((f) => !f);
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
      });
  };

  const handleAccept = (from) => {
    const accReq = {
      from,
      to: user.email,
    };
    // console.log(accReq);
    acceptRequest(accReq)
      .then((resp) => {
        toast.success(resp.message);
        setFlag((f) => !f);
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
      });
  };

  const handleChat = (friend) => {
    // logic to start chat
    setLoad(true);
    getChatIdByFriend(friend?._id)
      .then((resp) => {
        const chatId = resp?.data.chatId;
        setLoad(false);
        navigate("/chat", { state: { chatId, friend } });
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
        setLoad(false);
      });
  };

  return (
    <>
      <Navbar auth={auth} changeAuth={changeAuth} user={user} />
      <h1 className="text-3xl font-bold mt-4 text-center text-blue-600">
        Explore Friends
      </h1>

      <div className="flex justify-center mt-4">
        <div className="w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            value={query}
            onChange={handleSearch}
            type="text"
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-3 border border-transparent rounded-full bg-gray-100 focus:bg-white focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md transition-all duration-200"
          />
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 justify-center">
        {searchResults.length > 0
          ? searchResults.map((searchUser) => (
              <div key={searchUser._id} className="w-full max-w-xs bg-white rounded-lg shadow-lg">
                <div className="p-4 text-center flex md:flex-col w-full justify-between">
                  <img
                    className="md:mx-auto w-12 h-12 md:w-48 md:h-48 me-2 rounded-full object-cover"
                    src={searchUser.gender === "Male" ? "male.png" : "female.png"}
                    alt={searchUser.firstName}
                  />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg md:text-xl text-left md:text-center">
                      {searchUser.firstName} {searchUser.lastName}
                    </h3>
                    <p className="text-gray-600 text-left md:text-center text-sm">
                      {searchUser.email}
                    </p>
                  </div>

                  <div className="mt-2 flex justify-between space-x-2">
                    {searchUser?.availability === 0 && (
                      <button
                        onClick={() => handleAdd(searchUser.email)}
                        className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded w-full transition-colors"
                      >
                        Add
                      </button>
                    )}

                    {searchUser?.availability === 1 && (
                      <button
                        disabled
                        className="bg-gray-400 text-white py-2 px-4 rounded w-full cursor-not-allowed"
                      >
                        Sent
                      </button>
                    )}

                    {searchUser?.availability === 2 && (
                      <>
                        {isSmallScreen ? (
                          <>
                            <button
                              onClick={() => handleAccept(searchUser.email)}
                              className="bg-green-500 hover:bg-green-700 text-white p-2 rounded flex items-center justify-center"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(searchUser.email)}
                              className="bg-red-500 hover:bg-red-700 text-white p-2 rounded flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAccept(searchUser.email)}
                              className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded w-full transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(searchUser.email)}
                              className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded w-full transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {searchUser?.availability === 3 && (
                      <>
                        {isSmallScreen ? (
                          <button
                            onClick={() => handleChat(searchUser)}
                            className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded flex items-center justify-center"
                            disabled={load}
                          >
                            {load ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <MessageCircle className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleChat(searchUser)}
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full transition-colors flex items-center justify-center"
                            disabled={load}
                          >
                            {load ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              "Chat"
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          : query && (
              <div className="text-center w-full mt-8">
                <p className="text-lg text-gray-600">No results found.</p>
              </div>
            )}
      </div>
    </>
  );
}
