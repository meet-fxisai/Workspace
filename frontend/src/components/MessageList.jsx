import React from "react";
import Message from "./Message";
import { CHAT_STYLES } from "../constants/chatConstants";
import { useAutoScroll } from "../hooks/useAutoScroll";

const MessageList = ({ messages, user }) => {
  const scrollRef = useAutoScroll(messages);

  return (
    <div 
      className="flex-1 p-4 overflow-y-auto bg-white scrollbar-hide"
      style={{
        backgroundColor: CHAT_STYLES.MESSAGES_BACKGROUND,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
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
    </div>
  );
};

export default MessageList;
