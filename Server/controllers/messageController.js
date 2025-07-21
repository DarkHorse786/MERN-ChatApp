import userModel from "../models/User.js";
import messageModel from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../index.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const AI_ID = process.env.AI_USER_ID;
const AI_KEY = process.env.GOOGLE_AI_API_KEY;

// get all user except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const filteredUsers = await userModel
      .find({ _id: { $ne: userId } })
      .select("-password");

    //count the number of unread messages for each user
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const unseenCount = await messageModel.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });
      if (unseenCount.length > 0) {
        unseenMessages[user._id] = unseenCount.length;
      }
    });
    await Promise.all(promises);

    // Return the filtered users along with unseen messages count
    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages: unseenMessages,
    });
  } catch (error) {
    console.error("Error fetching users for sidebar:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // Get the userId from the request parameters
    const currentUserId = req.user._id; // Get the logged-in user's ID

    // Find messages between the logged-in user and the selected user
    const messages = await messageModel
      .find({
        $or: [
          { senderId: currentUserId, receiverId: selectedUserId },
          { senderId: selectedUserId, receiverId: currentUserId },
        ],
      })
      .sort({ timestamps: 1 }); // Sort messages by timestamp in ascending order

    // Mark messages as seen if they are from the selected user
    await messageModel.updateMany(
      { senderId: selectedUserId, receiverId: currentUserId, seen: false },
      { $set: { seen: true } }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// api to mark messages as seen using messageId
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params; // Get the messageId from the request parameters

    // Update the message to mark it as seen
    const updatedMessage = await messageModel.findOneAndUpdate(messageId, {
      seen: true,
    }); // Find the message by ID and update it to seen

    if (!updatedMessage) {
      return res.json({
        success: false,
        message: "Message not found or already seen",
      });
    }

    res.json({ success: true, updatedMessage });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.json({ success: false, message: "Internal server error" });
  }
};

//send message to the selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    if (!receiverId) return res.json({ success: false, message: "Receiver ID is required" });

    const senderId = req.user._id;

    let imageUrl = "";
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
      if (!imageUrl) return res.json({ success: false, message: "Image upload failed" });
    }

    // Save the user’s message
    const newMessage = await messageModel.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    // Emit user's message to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // 🔁 Handle AI response if receiver is AI
    if (receiverId === AI_ID && text) {
    //   console.log("📡 Sending text to Google AI:", text);

      try {
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Answer this in one clear sentence only:\n\n"${text}"`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 100
          }
        });

        const aiReply =
          result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't think of a reply.";

        // console.log("📡 Google AI response:", aiReply);
        // Save AI's message
        const aiMessage = await messageModel.create({
          senderId: receiverId,
          receiverId: senderId,
          text: aiReply,
        });

        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", aiMessage);
        }

      } catch (err) {
        console.error("❌ Google AI Error:", err?.message || err);
      }
    }

    res.json({ success: true, messageData: newMessage });

  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// api to clear chat
export const clearChat = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params; // Get the userId from the request parameters
    const currentUserId = req.user._id; // Get the logged-in user's ID

    // Find messages between the logged-in user and the selected user
    const messages = await messageModel.deleteMany({
      $or: [
        { senderId: currentUserId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: currentUserId },
      ],
    });
    res.json({ success: true, message: "Chat has been Cleared" }); // Respond with the created message
  } catch (error) {
    res.json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
