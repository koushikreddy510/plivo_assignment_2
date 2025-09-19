const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "password";

// MongoDB connection
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/statuspage";
console.log("mongo URI", mongoURI);
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Health
app.get("/healthz", (req, res) => {
  res.json({ status: "ok" });
});

// Simple login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// Routes
const servicesRouter = require("./routes/services");
app.use("/api/services", servicesRouter);

app.get("/", (req, res) => {
  res.send("Status page backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
