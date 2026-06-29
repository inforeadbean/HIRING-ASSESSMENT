const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Submission = require("../models/Submission");
const Settings = require("../models/Settings");
const { protect, superAdminOnly } = require("../middleware/auth");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "8h" });

// POST /api/admin/login
router.post("/login", [
  body("username").trim().notEmpty(),
  body("password").notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const admin = await Admin.findOne({ username: req.body.username.toLowerCase() });
    if (!admin || !(await admin.matchPassword(req.body.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    admin.lastLogin = new Date();
    await admin.save();
    res.json({
      token: generateToken(admin._id),
      admin: { id: admin._id, name: admin.name, username: admin.username, role: admin.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/me
router.get("/me", protect, (req, res) => {
  res.json({ admin: req.admin });
});

// GET /api/admin/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const total = await Submission.countDocuments({ status: "completed" });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = await Submission.countDocuments({ status: "completed", submittedAt: { $gte: today } });
    const gradeBreakdown = await Submission.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$grade", count: { $sum: 1 } } }
    ]);
    const avgScore = await Submission.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avg: { $avg: "$percentage" } } }
    ]);
    const recent = await Submission.find({ status: "completed" })
      .sort({ submittedAt: -1 })
      .limit(5)
      .select("candidate.name candidate.position score percentage grade submittedAt");

    res.json({
      total,
      todayCount,
      gradeBreakdown,
      avgPercentage: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : 0,
      recentSubmissions: recent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/submissions
router.get("/submissions", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { status: "completed" };
    if (req.query.grade) filter.grade = req.query.grade;
    if (req.query.position) filter["candidate.position"] = { $regex: req.query.position, $options: "i" };
    if (req.query.search) {
      filter.$or = [
        { "candidate.name": { $regex: req.query.search, $options: "i" } },
        { "candidate.email": { $regex: req.query.search, $options: "i" } }
      ];
    }

    const [submissions, total] = await Promise.all([
      Submission.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit)
        .select("-answers -ipAddress -sessionId"),
      Submission.countDocuments(filter)
    ]);

    res.json({ submissions, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/submissions/:id
router.get("/submissions/:id", protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).select("-ipAddress -sessionId");
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/admin/submissions/:id (superadmin only)
router.delete("/submissions/:id", protect, superAdminOnly, async (req, res) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ message: "Submission deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/settings
router.get("/settings", protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: "global" });
    if (!settings) settings = await Settings.create({ key: "global" });
    res.json({ timerMinutes: settings.timerMinutes, timerEnabled: settings.timerEnabled !== false });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/admin/settings
router.put("/settings", protect, async (req, res) => {
  try {
    const update = {};
    if (req.body.timerMinutes !== undefined) {
      const val = parseInt(req.body.timerMinutes);
      if (!val || val < 1 || val > 180) return res.status(400).json({ message: "Timer must be between 1 and 180 minutes" });
      update.timerMinutes = val;
    }
    if (req.body.timerEnabled !== undefined) {
      update.timerEnabled = Boolean(req.body.timerEnabled);
    }
    if (Object.keys(update).length === 0) return res.status(400).json({ message: "No valid fields to update" });

    const settings = await Settings.findOneAndUpdate(
      { key: "global" },
      update,
      { upsert: true, new: true }
    );
    const io = req.app.get("io");
    if (io) io.emit("timer-updated", { timerMinutes: settings.timerMinutes, timerEnabled: settings.timerEnabled !== false });
    res.json({ timerMinutes: settings.timerMinutes, timerEnabled: settings.timerEnabled !== false });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
});

// POST /api/admin/create (superadmin only)
router.post("/create", protect, superAdminOnly, [
  body("username").trim().notEmpty(),
  body("password").isLength({ min: 6 }),
  body("name").trim().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const existing = await Admin.findOne({ username: req.body.username.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Username already exists" });
    const admin = await Admin.create({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role || "admin"
    });
    res.status(201).json({ message: "Admin created", admin: { id: admin._id, username: admin.username, name: admin.name } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
