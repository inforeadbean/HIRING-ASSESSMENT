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

// POST /api/questions
router.post("/", protect, async (req, res) => {
  const { question, options, correctAnswer, section, sectionCode, targetPositions, experienceLevels } = req.body;
  if (!question || !question.trim()) return res.status(400).json({ message: "Question text is required" });
  if (!Array.isArray(options) || options.length !== 4) return res.status(400).json({ message: "Need exactly 4 options" });
  if (options.some(o => !o || !o.trim())) return res.status(400).json({ message: "All 4 options must be filled" });
  if (correctAnswer === undefined || correctAnswer < 0 || correctAnswer > 3) return res.status(400).json({ message: "Correct answer must be 0-3" });
  if (!section || !sectionCode || !["A","B","C","D"].includes(sectionCode)) return res.status(400).json({ message: "Valid section required" });
  try {
    const q = await Question.create({
      question: question.trim(),
      options: options.map(o => o.trim()),
      correctAnswer: Number(correctAnswer),
      section,
      sectionCode,
      targetPositions: Array.isArray(targetPositions) && targetPositions.length ? targetPositions : ["all"],
      experienceLevels: Array.isArray(experienceLevels) && experienceLevels.length ? experienceLevels : ["all"],
      isActive: req.body.isActive !== false,
      createdBy: req.admin._id
    });
    res.status(201).json(q);
  } catch (error) {
    console.error("Create question error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
});

// PUT /api/questions/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.correctAnswer !== undefined) update.correctAnswer = Number(update.correctAnswer);
    if (update.options) update.options = update.options.map(o => o.trim());
    if (update.question) update.question = update.question.trim();
    const q = await Question.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!q) return res.status(404).json({ message: "Not found" });
    res.json(q);
  } catch (error) {
    console.error("Update question error:", error);
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
