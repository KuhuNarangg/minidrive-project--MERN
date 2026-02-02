require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// CORS configuration for production and development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);

    // Allow all Vercel deployment URLs
    if (origin.includes('vercel.app')) return callback(null, true);

    // Allow specific production URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
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