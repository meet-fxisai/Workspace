import React from "react";
import { Send } from "lucide-react";
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
    <div className="p-2 border-t border-gray-300 bg-gray-100 flex items-center">
      <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <InputEmoji
          value={message}
          onChange={setMessage}
          onEnter={onSendMessage}
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff",
            borderRadius: MESSAGE_STYLES.INPUT_BORDER_RADIUS,
          }}
          placeholder="Type a message..."
        />
      </div>
      <button
        onClick={onSendMessage}
        disabled={!canSend}
        className={`ml-2 p-2 rounded-lg transition-colors duration-200 ${
          canSend 
            ? 'text-blue-600 hover:bg-blue-50 active:bg-blue-100' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MessageInput;