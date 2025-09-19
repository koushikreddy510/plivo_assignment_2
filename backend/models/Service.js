const mongoose = require("mongoose");

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

module.exports = mongoose.model("Service", serviceSchema);
