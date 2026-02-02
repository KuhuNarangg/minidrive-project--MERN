const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sharedWith: [
      {
        email: String,
        permission: {
          type: String,
          enum: ["view", "edit"],
          default: "view",
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);