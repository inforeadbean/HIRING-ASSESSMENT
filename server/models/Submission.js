const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.Mixed, required: true },
  section: String,
  sectionCode: String,
  question: String,
  selectedOption: { type: Number, default: null },
  correctAnswer: Number,
  isCorrect: Boolean
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  candidate: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    position: { type: String, default: "", trim: true },
    experience: String
  },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 20 },
  percentage: { type: Number, default: 0 },
  sectionScores: {
    A: { score: Number, total: Number, label: String },
    B: { score: Number, total: Number, label: String },
    C: { score: Number, total: Number, label: String },
    D: { score: Number, total: Number, label: String }
  },
  grade: {
    type: String,
    enum: ["Excellent", "Good", "Average", "Below Average", "Poor"],
    default: "Poor"
  },
  timeTaken: Number,
  status: {
    type: String,
    enum: ["in-progress", "completed", "abandoned"],
    default: "in-progress"
  },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  ipAddress: String,
  sessionId: { type: String, unique: true }
}, { timestamps: true });

submissionSchema.pre("save", function (next) {
  if (this.score !== undefined && this.totalQuestions) {
    this.percentage = Math.round((this.score / this.totalQuestions) * 100);
    if (this.percentage >= 90) this.grade = "Excellent";
    else if (this.percentage >= 75) this.grade = "Good";
    else if (this.percentage >= 60) this.grade = "Average";
    else if (this.percentage >= 40) this.grade = "Below Average";
    else this.grade = "Poor";
  }
  next();
});

module.exports = mongoose.model("Submission", submissionSchema);
