import { createContext, useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { authContext } from "./AuthContext";


export const ChatContext = createContext();
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const {socket  ,axios}=useContext(authContext);

  // function to get all users for sidebar
  const getUsers = async () => {
    try {
      const response = await axios.get('/api/messages/users');
      if(response.data.success) {
        setUsers(response.data);
        setUnseenMessages(response.data.unseenMessages || {});
      }
    } catch (error) {
      console.error("Error fetching users for Sidebar:", error);
    }
  };

  // function to get all messages for selected user
  const getMessages = async (selectedUserId) => {
    try {
      const response = await axios.get(`/api/messages/${selectedUserId}`);
      if (response.success) {
        setMessages(response.messages);
        setSelectedUser(selectedUserId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // function to sent message to the selected user
  const sendMessage = async (messageContent) => {
    try {
      const response = await axios.post(`/api/messages/send${selectedUser._id}`, {messageContent});
      
      if (response.success) {
        setMessages(prevMessages => [...prevMessages, response.messageData]);
        // socket.emit('sendMessage', response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to message for selected user
  const subscribeToMessages = () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser &&  newMessage.senderId === selectedUser._id) {
        newMessage.seen= true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`)
      }else {
        setUnseenMessages((prevUnseen) => ({
          ...prevUnseen,
          [newMessage.senderId]: (prevUnseen[newMessage.senderId] || 0) + 1
        }));
      }
    });
  }

  // function to unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
  };

// useEffect to subscribe to messages when component mounts
  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [socket, selectedUser]);


  const value = {
    messages,
    setMessages,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    // sendMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};  