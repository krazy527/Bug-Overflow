import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinedOn: { type: Date, default: Date.now },
  reputation: { type: Number, default: 1 },
  badges: {
    bronze: { type: [String], default: [] },
    silver: { type: [String], default: [] },
    gold: { type: [String], default: [] },
  },
  bookmarks: { type: [String], default: [] },
  notifications: [
    {
      message: { type: String, required: true },
      link: { type: String },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("User", userSchema);
