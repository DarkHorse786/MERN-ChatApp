import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
 import {io} from "socket.io-client";
import { useNavigate } from "react-router-dom";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const authContext = createContext();
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [socket, setSocket] = useState(null);

  //check if user is authenticated and if so set the user data and connect to socket
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/authentication");
      if (data.success) {
        setAuthUser(data.userData);
        console.log("User data fetched successfully:", data.userData);
        connectSocket(data.userData);
      }

      // Connect to socket if user is authenticated
    } catch (error) {
      toast.error(error.message || "Authentication failed");
      console.error("Error fetching user data:", error);
    }
  };

  //login function to handle user authentication and socket connection
  const login = async (state,Credentials) => {
    try {
        const {data} = await axios.post(`/api/auth/${state}`, Credentials);
        if (data.success) {
            if(state === "signin") 
              setAuthUser(data.userData);
            connectSocket(data.userData);
            toast.success(data.message);
            navigate("/");
        }
        else {
            toast.error(data.message);
        }

    } catch (error) {
        toast.error(error.message);
    }
}
// logout function to handle user logout and disconnect from socket
const logout = async () => {    
    try {
        await axios.post("/api/auth/logout");
        setAuthUser(null);
        setOnlineUsers([]);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success("Logged out successfully");
    } catch (error) {
        toast.error(error.message || "Logout failed");
    }
};
const updateProfile = async (profileData) => {
  try {
    const { data } = await axios.put("/api/auth/update-profile", profileData);
    if (!data.success) {
      <div>loading</div>
      return { success: false, message: data.message , loading: true };

    } else if (data.success) {
       setAuthUser(data.updatedUser);
      toast.success("Profile updated successfully");
      return { success: true };
    } else {
       toast.error(data.message);
      return { success: false, message: data.message };
    }
  } catch (error) {
    toast.error(error.message || "Profile updation failed");
    return { success: false, message: error.message };
  }
};
  // conect socket function to handle socket connection and online users updates
  const connectSocket = (userData) => {

      const newSocket = io(backendUrl, {
          query: { userId: userData._id,}
      });
      newSocket.connect();
      setSocket(newSocket);
      newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    checkAuth 
  };

  return (
    <authContext.Provider value={ value }>{children}</authContext.Provider>
  );
};
