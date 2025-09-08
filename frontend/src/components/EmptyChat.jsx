import React from "react";
import { Box, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import { CHAT_STYLES, ICON_SIZES, STATUS_COLORS } from "../constants/chatConstants";

const EmptyChat = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      backgroundColor={CHAT_STYLES.EMPTY_CHAT_BACKGROUND}
    >
      <ChatIcon style={{ fontSize: ICON_SIZES.LARGE, color: STATUS_COLORS.OFFLINE }} />
      <Typography variant="h5" style={{ marginTop: 16 }}>
        Chat App
      </Typography>
      <Typography variant="body2" style={{ marginTop: 8, color: "#666" }}>
        Select a conversation to start chatting
      </Typography>
    </Box>
  );
};

export default EmptyChat;
