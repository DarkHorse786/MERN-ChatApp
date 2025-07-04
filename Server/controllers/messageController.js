import userModel from "../models/User.js";
import messageModel from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../index.js";



// get all user except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id; 
        const filteredUsers = await userModel.find({ _id: { $ne: userId } }).select("-password");

        //count the number of unread messages for each user
        const unseenMessages={};
        const promises = filteredUsers.map(async (user) => {
            const unseenCount = await messageModel.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });
            if(unseenCount.length > 0) {
                unseenMessages[user._id] = unseenCount.length;
            }
        });
        await Promise.all(promises);

        // Return the filtered users along with unseen messages count
        res.status(true).json({
            users: filteredUsers,
            unseenMessages: unseenMessages
        });
       
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(false).json({ message: "Internal server error" });
    }
  
};

// get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id:selectedUserId } = req.params; // Get the userId from the request parameters
        const currentUserId = req.user._id; // Get the logged-in user's ID

        // Find messages between the logged-in user and the selected user
        const messages = await messageModel.find({
            $or: [
                { senderId: currentUserId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: currentUserId }
            ]
        }).sort({ timestamps: 1 }); // Sort messages by timestamp in ascending order
        
        // Mark messages as seen if they are from the selected user
        await messageModel.updateMany(
            { senderId: selectedUserId, receiverId: currentUserId, seen: false },
            { $set: { seen: true } }
        );
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// api to mark messages as seen using messageId
export const markMessageAsSeen = async (req, res) => {
    try {
        const { messageId } = req.params; // Get the messageId from the request parameters

        // Update the message to mark it as seen
        const updatedMessage = await messageModel.findOneAndUpdate(messageId, {seen: true}); // Find the message by ID and update it to seen

        if (!updatedMessage) {
            return res.status(404).json({ message: "Message not found or already seen" });
        }
        res.status(true).json(updatedMessage);
    } catch (error) {
        console.error("Error marking messages as seen:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

//send message to the selected user
export const sendMessage = async (req, res) => {
    try {
        const {text, image } = req.body; // Get the receiverId, text, and image from the request body
        const { receiverId } = req.params; // Get the receiverId from the request parameters
        if (!receiverId || !text) {
            return res.status(400).json({ message: "Receiver ID and text are required" });
        }
        const senderId = req.user._id; // Get the logged-in user's ID

        let imageUrl = "";
        // If an image is provided, process it
        if (image) {
            // Upload the image to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat_images", // Specify the folder in Cloudinary
                resource_type: "image" // Specify the resource type
            });
            imageUrl = uploadResponse.secure_url; // Get the secure URL of the uploaded image
            if (!imageUrl) {
                return res.status(400).json({ message: "Image upload failed" });
            }
        }
        // Create a new message
        const newMessage = await messageModel.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        // Emit the new message to the receiver's socket

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage); // Emit the new message to the receiver's socket
        } else {
            console.log(`Receiver with ID ${receiverId} is not online`);
        }


        res.status(true).json(newMessage); // Respond with the created message
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(false).json({ message: "Internal server error" });
    }
};