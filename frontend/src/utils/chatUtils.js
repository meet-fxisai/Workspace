/**
 * Utility functions for chat-related operations
 */

import { MESSAGE_STYLES, AVATAR_IMAGES } from "../constants/chatConstants";

/**
 * Format timestamp to readable time string
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  return new Date(timestamp).toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

/**
 * Format timestamp to full date and time
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date and time string
 */
export const formatFullDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

/**
 * Process message content, replacing user's first name with "you"
 * @param {string} content - The message content
 * @param {string} userFirstName - The user's first name
 * @returns {string} Processed content
 */
export const processMessageContent = (content, userFirstName) => {
  if (!content || !userFirstName) return content;
  return content.replace(userFirstName, "you");
};

/**
 * Check if a message is from the current user
 * @param {string} messageAuthorId - The message author ID
 * @param {string} currentUserId - The current user ID
 * @returns {boolean} True if message is from current user
 */
export const isOwnMessage = (messageAuthorId, currentUserId) => {
  return messageAuthorId === currentUserId;
};

/**
 * Check if a message is a system message
 * @param {string} messageAuthorId - The message author ID
 * @returns {boolean} True if message is a system message
 */
export const isSystemMessage = (messageAuthorId) => {
  return messageAuthorId === null;
};

/**
 * Get message alignment based on message type
 * @param {string} messageAuthorId - The message author ID
 * @param {string} currentUserId - The current user ID
 * @returns {string} CSS flex alignment value
 */
export const getMessageAlignment = (messageAuthorId, currentUserId) => {
  if (isOwnMessage(messageAuthorId, currentUserId)) return "flex-end";
  if (isSystemMessage(messageAuthorId)) return "center";
  return "flex-start";
};

/**
 * Get message background color based on message type
 * @param {string} messageAuthorId - The message author ID
 * @param {string} currentUserId - The current user ID
 * @returns {string} CSS color value
 */
export const getMessageBackgroundColor = (messageAuthorId, currentUserId) => {
  if (isOwnMessage(messageAuthorId, currentUserId)) return MESSAGE_STYLES.OWN_MESSAGE_COLOR;
  if (isSystemMessage(messageAuthorId)) return MESSAGE_STYLES.SYSTEM_MESSAGE_COLOR;
  return MESSAGE_STYLES.OTHER_MESSAGE_COLOR;
};

/**
 * Create a new message object
 * @param {string} content - The message content
 * @param {string} authorId - The author ID
 * @param {string} chatId - The chat ID
 * @returns {Object} New message object
 */
export const createMessage = (content, authorId, chatId) => {
  return {
    content: content.trim(),
    authorId,
    chatId,
    createdAt: new Date(),
  };
};

/**
 * Validate message content
 * @param {string} content - The message content to validate
 * @returns {boolean} True if content is valid
 */
export const isValidMessageContent = (content) => {
  return content && content.trim().length > 0;
};

/**
 * Get user avatar source based on gender
 * @param {string} gender - The user's gender
 * @returns {string} Avatar image source
 */
export const getUserAvatarSrc = (gender) => {
  return gender === "Male" ? AVATAR_IMAGES.MALE : AVATAR_IMAGES.FEMALE;
};