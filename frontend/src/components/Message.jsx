import React from "react";
import { Box, Typography } from "@mui/material";
import {
  formatMessageTime,
  getMessageAlignment,
  getMessageBackgroundColor,
  isSystemMessage,
  processMessageContent,
} from "../utils/chatUtils";
import { MESSAGE_STYLES } from "../constants/chatConstants";

const Message = ({ message, user }) => {
  const alignment = getMessageAlignment(message.authorId, user._id);
  const backgroundColor = getMessageBackgroundColor(message.authorId, user._id);
  const isSystem = isSystemMessage(message.authorId);

  return (
    <Box
      sx={{
        marginBottom: "12px",
        display: "flex",
        justifyContent: alignment,
      }}
    >
      <Box
        sx={{
          padding: "8px 16px",
          borderRadius: MESSAGE_STYLES.BORDER_RADIUS,
          backgroundColor: backgroundColor,
          maxWidth: MESSAGE_STYLES.MAX_WIDTH,
          boxShadow: MESSAGE_STYLES.BOX_SHADOW,
        }}
      >
        {isSystem ? (
          <Typography variant="body2">
            {processMessageContent(message.content, user?.firstName)}
          </Typography>
        ) : (
          <Typography variant="body2">{message.content}</Typography>
        )}
        {!isSystem && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "right",
              marginTop: "4px",
            }}
          >
            {formatMessageTime(message.createdAt)}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Message;