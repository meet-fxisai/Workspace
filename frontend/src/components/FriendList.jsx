import React from "react";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";

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
    <List>
      {friends.map((friendData, index) => (
        <div key={index+1}>        
        <ListItem          
          alignItems="flex-start"
          onClick={()=>handleChatClick(friendData?.lastMessage.chatId, friendData?.friend)}
          sx={{ backgroundColor:`${friendData?.lastMessage.chatId===currChat?'#eeeeee':'white'}`, my:1, boxShadow:'0.5px 0.5px 15px 1px rgba(0,0,0,0.3)', borderRadius:2 }}
        >
          <ListItemAvatar>
            <Avatar
              alt={friendData?.friend.firstName}
              src={friendData?.friend?.gender==='Male'?'male.png': "female.png"}
              sx={{ width: 56, height: 56, mx:1}}
            />
          </ListItemAvatar>
          <ListItemText
          sx={{mx:1}}
            primary={
              <Typography variant="body1" color="text.primary">
                {`${friendData?.friend.firstName} ${friendData?.friend.lastName}`}
              </Typography>
            }
            secondary={
              <>
                <Typography
                  component="span"
                  variant="body2" // Decreased text size
                  color="text.secondary"
                  sx={{ display: "block" }} // Ensures it's displayed as block to stack with time
                >
                  {processContent(friendData?.lastMessage.content)?.substring(
                    0,
                    50
                  )}{" "}
                  {friendData?.lastMessage.content.length > 50 && "..."}
                </Typography>
                <Box sx={{display:'flex', justifyContent:'space-between'}}>

                <Typography
                  variant="caption" // Decreased text size further for the time
                  color="text.secondary"
                >
                  {timeInterval(friendData?.lastMessage.createdAt)}
                </Typography>
                <Typography
                  variant="caption" // Decreased text size further for the time
                  color="green"
                >
                  {isOnline(friendData?.friend._id) && 'Online'}
                </Typography>
                </Box>
              </>
            }
          />
        </ListItem>
        <hr/>
        </div>
      ))}
    </List>
  );
}
