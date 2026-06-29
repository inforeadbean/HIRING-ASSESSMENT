require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan("combined"));
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json({ limit: "10kb" }));

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests, please try again later" }));

// Stricter limit for assessment submission
app.use("/api/assessment/submit", rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: "Submission limit reached" }));

app.use("/api/assessment", require("./routes/assessment"));
app.use("/api/admin", require("./routes/admin"));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Seed first superadmin if none exists
const Admin = require("./models/Admin");
const seedAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      name: "Super Admin",
      role: "superadmin"
    });
    console.log("Default admin created — username: admin / password: Admin@123");
  }
};
seedAdmin().catch(console.error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
