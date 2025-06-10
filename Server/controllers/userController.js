import { generateToken } from "../lib/utils";
import { protectedRoute } from "../middleware/auth";
import userModel from "../models/User";
import bcrypt from "bcryptjs";

// signup user
export const signup = async (req, res) => {
  const { fullName,email, password ,bio} = req.body;
  try {
    // Validate input
    if (!fullName || !email || !password) {
      return res.status(false).json({ message: "All fields are required" });
    }
    // Check if user already exists
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(false).json({ message: "User already exists" });
    }
    // bcrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);    

    // Create new user
    const newUser = new userModel({
      fullName,
      email,
      password : hashedPassword,
      bio,
      profilePic: req.file ? req.file.path : "",
    });

    //token generation
    const token = generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
    });


    // Save user to database 
    await newUser.save();
    res.status(true).json({
      message: "User registered successfully", userData: newUser, token
    });

  } catch (error) {
    console.error(error);
    res.status(false).json({ message: "Internal server error" });
  }
}

// signin user
export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate input
    if (!email || !password) {
      return res.status(false).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(false).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(false).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict",
    });

    res.status(true).json({
      message: "User logged in successfully",
      userData: user,
      token,
    });

  } catch (error) {
    console.error(error);
    res.status(false).json({ message: "Internal server error" });
  }
}

//controller to check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(false).json({ message: "User not authenticated" });
    }

    res.status(true).json({
      message: "User is authenticated",
      userData: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(false).json({ message: "Internal server error" });
  }
}

// controller to update user profile
export const updateProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(false).json({ message: "User not authenticated" });
    }

    const { fullName, bio } = req.body;
    const updatedData = {
      fullName,
      bio,
      profilePic: req.file ? req.file.path : req.user.profilePic, // Use existing profilePic if not updated
    };

    // Update user in database
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id, updatedData, { new: true });

    res.status(true).json({
      message: "Profile updated successfully",
      userData: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(false).json({ message: "Internal server error" });
  }
}
