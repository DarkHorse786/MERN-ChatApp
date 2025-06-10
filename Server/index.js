// server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './lib/db.js';
import authRouter from './routes/authRouter.js';
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect MongoDB
connectDB();

app.use(express.json({limit: '5mb'}));
app.use(cors());
const port = process.env.PORT || 3000;
app.use("/api/status", (req, res) => {
  res.send("Server is running on " + port);
});
app.use("/api/auth", authRouter);


// Socket.IO logic
// io.on('connection', (socket) => {
//   console.log("User connected");

//   socket.on('send_message', async (data) => {
//     const message = new Message({
//       username: data.username,
//       text: data.text,
//       timestamp: new Date(),
//     });

//     await message.save(); // Save to MongoDB

//     io.emit('receive_message', message); // Broadcast to all clients
//   });

//   socket.on('disconnect', () => {
//     console.log("User disconnected");
//   });
// });


app.get('/', (req, res) => {
  res.send('Welcome to the Chat Server');
}
);
server.listen(port, () => {
  console.log("Server is running on port 3000");
});
