import React from "react";
import { Box } from "@mui/material";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";
import { CHAT_STYLES } from "../constants/chatConstants";

const ChatPanel = ({
  messages,
  user,
  currChat,
  currFriend,
  setMessages,
  isOnline,
  send,
  small,
  handleBack
}) => {
  if (currChat === null) {
    return <EmptyChat />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: CHAT_STYLES.CONTAINER_HEIGHT,
        margin: "0 auto",
        border: `1px solid ${CHAT_STYLES.BORDER_COLOR}`,
        overflow: "hidden",
      }}
    >
      <ChatHeader
        currFriend={currFriend}
        isOnline={isOnline}
        small={small}
        handleBack={handleBack}
      />
      
      <MessageList
        messages={messages}
        user={user}
      />
      
      <MessageInput
        user={user}
        currChat={currChat}
        setMessages={setMessages}
        send={send}
      />
    </Box>
  );
};

export default ChatPanel;