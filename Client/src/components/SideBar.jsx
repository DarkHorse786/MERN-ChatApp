import React, { useEffect } from "react";
import assets from "../assets/assets.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authContext } from "../context/AuthContext.jsx";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";

const SideBar = () => {
  const {
    selectedUser,
    getUsers,
    users,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(authContext);
  const navigate = useNavigate();

  const [seachInput, setSearchInput] = useState("");
  const filteredUsers = seachInput
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(seachInput.toLowerCase())
      )
    : users;

  useEffect(() => {
    getUsers();
  }, [onlineUsers]);

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl text-white overflow-y-scroll relative backdrop-blur-lg flex flex-col justify-between ${
        selectedUser ? " max-md:hidden" : ""
      }`}
    >
      {/* Header and Search */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center"> 
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="py-2 group relative">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute right-0 top-full z-20 bg-[#282142] w-32 p-5 border border-gray-600 text-gray-100 rounded-md hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-gray-500" />
              <p className="cursor-pointer text-sm" onClick={() => logout()}>
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search Chats"
            value={seachInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Scrollable User List */}
      <div className="flex-1 overflow-y-scroll mt-4  pr-1">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
            }}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && "bg-[#282142]/50"
            }`}
          >
            <img
              src={user?.profilePic || assets.profile_martin}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default SideBar;
