const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: String,
  content: String,
  images: [String],                   // multiple images
  likes: { type: Number, default: 0 },
  comments: [{ user: String, text: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);