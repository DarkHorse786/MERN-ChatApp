import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
 import {io} from "socket.io-client";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const authContext = createContext();
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
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
            setToken(data.token);
            localStorage.setItem("token", data.token);
            axios.defaults.headers.common["token"] = data.token;
            setAuthUser(data.userData);
            connectSocket(data.userData);
            toast.success(data.message);
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
        // await axios.get("/api/auth/logout");
        setToken(null);
        localStorage.removeItem("token");
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success("Logged out successfully");
    } catch (error) {
        toast.error(error.message || "Logout failed");
    }
};

// update profile function to handle user profile updates
const updateProfile = async (profileData) => {
    try {
        const { data } = await axios.put("/api/auth/update-profile", profileData);
        if (data.success) {
            setAuthUser(data.updatedUser);
            toast.success("Profile updated successfully");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error(error.message || "Profile updation failed");
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
    // Check if token exists in localStorage
    if (token) {
      // Set the token in axios headers
      axios.defaults.headers.common["token"] = token;
      // Call checkAuth to set user data and connect to socket
      checkAuth();
    } else {
      // If no token, clear authUser and onlineUsers
      setAuthUser(null);
      setOnlineUsers(null);
    }
  }, []);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    token,
    login,
    logout,
    updateProfile,
    checkAuth 
  };

  return (
    <authContext.Provider value={ value }>{children}</authContext.Provider>
  );
};
