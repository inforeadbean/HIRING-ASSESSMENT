const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question:      { type: String, required: true, trim: true },
  options:       { type: [String], validate: { validator: v => v.length === 4, message: "Need 4 options" } },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  section:       { type: String, required: true },
  sectionCode:   { type: String, required: true, enum: ["A","B","C","D"] },
  // "all" means applies to every position/level
  targetPositions:   { type: [String], default: ["all"] },
  experienceLevels:  { type: [String], default: ["all"] },
  isActive:      { type: Boolean, default: true },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
