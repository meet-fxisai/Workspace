import React from "react";
import { ArrowLeft } from "lucide-react";
import { getUserAvatarSrc } from "../utils/chatUtils";
import { CHAT_STYLES, STATUS_COLORS } from "../constants/chatConstants";

const ChatHeader = ({ currFriend, isOnline, small, handleBack }) => {
  return (
    <div 
      className="p-4 border-b bg-white flex items-center"
      style={{
        borderBottomColor: CHAT_STYLES.BORDER_COLOR,
        backgroundColor: CHAT_STYLES.HEADER_BACKGROUND,
      }}
    >
      {small && (
        <button
          className="mr-2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
          onClick={() => handleBack()}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div 
        className="rounded-full mx-1 overflow-hidden"
        style={CHAT_STYLES.AVATAR_SIZE}
      >
        <img
          alt={currFriend?.firstName}
          src={getUserAvatarSrc(currFriend?.gender)}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="text-lg font-semibold">
          {currFriend?.firstName} {currFriend?.lastName}
        </h3>
        {isOnline(currFriend?._id) && (
          <p 
            className="text-sm"
            style={{ color: STATUS_COLORS.ONLINE }}
          >
            Online
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
