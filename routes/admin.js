
const express = require("express");
const User = require("../models/User");
const Content = require("../models/Content");
const DeletedContent = require("../models/DeletedContent");
const RoleChange = require("../models/RoleChange");
const adminAuth = require("../middleware/adminAuth");
const router = express.Router();

// Get all users
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, "userId name email role");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in GET /users:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete a user
router.delete("/users/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }
    const user = await User.findOneAndDelete({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Error in DELETE /users/:userId:", error.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Update user role
router.put("/users/:userId/role", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (userId === req.user.userId) {
      return res.status(403).json({ error: "Cannot update your own role" });
    }
    if (!["educator", "student", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const oldRole = user.role;
    user.role = role;
    await user.save();
    await RoleChange.create({
      userId: user._id, // Store ObjectId
      oldRole,
      newRole: role,
      changedBy: req.user._id, // Store ObjectId
    });
    res.status(200).json({ message: "Role updated", user });
  } catch (error) {
    console.error("Error in PUT /users/:userId/role:", error.message);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Get all content
router.get("/content", adminAuth, async (req, res) => {
  try {
    const content = await Content.find().populate("createdBy", "name email");
    res.status(200).json(content);
  } catch (error) {
    console.error("Error in GET /content:", error.message);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

// Get content by ID
router.get("/content/:contentId", adminAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findOne({ contentId }).populate(
      "createdBy",
      "name email"
    );
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.status(200).json(content);
  } catch (error) {
    console.error("Error in GET /content/:contentId:", error.message);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

// Delete content
router.delete("/content/:contentId", adminAuth, async (req, res) => {
  try {
    const { contentId } = req.params;
    const content = await Content.findOne({ contentId });
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    await DeletedContent.create({
      contentId,
      title: content.title,
      type: content.type,
      deletedBy: req.user._id, // Store ObjectId
      deletedAt: new Date(),
    });
    await Content.deleteOne({ contentId });
    res.status(200).json({ message: "Content deleted" });
  } catch (error) {
    console.error("Error in DELETE /content/:contentId:", error.message);
    res.status(500).json({ error: "Failed to delete content" });
  }
});

// Get deleted content history
router.get("/deleted-content", adminAuth, async (req, res) => {
  try {
    const deletedContent = await DeletedContent.find().populate({
      path: "deletedBy",
      select: "name email",
    });
    res.status(200).json(deletedContent);
  } catch (error) {
    console.error("Error in GET /deleted-content:", error.message);
    res.status(500).json({ error: "Failed to fetch deleted content" });
  }
});

// Get role change history
router.get("/role-changes", adminAuth, async (req, res) => {
  try {
    const roleChanges = await RoleChange.find()
      .sort({ changedAt: -1 }) // Sort newest first
      .populate({
        path: "userId",
        select: "name email",
      })
      .populate({
        path: "changedBy",
        select: "name email",
      });
   
    res.status(200).json(roleChanges);
  } catch (error) {
    console.error("Error in GET /role-changes:", error.message);
    res.status(500).json({ error: "Failed to fetch role changes" });
  }
});

module.exports = router;
