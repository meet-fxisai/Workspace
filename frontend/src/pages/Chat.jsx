import React, { useEffect, useState } from "react";
import {
  decodeToken,
  getUserByEmail,
  searchQuery,
} from "../Services/auth.service";
import { toast } from "react-toastify";
import { Typography, Box, useMediaQuery, Grid } from "@mui/material";
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
import FriendList from "../components/FriendList";
import { getChatById, getMyFriends } from "../Services/chat.service";
import ChatContainer from "../components/ChatContainer";
import { io } from "socket.io-client";
import { sendMessage } from "../Services/message.service";
import { useLocation } from "react-router-dom";

export default function Chat({ changeAuth, auth }) {
  const [query, setQuery] = useState(null);
  const [user, setUser] = useState(null);
  const [currChat, setCurrChat] = useState(null);
  const [currFriend, setCurrFriend] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [currChatMessages, setCurrChatMessages] = useState([]);
  const [friends, setFriends] = useState([]);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const reload = () => {
    setCurrChatMessages([]);
  };

  const location = useLocation();

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
    if (user) {
      getMyFriends()
        .then((resp) => {
          setFriends(resp?.data);
          if (location.state?.friend && location.state.chatId) {
            setCurrChat(location?.state?.chatId);
            setCurrFriend(location?.state?.friend);
            handleChatClick(location?.state?.chatId, location?.state?.friend);
          }
        })
        .catch((err) => {
          toast.error(err.response?.data.message);
        });
    }
  }, [user]);

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
  }, [query]);

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL;
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit("addNewUser", user?._id, user.email);
      socket.on("onlineUsers", (resp) => {
        setOnlineUsers(resp);
      });

      socket.on("newMessage", (message) => {
        if (message.chatId === currChat) {
          setCurrChatMessages((prevMessages) => [...prevMessages, message]);
          setFriends((f) => {
            return f.map((friend) => {
              if (friend?.lastMessage?.chatId === message?.chatId) {
                return { ...friend, lastMessage: message };
              } else {
                return friend;
              }
            });
          });
        }
      });

      return () => {
        socket.off("onlineUsers");
        socket.off("newMessage");
      };
    }
  }, [socket, user, currChat]);

  const handleChatClick = (chatId, friend) => {
    setCurrChat(chatId);
    setCurrFriend(friend);
    setCurrChatMessages([]);
    getChatById(chatId)
      .then((resp) => {
        setCurrChatMessages(resp?.data);
      })
      .catch((err) => {
        toast.error(err.response?.data.message);
      });
  };

  const sendMessageToSocketandDb = (Message) => {
    if (socket && currChat && currFriend) {
      socket.emit("sendMessage", Message, currFriend._id);
      sendMessage(Message)
        .then((resp) => {
          // setCurrChatMessages((p) => [...p, resp?.data]);
          setFriends((f) => {
            return f.map((friend) => {
              if (friend?.lastMessage?.chatId === Message?.chatId) {
                return { ...friend, lastMessage: Message };
              } else {
                return friend;
              }
            });
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleBack = () => {
    setCurrChat(null);
    setCurrFriend(null);
  };

  const handleSearch = (event) => {
    setQuery(event.target.value);
  };

  const isSmallScreen = useMediaQuery("(max-width:600px)");

  const isOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId);
  };

  return (
    <>
      <Navbar auth={auth} changeAuth={changeAuth} user={user} />
      <Grid container sx={{ height: "91.5vh" }}>
        {/* Friends list for both mobile and desktop screens */}
        {(currChat === null || !isSmallScreen) && (
          <Grid
            item
            xs={isSmallScreen ? 12 : 3}
            sx={{
              borderRight: isSmallScreen ? "none" : "1px solid #ccc",
              overflowY: "auto",
              backgroundColor: "whitesmoke",
            }}
          >
            <Box sx={{ padding: 2 }}>
              <Typography variant="h6">Friends</Typography>
              <FriendList
                friends={friends}
                user={user}
                handleChatClick={handleChatClick}
                currChat={currChat}
                isOnline={isOnline}
              />
            </Box>
          </Grid>
        )}

        {/* Chat container for both mobile and desktop screens */}
        {(currChat !== null || !isSmallScreen) && (
          <Grid
            item
            xs={isSmallScreen ? 12 : 9}
            sx={{
              overflowY: "auto",
            }}
          >
            <Box sx={{ padding: 0 }}>
              <ChatContainer
                small={isSmallScreen}
                currFriend={currFriend}
                messages={currChatMessages}
                setMessages={setCurrChatMessages}
                user={user}
                currChat={currChat}
                reload={reload}
                isOnline={isOnline}
                send={sendMessageToSocketandDb}
                handleBack={handleBack}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </>
  );
}
