import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
    },
    country: String,
    city: String,
    age: Number,
    description: String,
    avatarUrl: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
