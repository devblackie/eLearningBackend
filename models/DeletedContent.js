// backend/models/DeletedContent.js
const mongoose = require("mongoose");
const deletedContentSchema = new mongoose.Schema({
  contentId: { type: String, required: true },
  title: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "image", "video", "document"],
    required: true,
  },
  // deletedBy: { type: String, required: true }, // Reference User.userId
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deletedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("DeletedContent", deletedContentSchema);
