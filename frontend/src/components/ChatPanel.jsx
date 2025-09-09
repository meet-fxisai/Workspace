import React from "react";
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
    <div 
      className="flex flex-col mx-auto border border-gray-300 overflow-hidden"
      style={{
        height: CHAT_STYLES.CONTAINER_HEIGHT,
        borderColor: CHAT_STYLES.BORDER_COLOR,
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
    </div>
  );
};

export default ChatPanel;