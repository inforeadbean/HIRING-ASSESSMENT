const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "global" },
  timerMinutes: { type: Number, default: 30, min: 5, max: 120 }
}, { timestamps: true });

module.exports = mongoose.model("Settings", settingsSchema);
