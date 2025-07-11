import express from 'express';
import { isAuthenticated, logout, signin, signup, updateProfile } from '../controllers/authController.js';
import { protectedRoute } from '../middleware/auth.js';
const authRouter = express.Router();

authRouter.post("/signup",signup);
authRouter.post("/signin",signin);
authRouter.post("/logout",logout);

authRouter.put("/update-profile",protectedRoute,updateProfile);
authRouter.get("/authentication",protectedRoute,isAuthenticated);

export default authRouter;