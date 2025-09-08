import React from "react";
import { Box, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import InputEmoji from "react-input-emoji";
import { useChatInput } from "../hooks/useChatInput";
import { MESSAGE_STYLES } from "../constants/chatConstants";

const MessageInput = ({ user, currChat, setMessages, send }) => {
  const { message, setMessage, handleSendMessage, canSend } = useChatInput(
    user,
    currChat,
    send
  );

  const onSendMessage = () => {
    handleSendMessage(setMessages);
  };

  return (
    <Box
      sx={{
        padding: "8px 16px",
        borderTop: "1px solid #ddd",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
      }}
    >
      <InputEmoji
        value={message}
        onChange={setMessage}
        onEnter={onSendMessage}
        sx={{
          flex: 1,
          padding: "8px 12px",
          backgroundColor: "#fff",
          borderRadius: MESSAGE_STYLES.INPUT_BORDER_RADIUS,
          boxShadow: MESSAGE_STYLES.BOX_SHADOW,
        }}
        placeholder="Type a message..."
      />
      <IconButton
        onClick={onSendMessage}
        disabled={!canSend}
        sx={{
          marginLeft: "8px",
          color: canSend ? "#007bff" : "#ccc",
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default MessageInput;