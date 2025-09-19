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

// Service model
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: [
      "Operational",
      "Degraded Performance",
      "Partial Outage",
      "Major Outage",
    ],
    default: "Operational",
  },
  createdAt: { type: Date, default: Date.now },
});
const Service = mongoose.model("Service", serviceSchema);

// CORS configuration
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Simple login endpoint
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Invalid credentials" });
});

// Auth middleware for admin routes
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }
  const token = auth.split(" ")[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

app.get("/", (req, res) => {
  res.send("Status page backend is running!");
});

// Service CRUD API
app.get("/api/services", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

// Protect admin service routes
app.post("/api/services", requireAuth, async (req, res) => {
  const { name, description, status } = req.body;
  const service = new Service({ name, description, status });
  await service.save();
  res.status(201).json(service);
});

app.put("/api/services/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const service = await Service.findByIdAndUpdate(
    id,
    { name, description, status },
    { new: true }
  );
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json(service);
});

app.delete("/api/services/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ message: "Service deleted" });
});

app.get("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: "Invalid service ID" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
