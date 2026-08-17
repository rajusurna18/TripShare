import User from "../auth/auth.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import transporter from "../../config/mail.js";
import AIConversation from "../ai/ai.model.js";
import mongoose from "mongoose";
import Trip from "../trip/trip.model.js";
import Activity from "../activity/activity.model.js";
import AIPackingList from "../ai/aiPacking.model.js";
import Blog from "../blog/blog.model.js";
import BlogComment from "../blog/blogComment.model.js";
import BlogLike from "../blog/blogLike.model.js";
import BlogSave from "../blog/blogSave.model.js";
import BlogShare from "../blog/blogShare.model.js";
import BlogView from "../blog/blogView.model.js";
import Memory from "../memory/memory.model.js";
import MemoryComment from "../memory/memoryComment.model.js";
import Friend from "../friend/friend.model.js";
import JoinRequest from "../joinRequest/joinRequest.model.js";
import Notification from "../notification/notification.model.js";
import Review from "../review/review.model.js";
import TimelineEvent from "../timeline/timelineEvent.model.js";
import TripSave from "../tripSave/tripSave.model.js";
import TripShare from "../tripSave/tripShare.model.js";
import Message from "../messages/message.model.js";

// @desc    Update notification preferences
// @route   PUT /api/settings/preferences
// @access  Private
export const updatePreferences = async (req, res) => {
  try {
    const { notificationPreferences, privacyPreferences, aiPreferences } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    if (privacyPreferences) {
      user.privacyPreferences = {
        ...user.privacyPreferences,
        ...privacyPreferences,
      };
    }

    if (aiPreferences) {
      user.aiPreferences = {
        ...user.aiPreferences,
        ...aiPreferences,
      };
    }

    await user.save();
    res.status(200).json({ success: true, message: "Preferences updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change password
// @route   POST /api/settings/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Please provide current and new passwords" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check if user is registered via Google OAuth (no local password expected)
    if (user.profileImage && user.profileImage.includes("googleusercontent")) {
      return res.status(400).json({ success: false, error: "OAuth users cannot change passwords here" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Incorrect current password" });
    }

    // Validate new password complexity
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ success: false, error: "Password must contain at least one uppercase letter and one number" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Invalidate all other sessions
    user.sessionValidAfter = Math.floor(Date.now() / 1000) + 1;
    
    await user.save();

    // Generate a new JWT so the current session remains active seamlessly
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({ success: true, message: "Password updated successfully", token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Request email change OTP
// @route   POST /api/settings/change-email/request
// @access  Private
export const requestEmailChange = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({ success: false, error: "Please provide current password and new email" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Verify password first
    if (user.password && !user.password.startsWith("oauth-")) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, error: "Incorrect password" });
      }
    }

    // Check if email already in use
    const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ success: false, error: "Email already in use" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP securely
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.newEmailOTP = hashedOTP;
    user.newEmailPending = newEmail.toLowerCase();
    user.newEmailExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    // Send email via existing utility
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: newEmail,
        subject: "TripShare - Verify Your New Email",
        text: `Your TripShare verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.`,
      });
      res.status(200).json({ success: true, message: "Verification code sent to new email" });
    } catch (mailError) {
      // Clear fields if mail fails
      user.newEmailOTP = undefined;
      user.newEmailPending = undefined;
      user.newEmailExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, error: "Email service unavailable. Could not send code." });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify and apply new email
// @route   POST /api/settings/change-email/verify
// @access  Private
export const verifyEmailChange = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, error: "Please provide the verification code" });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.newEmailPending || !user.newEmailOTP || !user.newEmailExpire) {
      return res.status(400).json({ success: false, error: "No pending email change request" });
    }

    if (Date.now() > user.newEmailExpire) {
      user.newEmailOTP = undefined;
      user.newEmailPending = undefined;
      user.newEmailExpire = undefined;
      await user.save();
      return res.status(400).json({ success: false, error: "Verification code expired" });
    }

    // Hash submitted OTP and compare
    const hashedSubmittedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedSubmittedOTP !== user.newEmailOTP) {
      return res.status(400).json({ success: false, error: "Invalid verification code" });
    }

    // Apply new email and clear OTP fields
    user.email = user.newEmailPending;
    user.newEmailOTP = undefined;
    user.newEmailPending = undefined;
    user.newEmailExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Email changed successfully", email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get blocked users list
