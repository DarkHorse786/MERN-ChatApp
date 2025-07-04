// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './lib/db.js';
import messageRouter from './routes/messageRouter.js';
import authRouter from './routes/authRouter.js';
dotenv.config();
const app = express();
const server = http.createServer(app);


// Connect MongoDB
connectDB();

app.use(express.json({limit: '5mb'}));
app.use(cors());
const port = process.env.PORT || 3000;
app.use("/api/status", (req, res) => {
  res.send("Server is running on " + port);
});



// Socket.IO logic
// initilize socket.io
export const io =new Server(server, {
  cors: {origins:"*"},
});

//store online users
export const userSocketMap = {}; // {userId: socketId}

// handle socket connection
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId; // Get userId from the query parameters
  console.log("New user connected:", userId);
  if (!userId) {
      console.error("User ID is required to join");
      return;
  }
  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} joined with socket ID: ${socket.id}`);
  io.emit('getOnlineUsers', Object.keys(userSocketMap)); // Emit the list of online users

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userId, id] of Object.entries(userSocketMap)) {
      if (id === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} removed from online users`);
        io.emit('getOnlineUsers', Object.keys(userSocketMap)); // Emit updated list of online users
        break;
      }
    }
  });
});


app.get('/', (req, res) => {
  res.send('Welcome to the Chat Server');
}
);
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);
server.listen(port, () => {
  console.log("Server is running on port 3000");
});
