import express from 'express';
import { isAuthenticated, signin, signup, updateProfile } from '../controllers/authController.js';
import { protectedRoute } from '../middleware/auth.js';
const authRouter = express.Router();

authRouter.get("/signup",signup);
authRouter.post("/signin",signin);
authRouter.post("/update-profile",protectedRoute,updateProfile);
authRouter.post("/authentication",protectedRoute,isAuthenticated);

export default authRouter;

