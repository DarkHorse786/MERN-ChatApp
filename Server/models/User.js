// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
   fullName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
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
