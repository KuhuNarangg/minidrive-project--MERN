require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// CORS configuration for production and development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // Set this in Render environment variables
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

/* 🔴 REQUIRED */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

app.get("/", (req, res) => {
  res.send("Mini Drive Backend Running");
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});