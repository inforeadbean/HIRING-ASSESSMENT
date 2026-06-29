require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL || "*";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available to routes
app.set("io", io);

connectDB();

app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan("combined"));
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "10kb" }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests" }));
app.use("/api/assessment/submit", rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: "Submission limit reached" }));

app.use("/api/assessment", require("./routes/assessment"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/questions", require("./routes/questions"));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);
  socket.join("admins");
  socket.on("disconnect", () => console.log("Admin disconnected:", socket.id));
});

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

const { seedQuestionsIfEmpty } = require("./seed/seedQuestions");
seedQuestionsIfEmpty().catch(console.error);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
