// messageRouter
import express from 'express';
import { getMessages,getUsersForSidebar, markMessageAsSeen } from '../controllers/messageController.js';
import { protectedRoute } from '../middleware/auth.js';

const messageRouter = express.Router();

messageRouter.get('/users',protectedRoute, getUsersForSidebar);
messageRouter.get('/:id', protectedRoute , getMessages);
messageRouter.put('/mark/:id', protectedRoute, markMessageAsSeen);

export default messageRouter;



