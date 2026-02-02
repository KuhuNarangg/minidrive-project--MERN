const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const File = require("../models/File");
const auth = require("../middleware/auth");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

/* ---------- MULTER SETUP ---------- */
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= ADMIN ROUTES ================= */

/* ---------- GET ALL FILES (ADMIN) ---------- */
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const files = await File.find().populate("owner", "email");
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin files" });
  }
});

/* ---------- GET FILES BY USER ID (ADMIN) ---------- */
router.get("/admin/users/:userId", auth, admin, async (req, res) => {
  try {
    const files = await File.find({ owner: req.params.userId }).populate("owner", "email");
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files for this user" });
  }
});

/* ---------- DELETE ANY FILE (ADMIN) ---------- */
router.delete("/admin/:id", auth, admin, async (req, res) => {
  try {
    await File.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete file" });
  }
});

/* ---------- UPLOAD ---------- */
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const savedFile = await File.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    owner: req.user.id,
  });

  res.json(savedFile);
});

/* ---------- GET MY FILES ---------- */
router.get("/", auth, async (req, res) => {
  const files = await File.find({ owner: req.user.id, isDeleted: false }).sort({
    createdAt: -1,
  });
  res.json(files);
});

/* ---------- SHARE FILE ---------- */
/* ---------- SHARE FILE ---------- */
router.post("/share/:id", auth, async (req, res) => {
  console.log("--- Share Request Received ---");
  console.log("Values:", req.body);
  console.log("Params:", req.params);
  console.log("User:", req.user);

  const { email, permission } = req.body; // permission: 'view' | 'edit'

  if (!email) {
    console.log("Error: Email missing");
    return res.status(400).json({ message: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
    if (!file) {
      console.log("Error: File not found or unauthorized");
      return res.status(404).json({ message: "File not found" });
    }

    // Check if already shared
    const alreadyShared = file.sharedWith.find(s => s.email === normalizedEmail);
    if (alreadyShared) {
      console.log("Updating existing share");
      alreadyShared.permission = permission || "view";
    } else {
      console.log("Adding new share");
      file.sharedWith.push({ email: normalizedEmail, permission: permission || "view" });
    }

    await file.save();
    console.log("Share saved successfully");
    res.json({ message: "File shared successfully", file });
  } catch (err) {
    console.error("Share Validation/Save Error:", err);
    res.status(500).json({ message: "Sharing failed: " + err.message });
  }
});

/* ---------- GET SHARED WITH ME ---------- */
router.get("/shared", auth, async (req, res) => {
  try {
    const files = await File.find({
      "sharedWith.email": req.user.email.toLowerCase(),
      isDeleted: false
    }).populate("owner", "email");
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch shared files" });
  }
});

/* ---------- DELETE MY FILE ---------- */
/* ---------- DELETE MY FILE (HARD DELETE) ---------- */
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await File.deleteOne({ _id: req.params.id, owner: req.user.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "File not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

/* ---------- RESTORE OR PERMANENT DELETE (OPTIONAL) ---------- */
router.delete("/trash/:id", auth, async (req, res) => {
  // Permanent delete
  await File.deleteOne({ _id: req.params.id, owner: req.user.id });
  res.json({ success: true });
});


/* ---------- UPDATE FILE CONTENT ---------- */
router.put("/:id/content", auth, upload.single("file"), async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check permissions
    // Check permissions
    const isOwner = file.owner.toString() === req.user.id;
    const shared = file.sharedWith.find(s => s.email === req.user.email.toLowerCase());
    const isAdmin = req.user.role === 'admin';
    const canEdit = isOwner || isAdmin || (shared && shared.permission === 'edit');

    if (!canEdit) {
      return res.status(403).json({ message: "Access denied. Edit permission required." });
    }

    // We expect a text file upload or raw body. 
    // To keep it simple with the existing multer setup, we'll assume the client re-uploads the file 
    // OR sends text in the body if we want to support direct text connection.
    // However, multer is middleware here. Let's handle 'text' update via body for simplicity if possible,
    // BUT since we are using 'upload.single("file")' it might expect multipart.

    // Strategy: If req.file exists, we replace the file on disk.
    // If req.body.content exists and no file, we write to the existing path (only for text files).

    const fs = require('fs');
    const path = require('path');

    if (req.file) {
      // Multer already saved the new file. 
      // We should probably delete the old one and point to new, or just update metadata if needed.
      // But simpler: just update metadata to point to new file info if filename changed, 
      // or just trust the new file is "the" file.
      // Actually, standard practice: replace the backing file.

      // Delete old file
      try {
        fs.unlinkSync(path.join(__dirname, "../../uploads", file.filename));
      } catch (e) {
        console.warn("Failed to delete old file", e);
      }

      file.filename = req.file.filename;
      file.size = req.file.size;
      file.updatedAt = Date.now();
      await file.save();

      return res.json({ message: "File updated", file });
    }

    if (req.body.content) {
      // Text based update
      const filePath = path.join(__dirname, "../../uploads", file.filename);
      fs.writeFileSync(filePath, req.body.content);

      file.size = Buffer.byteLength(req.body.content);
      file.updatedAt = Date.now();
      await file.save();

      return res.json({ message: "File content updated", file });
    }

    return res.status(400).json({ message: "No content provided" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});

/* ---------- DELETE ANY FILE (ADMIN) ---------- */

module.exports = router;