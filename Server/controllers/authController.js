import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import userModel from "../models/User.js";
import bcrypt from "bcryptjs";

// signup user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    let user = await userModel.findOne({ email });
    if (user) {
      return res.json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      fullName,
      email,
      password: hashedPassword,
      bio,
      profilePic: req.file ? req.file.path : "",
    });

    const token = generateToken(newUser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    await newUser.save();

    res.json({
      success: true,
      message: "User registered successfully",
      userData: newUser,
      token,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// signin user
export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.json({ success: false, message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({
      success: true,
      message: "User logged in successfully",
      userData: user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    res.json({
      success: true,
      message: "User is authenticated",
      userData: req.user,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
};

// update user profile
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    const { profilePic, fullName, bio } = req.body;
    const userId = req.user._id;

    // Fetch the current user once
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update values
    if (profilePic) {
      const uploadedProfilePic = await cloudinary.uploader.upload(profilePic);
      user.profilePic = uploadedProfilePic.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;

    // Save the updated user
    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUser: user, // original user object, already in memory
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Internal server error" });
  }
};
