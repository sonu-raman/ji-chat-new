const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const User = require("./models/User");
const Post = require("./models/Post");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// ================= CLOUDINARY =================
cloudinary.config({
  cloud_name: "RAMAN5491",
  api_key: "274725844534414",
  api_secret: "NRcojb6_RScAH1QIp6oRdL4hbV4",
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "instagram_clone",
  },
});

const upload = multer({ storage });

// ================= ROUTES =================

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Signup
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ name, email, password: hashed });
  await user.save();

  res.json({ msg: "User created" });
});

// Login (JWT)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ msg: "Wrong password" });

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1d" });

  res.json({ msg: "Welcome " + email, token });
});

// Upload profile pic
app.post("/upload/profile", upload.single("image"), async (req, res) => {
  const { email } = req.body;

  const profilePic = req.file.path; // cloudinary URL

  await User.findOneAndUpdate({ email }, { profilePic });

  res.json({ msg: "Profile updated", profilePic });
});

// Upload post (multiple images)
app.post("/upload/post", upload.array("images"), async (req, res) => {
  const { user, content } = req.body;

  const images = req.files.map(file => file.path);

  const post = new Post({ user, content, images });

  await post.save();

  res.json({ msg: "Post created", post });
});

// Get all posts
app.get("/posts", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Like post
app.post("/posts/:id/like", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.likes += 1;
  await post.save();
  res.json({ msg: "Liked" });
});

// Comment
app.post("/posts/:id/comment", async (req, res) => {
  const { user, text } = req.body;

  const post = await Post.findById(req.params.id);
  post.comments.push({ user, text });

  await post.save();

  res.json({ msg: "Comment added" });
});

// ================= MONGODB =================
mongoose.connect("mongodb://admin:Admin5491@ac-ddxwgfb-shard-00-00.k2fpvgh.mongodb.net:27017,ac-ddxwgfb-shard-00-01.k2fpvgh.mongodb.net:27017,ac-ddxwgfb-shard-00-02.k2fpvgh.mongodb.net:27017/?ssl=true&replicaSet=atlas-ko0vvt-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));
// ================= SERVER =================
app.listen(8080, "0.0.0.0", () => {
  console.log("Server running on port 8080 🚀");
});