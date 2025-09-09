import React from "react";

const timeInterval = (timestamp) => {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now - messageTime) / 1000);
  
  const intervals = [
    { label: 'd', seconds: 86400 }, // 1 day
    { label: 'h', seconds: 3600 },  // 1 hour
    { label: 'm', seconds: 60 },    // 1 minute
    { label: 's', seconds: 1 },     // 1 second
  ];

  for (const interval of intervals) {
    const time = Math.floor(diffInSeconds / interval.seconds);
    if (time >= 1) {
      return `${time} ${interval.label}`;
    }
  }

  return 'just now'; // If the time difference is less than 1 second
};

export default function FriendList({ friends, user, handleChatClick, currChat, isOnline }) {
  const processContent = (content) => {
    const replaced = content?.replace(user?.firstName, "you");
    return replaced;
  };
  
  return (
    <div className="space-y-2">
      {friends.map((friendData, index) => (
        <div key={index + 1}>        
          <div          
            onClick={() => handleChatClick(friendData?.lastMessage.chatId, friendData?.friend)}
            className={`flex items-start p-4 rounded-lg shadow-md cursor-pointer transition-colors duration-200 ${
              friendData?.lastMessage.chatId === currChat 
                ? 'bg-gray-200' 
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              <div className="w-14 h-14 rounded-full overflow-hidden">
                <img
                  alt={friendData?.friend.firstName}
                  src={friendData?.friend?.gender === 'Male' ? 'male.png' : "female.png"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {`${friendData?.friend.firstName} ${friendData?.friend.lastName}`}
                </h3>
              </div>
              
              <div className="mb-2">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {processContent(friendData?.lastMessage.content)?.substring(0, 50)}
                  {friendData?.lastMessage.content.length > 50 && "..."}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {timeInterval(friendData?.lastMessage.createdAt)}
                </span>
                {isOnline(friendData?.friend._id) && (
                  <span className="text-xs text-green-600 font-medium">
                    Online
                  </span>
                )}
              </div>
            </div>
          </div>
          <hr className="border-gray-200" />
        </div>
      ))}
    </div>
  );
}
