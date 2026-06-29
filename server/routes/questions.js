const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Question = require("../models/Question");
const { protect } = require("../middleware/auth");

// GET /api/questions/positions  — must be before /:id
router.get("/positions", protect, async (req, res) => {
  try {
    const positions = await Question.distinct("targetPositions");
    res.json({ positions: positions.filter(p => p !== "all").sort() });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/questions
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.position && req.query.position !== "all") filter.targetPositions = req.query.position;
    if (req.query.experience && req.query.experience !== "all") filter.experienceLevels = req.query.experience;
    if (req.query.section) filter.sectionCode = req.query.section;
    const qs = await Question.find(filter).sort({ sectionCode: 1, createdAt: 1 });
    res.json({ questions: qs, total: qs.length });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

const qValidation = [
  body("question").trim().notEmpty().withMessage("Question text is required"),
  body("options").isArray({ min: 4, max: 4 }).withMessage("Need exactly 4 options"),
  body("options.*").trim().notEmpty().withMessage("All options must be non-empty"),
  body("correctAnswer").isInt({ min: 0, max: 3 }).withMessage("Correct answer must be 0-3"),
  body("section").trim().notEmpty().withMessage("Section name is required"),
  body("sectionCode").isIn(["A","B","C","D"]).withMessage("Section code must be A-D")
];

// POST /api/questions
router.post("/", protect, qValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const q = await Question.create({ ...req.body, createdBy: req.admin._id });
    res.status(201).json(q);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/questions/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!q) return res.status(404).json({ message: "Not found" });
    res.json(q);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/questions/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
