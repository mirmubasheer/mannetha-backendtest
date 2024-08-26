import mongoose from 'mongoose';


// Create Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true  // Ensures email is unique
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const UserModel = mongoose.model("User", UserSchema)

export {UserModel as User}
