require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(cors());
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