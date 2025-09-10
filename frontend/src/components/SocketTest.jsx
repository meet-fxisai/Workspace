import React, { useState, useEffect } from 'react';
import socketService from '../Services/socket.service';
import { getUser } from '../utils/userUtils';

const SocketTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);

    // Check initial connection status
    const checkConnection = () => {
      const status = socketService.getConnectionStatus();
      setConnectionStatus(status ? 'Connected' : 'Disconnected');
    };

    // Check connection status every second
    const interval = setInterval(checkConnection, 1000);

    // Listen for online users updates
    socketService.onOnlineUsers((users) => {
      setOnlineUsers(users);
      console.log('Online users updated in test component:', users);
    });

    return () => {
      clearInterval(interval);
      socketService.off('onlineUsers');
    };
  }, []);

  const handleConnect = () => {
    if (currentUser) {
      socketService.connect('http://localhost:3000');
      socketService.addUser(currentUser.id, currentUser.email, currentUser.name);
    }
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    setOnlineUsers([]);
  };

  const sendTestMessage = () => {
    if (onlineUsers.length > 1) {
      // Send message to the first other user
      const otherUser = onlineUsers.find(u => u.userId !== currentUser?.id);
      if (otherUser) {
        const testMessage = {
          content: 'Hello from socket test!',
          authorId: currentUser.id,
          timestamp: new Date().toISOString()
        };
        socketService.sendMessage(testMessage, otherUser.userId);
        console.log('Test message sent to:', otherUser.userEmail);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 m-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">
        Socket Connection Test
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <strong>Connection Status:</strong>{' '}
          <span 
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'Connected' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {connectionStatus}
          </span>
        </p>
      </div>

      {currentUser && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <strong>Current User:</strong> {currentUser.name} ({currentUser.email})
          </p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-700 mb-2">
          <strong>Online Users ({onlineUsers.length}):</strong>
        </p>
        {onlineUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No online users
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {onlineUsers.map((user, index) => (
              <span
                key={user.socketId}
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  user.userId === currentUser?.id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.userName} ({user.userEmail})
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={handleConnect}
          disabled={connectionStatus === 'Connected'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Connect
        </button>
        <button 
          onClick={handleDisconnect}
          disabled={connectionStatus === 'Disconnected'}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Disconnect
        </button>
        <button 
          onClick={sendTestMessage}
          disabled={connectionStatus === 'Disconnected' || onlineUsers.length <= 1}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Send Test Message
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs text-gray-500">
          This component helps test the socket connection. You should see your name appear in the online users list when connected.
        </p>
      </div>
    </div>
  );
};

export default SocketTest;
