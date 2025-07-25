import React, { useContext, useEffect, useRef, useState } from "react";
import assets, { messagesDummyData } from "../assets/assets.js";
import { formatMessageTime } from "../lib/utils.js";
import { ChatContext } from "../context/ChatContext.jsx";
import { authContext } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { selectedUser, messages, setSelectedUser,sendMessage,getMessages,clearChat } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(authContext);
  const scrollEnd = useRef();
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;
    await sendMessage({text: inputMessage.trim()});
    setInputMessage("");
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({image: reader.result});
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset file input
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser?.profilePic || assets.profile_martin}
          alt="User profile"
          className="w-8 h-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          { onlineUsers.includes(selectedUser._id) &&
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          }
        </p>
        <div className="py-2 group relative">
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="max-h-5 cursor-pointer"
          />
          <div className="absolute right-0 top-full z-20 bg-[#282142] w-24 p-3 border border-gray-600 text-gray-100 rounded-md hidden group-hover:block">
            <p className="cursor-pointer text-sm" onClick={()=>clearChat()}>Clear Chat</p>
          </div>
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden max-w-7 cursor-pointer"
        />
      </div>
      {/* chat */}
      <div className="flex flex-col gap-2 h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-words bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}
              >
                {msg.text}
              </p>
            )}

            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.profile_martin
                    : selectedUser.profilePic || assets.profile_martin
                }
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <p className="text-gray-400">
                {formatMessageTime(msg.timestamps )}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* ------- bottom area ------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            value={inputMessage}
            placeholder="Send a message"
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key == "Enter" && handleSendMessage(e)}
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input onChange={(e)=>handleSendImage(e)} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img src={assets.send_button} onClick={(e)=>handleSendMessage(e)} alt="" className="w-10 cursor-pointer" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="Chat Icon" className="max-w-16" />
      <p className="text-white text-lg font-medium">
        Select a chat to start messaging
      </p>
    </div>
  );
};

export default ChatContainer;
