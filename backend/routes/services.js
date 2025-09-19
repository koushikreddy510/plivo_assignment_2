const express = require("express");
const Service = require("../models/Service");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", async (req, res) => {
  const services = await Service.find();
  res.json(services);
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: "Invalid service ID" });
  }
});

// Admin
router.post("/", requireAuth, async (req, res) => {
  const { name, description, status } = req.body;
  const service = new Service({ name, description, status });
  await service.save();
  res.status(201).json(service);
});

router.put("/:id", requireAuth, async (req, res) => {
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

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ message: "Service deleted" });
});

module.exports = router;
