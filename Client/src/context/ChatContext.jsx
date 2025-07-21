import { createContext, useEffect, useState, useContext } from "react";
import { authContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios, authUser } = useContext(authContext);

  // function to get all users for sidebar
  const getUsers = async () => {
    try {
      const response = await axios.get("/api/messages/users");
      if (response.data.success) {
        setUsers(response.data.users);
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
      if (response.data.success) {
        // sort messages by timestamps before setting
        const sortedMessages = response.data.messages.sort(
          (a, b) => new Date(a.timestamps) - new Date(b.timestamps)
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // function to send message to the selected user
  const sendMessage = async (messageContent) => {
    try {
      const response = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageContent
      );
      if (response.data.success) {
        // add new message and sort again by timestamp
        setMessages((prevMessages) => {
          const updated = [...prevMessages, response.data.messageData];
          return updated.sort((a, b) => new Date(a.timestamps) - new Date(b.timestamps));
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to clear chat
  const clearChat = async () => {
    try {
      const response = await axios.delete(`/api/messages/clear/${selectedUser._id}`);
      if (response.data.success) {
        setMessages([]); // reset all messages
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // function to subscribe to message for selected user
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      // if message is from selected user
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;

        // add message and sort
        setMessages((prevMessages) => {
          const updated = [...prevMessages, newMessage];
          return updated.sort((a, b) => new Date(a.timestamps) - new Date(b.timestamps));
        });

        // mark message as seen in DB
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        // otherwise increase unseen message count for sidebar
        setUnseenMessages((prevUnseen) => ({
          ...prevUnseen,
          [newMessage.senderId]: (prevUnseen[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

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
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    clearChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
