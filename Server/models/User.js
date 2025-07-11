// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: {
   type: String,
   required: true
 },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    default: "Hi Everyone, I am using this app."
  },
  profilePic: {
    type: String,
    default: ""
  },
},
{
  timestamps: true
});     

const userModel = mongoose.model('userModel', UserSchema);

export default userModel;
