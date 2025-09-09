import React from "react";
import { MessageCircle } from "lucide-react";

const EmptyChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <MessageCircle size={64} className="text-gray-400 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Chat App
      </h1>
      <p className="text-gray-600 text-center">
        Select a conversation to start chatting
      </p>
    </div>
  );
};

export default EmptyChat;
