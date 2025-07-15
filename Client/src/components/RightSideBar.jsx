import React from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import { authContext } from "../context/AuthContext.jsx";
import { useState } from "react";
import { useEffect } from "react";

const RightSideBar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const {onlineUsers} = useContext(authContext);
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (selectedUser) {
      setImages(messages.filter(msg => msg.image).map(msg => msg.image));
    }
  }, [messages, selectedUser]);

  return (
    selectedUser && (
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          <img
            src={selectedUser?.profilePic || assets.profile_martin}
            alt=""
            className="w-20 aspect-[1/1] rounded-full"
          />
          <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2">
            {onlineUsers.includes(selectedUser._id) && <p className="w-2 h-2 rounded-full bg-green-500"></p>}
            {selectedUser.fullName}
          </h1>
          <p className="px-10 mx-auto">{selectedUser.bio}</p>
        </div>
        <hr className="border-[#ffffff50] m-4" />
        <div className="px-5 text-xs ">
          <p>Media</p>
          <div className="mt-2 mx-h-[200px] overflow-x-scroll grid grid-cols-2 gap-4 opacity-80">
            {images.map((url, index) => (
              <div
                className="cursor-pointer hover:scale-105 transition-transform duration-200"
                key={index}
                onClick={() => window.open(url, "_blank")}
              >
                <img
                  key={index}
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="h-full object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
        <button className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer">
          Logout
        </button>
      </div>
    )
  );
};

export default RightSideBar;
