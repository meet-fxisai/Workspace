import React from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getUserAvatarSrc } from "../utils/chatUtils";
import { CHAT_STYLES, STATUS_COLORS } from "../constants/chatConstants";

const ChatHeader = ({ currFriend, isOnline, small, handleBack }) => {
  return (
    <Box
      sx={{
        padding: "16px",
        borderBottom: `1px solid ${CHAT_STYLES.BORDER_COLOR}`,
        backgroundColor: CHAT_STYLES.HEADER_BACKGROUND,
        display: "flex",
        alignItems: "center",
      }}
    >
      {small && (
        <IconButton
          sx={{ mr: 1 }}
          onClick={() => handleBack()}
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      <Avatar
        alt={currFriend?.firstName}
        src={getUserAvatarSrc(currFriend?.gender)}
        sx={{ ...CHAT_STYLES.AVATAR_SIZE, mx: 1 }}
      />
      <Box>
        <Typography variant="h6">
          {currFriend?.firstName} {currFriend?.lastName}
        </Typography>
        <Typography
          variant="caption"
          color={STATUS_COLORS.ONLINE}
        >
          {isOnline(currFriend?._id) && "Online"}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatHeader;
