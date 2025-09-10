import { useState, useCallback } from "react";
import { createMessage, isValidMessageContent } from "../utils/chatUtils";

/**
 * Custom hook for managing chat functionality
 * @param {Object} user - Current user object
 * @param {string} currChat - Current chat ID
 * @param {Function} send - Function to send message
 * @returns {Object} Chat management functions and state
 */
export const useChatInput = (user, currChat, send) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = useCallback((setMessages) => {
    if (!isValidMessageContent(message)) {
      return false;
    }
    
    const newMessage = createMessage(message, user?._id, currChat);
    
    setMessage("");
    setMessages((prev) => [...prev, newMessage]);
    send(newMessage);
    
    return true;
  }, [message, user?._id, currChat, send]);

  const clearMessage = useCallback(() => {
    setMessage("");
  }, []);

  return {
    message,
    setMessage,
    handleSendMessage,
    clearMessage,
    canSend: isValidMessageContent(message),
  };
};
