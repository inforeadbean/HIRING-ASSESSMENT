const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const Submission = require("../models/Submission");
const Settings = require("../models/Settings");
const questions = require("../data/questions");

// GET /api/assessment/config - Return public config (timer etc.)
router.get("/config", async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "global" });
    if (!settings) settings = await Settings.create({ key: "global" });
    res.json({ timerMinutes: settings.timerMinutes });
  } catch (error) {
    res.json({ timerMinutes: 30 });
  }
});

// GET /api/assessment/questions - Return questions without answers
router.get("/questions", (req, res) => {
  const safeQuestions = questions.map(({ correctAnswer, explanation, ...q }) => q);
  res.json({ questions: safeQuestions, total: safeQuestions.length });
});

// POST /api/assessment/start - Register candidate and start session
router.post("/start", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("position").trim().notEmpty().withMessage("Position is required")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const sessionId = crypto.randomUUID();
    const submission = new Submission({
      candidate: {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        position: req.body.position,
        experience: req.body.experience || ""
      },
      sessionId,
      status: "in-progress",
      ipAddress: req.ip
    });
    await submission.save();
    res.json({ sessionId, submissionId: submission._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/assessment/submit - Submit answers
router.post("/submit", [
  body("sessionId").notEmpty().withMessage("Session ID required"),
  body("answers").isArray({ min: 1 }).withMessage("Answers are required")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { sessionId, answers, timeTaken } = req.body;
    const submission = await Submission.findOne({ sessionId, status: "in-progress" });
    if (!submission) {
      return res.status(404).json({ message: "Session not found or already submitted" });
    }

    // Score the answers
    const scoredAnswers = [];
    const sectionScores = { A: { score: 0, total: 0 }, B: { score: 0, total: 0 }, C: { score: 0, total: 0 }, D: { score: 0, total: 0 } };
    let totalScore = 0;

    questions.forEach(q => {
      const submitted = answers.find(a => a.questionId === q.id);
      const selectedOption = submitted ? submitted.selectedOption : null;
      const isCorrect = selectedOption === q.correctAnswer;
      if (isCorrect) {
        totalScore++;
        sectionScores[q.sectionCode].score++;
      }
      sectionScores[q.sectionCode].total++;
      scoredAnswers.push({
        questionId: q.id,
        section: q.section,
        sectionCode: q.sectionCode,
        question: q.question,
        selectedOption,
        correctAnswer: q.correctAnswer,
        isCorrect
      });
    });

    submission.answers = scoredAnswers;
    submission.score = totalScore;
    submission.totalQuestions = questions.length;
    submission.sectionScores = {
      A: { ...sectionScores.A, label: "Logical & IQ Assessment" },
      B: { ...sectionScores.B, label: "Decision Making" },
      C: { ...sectionScores.C, label: "Integrity" },
      D: { ...sectionScores.D, label: "Stress & Work Style" }
    };
    submission.timeTaken = timeTaken;
    submission.status = "completed";
    submission.submittedAt = new Date();
    await submission.save();

    res.json({
      message: "Assessment submitted successfully",
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      percentage: submission.percentage,
      grade: submission.grade,
      sectionScores: submission.sectionScores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
