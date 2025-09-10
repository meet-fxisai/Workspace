import React from "react";
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

  const alignmentClass = alignment === 'flex-end' ? 'justify-end' : 'justify-start';
  const bgClass = alignment === 'flex-end' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900';

  return (
    <div className={`mb-3 flex ${alignmentClass}`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md shadow-sm ${bgClass}`}
        style={{
          backgroundColor: backgroundColor,
          maxWidth: MESSAGE_STYLES.MAX_WIDTH,
        }}
      >
        {isSystem ? (
          <p className="text-sm">
            {processMessageContent(message.content, user?.firstName)}
          </p>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        {!isSystem && (
          <p className="text-xs opacity-75 text-right mt-1">
            {formatMessageTime(message.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Message;