import React, { useEffect, useState } from "react";
import {
  decodeToken,
  getUserByEmail,
  searchQuery,
} from "../Services/auth.service";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Box,
  IconButton,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Navbar from "../components/Navbar";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ChatIcon from "@mui/icons-material/Chat";
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

  const isSmallScreen = useMediaQuery("(max-width:600px)");

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
    setLoad(true)
    getChatIdByFriend(friend?._id).then(resp=>{
      const chatId = resp?.data.chatId;
      setLoad(false);
      navigate('/chat',{state:{chatId,friend}})

    }).catch(err=>{
      toast.error(err.response?.data.message);
      setLoad(false);
    })
  }
  return (
    <>
      <Navbar auth={auth} changeAuth={changeAuth} user={user} />
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          marginTop: 2,
          textAlign: "center",
          color: "blue",
        }}
      >
        Explore Friends
      </Typography>

      <div className="flex justify-center mt-4">
        <TextField
          value={query}
          onChange={handleSearch}
          variant="outlined"
          placeholder="Search friends..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: "50px",
              backgroundColor: "#f1f1f1",
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "transparent",
                },
                "&:hover fieldset": {
                  borderColor: "#ddd",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#ccc",
                },
              },
            },
          }}
          className="w-full max-w-md shadow-md"
        />
      </div>

      <div className="p-4 flex flex-wrap gap-4">
        {searchResults.length > 0
          ? searchResults.map((user) => (
              <Card key={user._id} className="w-full md:max-w-xs shadow-lg">
                <CardContent className="text-center flex md:flex-col w-full justify-between ">
                  <img
                    className="md:mx-auto w-12 h-12 md:w-48 md:h-48 me-2"
                    src={user.gender === "Male" ? "male.png" : "female.png"}
                    alt={user.firstName}
                  />
                  <Box sx={{flexGrow:1}}>
                    <Typography className="font-bold text-lg md:text-xl text-left md:text-center">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-gray-600 text-left md:text-center"
                    >
                      {user.email}
                    </Typography>
                  </Box>

                  <div className="mt-2 flex justify-between space-x-4">
                    {user?.availability === 0 && (
                      <Button
                        onClick={() => handleAdd(user.email)}
                        sx={{
                          backgroundColor: "green",
                          "&:hover": {
                            backgroundColor: "darkgreen",
                          },
                          color: "white",
                          width: "100%",
                        }}
                      >
                        Add
                      </Button>
                    )}

                    {user?.availability === 1 && (
                      <Button
                        disabled
                        sx={{
                          backgroundColor: "grey.400",
                          color: "white",
                          width: "100%",
                          borderRadius: "8px",
                          "&:hover": {
                            backgroundColor: "grey.400",
                          },
                          cursor: "not-allowed",
                        }}
                      >
                        Sent
                      </Button>
                    )}

                    {user?.availability === 2 && (
                      <>
                        {isSmallScreen ? (
                          <>
                            <IconButton
                              onClick={() => handleAccept(user.email)}
                              sx={{
                                backgroundColor: "green",
                                "&:hover": {
                                  backgroundColor: "darkgreen",
                                },
                                color: "white",
                              }}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => handleReject(user.email)}
                              sx={{
                                backgroundColor: "red",
                                "&:hover": {
                                  backgroundColor: "darkred",
                                },
                                color: "white",
                              }}
                            >
                              <ClearIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleAdd(user._id)}
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
                              onClick={() => handleReject(user._id)}
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
                          </>
                        )}
                      </>
                    )}
                    {user?.availability === 3 && (
                      <>
                        {isSmallScreen ? (
                          <IconButton
                            onClick={() => handleChat(user.email)}
                            sx={{
                              backgroundColor: "blue",
                              "&:hover": {
                                backgroundColor: "darkblue",
                              },
                              color: "white",
                            }}
                          >
                            {load ? <CircularProgress size={'16px'} /> :<ChatIcon />}
                          </IconButton>
                        ) : (
                          <Button
                            onClick={() => handleChat(user)}
                            sx={{
                              backgroundColor: "blue",
                              "&:hover": {
                                backgroundColor: "darkblue",
                              },
                              color: "white",
                              width: "100%",
                            }}
                          >
                            {load?<CircularProgress size={'20px'} /> :'Chat'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          : query && (
              <Typography
                variant="h6"
                sx={{ textAlign: "center", width: "100%", marginTop: 2 }}
              >
                No results found.
              </Typography>
            )}
      </div>
    </>
  );
}
