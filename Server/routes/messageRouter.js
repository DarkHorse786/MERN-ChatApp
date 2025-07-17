// messageRouter
import express from 'express';
import { clearChat, getMessages,getUsersForSidebar, markMessageAsSeen, sendMessage } from '../controllers/messageController.js';
import { protectedRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users',protectedRoute, getUsersForSidebar);
messageRouter.get('/:id', protectedRoute , getMessages);
messageRouter.put('/mark/:id', protectedRoute, markMessageAsSeen);
messageRouter.post('/send/:id', protectedRoute, sendMessage); 
messageRouter.delete('/clear/:id', protectedRoute, clearChat); 

export default messageRouter;



