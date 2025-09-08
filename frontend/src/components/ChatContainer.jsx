import React from "react";
import ChatPanel from "./ChatPanel";

export default function ChatContainer({
  messages,
  user,
  currChat,
  currFriend,
  setMessages,
  isOnline,
  send,
  small,
  handleBack
}) {
  return (
    <ChatPanel
      messages={messages}
      user={user}
      currChat={currChat}
      currFriend={currFriend}
      setMessages={setMessages}
      isOnline={isOnline}
      send={send}
      small={small}
      handleBack={handleBack}
    />
  );
}
