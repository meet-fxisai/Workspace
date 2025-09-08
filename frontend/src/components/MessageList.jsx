import React from "react";
import { Box } from "@mui/material";
import Message from "./Message";
import { CHAT_STYLES } from "../constants/chatConstants";
import { useAutoScroll } from "../hooks/useAutoScroll";

const MessageList = ({ messages, user }) => {
  const scrollRef = useAutoScroll(messages);

  return (
    <Box
      sx={{
        flex: 1,
        padding: "16px",
        overflowY: "auto",
        backgroundColor: CHAT_STYLES.MESSAGES_BACKGROUND,
        "&::-webkit-scrollbar": { display: "none" },
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      {messages.map((message, index) => (
        <Message
          key={index + 1}
          message={message}
          user={user}
        />
      ))}
      <div ref={scrollRef} />
    </Box>
  );
};

export default MessageList;