// @route   GET /api/settings/blocked-users
// @access  Private
export const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("blockedUsers", "name profileImage");
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({ success: true, blockedUsers: user.blockedUsers || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Block a user
// @route   POST /api/settings/block/:id
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.id.toString()) {
      return res.status(400).json({ success: false, error: "You cannot block yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: "Target user not found" });
    }

    const user = await User.findById(req.user.id);

    // Initialize if undefined
    if (!user.blockedUsers) user.blockedUsers = [];

    if (user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ success: false, error: "User is already blocked" });
    }

    user.blockedUsers.push(targetUserId);
    await user.save();

    res.status(200).json({ success: true, message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Unblock a user
// @route   DELETE /api/settings/block/:id
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const user = await User.findById(req.user.id);

    if (!user.blockedUsers || !user.blockedUsers.includes(targetUserId)) {
      return res.status(400).json({ success: false, error: "User is not blocked" });
    }

    user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== targetUserId);
    await user.save();

    res.status(200).json({ success: true, message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Clear AI conversation history for authenticated user
// @route   DELETE /api/settings/ai/history
// @access  Private
export const clearAIHistory = async (req, res) => {
  try {
    // Only delete documents belonging to the strictly authenticated user
    await AIConversation.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: "AI conversation history cleared successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.sessionValidAfter = Math.floor(Date.now() / 1000) + 1;
    await user.save();

    res.status(200).json({ success: true, message: "Logged out from all devices successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.isActive = false;
    user.sessionValidAfter = Math.floor(Date.now() / 1000) + 1;
    await user.save();

    res.status(200).json({ success: true, message: "Account deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAccount = async (req, res) => {
  const targetId = req.user.id;
  
  const activeTrips = await Trip.find({ members: targetId });
  if (activeTrips.length > 0) {
    return res.status(400).json({
      success: false,
      error: "You must leave or delete all active trips before deleting your account.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Personal Records
    await Activity.deleteMany({ actor: targetId }, { session });
    await AIConversation.deleteMany({ userId: targetId }, { session });
    await AIPackingList.deleteMany({ user: targetId }, { session });

    // 2. Blogs and associated interactions
    const deletedBlogs = await Blog.find({ author: targetId }).select("_id");
    const blogIds = deletedBlogs.map((b) => b._id);

    await Blog.deleteMany({ author: targetId }, { session });
    await BlogComment.deleteMany({ $or: [{ user: targetId }, { blog: { $in: blogIds } }] }, { session });
    await BlogLike.deleteMany({ $or: [{ user: targetId }, { blog: { $in: blogIds } }] }, { session });
    await BlogSave.deleteMany({ $or: [{ user: targetId }, { blog: { $in: blogIds } }] }, { session });
    await BlogShare.deleteMany({ $or: [{ user: targetId }, { blog: { $in: blogIds } }] }, { session });
    await BlogView.deleteMany({ blog: { $in: blogIds } }, { session });
    await BlogView.deleteMany({ identifier: targetId.toString() }, { session });

    // 3. Memories
    const deletedMemories = await Memory.find({ createdBy: targetId }).select("_id");
    const memoryIds = deletedMemories.map((m) => m._id);

    await Memory.deleteMany({ createdBy: targetId }, { session });
    await MemoryComment.deleteMany({ $or: [{ user: targetId }, { memory: { $in: memoryIds } }] }, { session });
    await Memory.updateMany(
      { $or: [{ likes: targetId }, { taggedUsers: targetId }] },
      { $pull: { likes: targetId, taggedUsers: targetId } },
      { session }
    );

    // 4. Friends and Requests
    await Friend.deleteMany({ $or: [{ sender: targetId }, { receiver: targetId }] }, { session });
    await JoinRequest.deleteMany({ user: targetId }, { session });

    // 5. Notifications
    await Notification.deleteMany({ $or: [{ user: targetId }, { sender: targetId }] }, { session });

    // 6. Reviews
    await Review.deleteMany({ $or: [{ reviewer: targetId }, { reviewFor: targetId }] }, { session });

    // 7. Timeline & Trip actions
    await TimelineEvent.deleteMany({ createdBy: targetId }, { session });
    await TripSave.deleteMany({ user: targetId }, { session });
    await TripShare.deleteMany({ user: targetId }, { session });

    // 8. Cross-User User Array Cleanup
    await User.updateMany(
      { $or: [{ friends: targetId }, { followers: targetId }, { following: targetId }, { blockedUsers: targetId }] },
      { $pull: { friends: targetId, followers: targetId, following: targetId, blockedUsers: targetId } },
      { session }
    );

    // 9. Messages
    await Message.updateMany({ sender: targetId }, { $set: { sender: null } }, { session });
    await Message.updateMany(
      { readBy: targetId },
      { $pull: { readBy: targetId } },
      { session }
    );
    await Message.updateMany(
      { "reactions.user": targetId },
      { $pull: { reactions: { user: targetId } } },
      { session }
    );

    // 10. Delete User Last
    await User.deleteOne({ _id: targetId }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, error: error.message });
  }
};
