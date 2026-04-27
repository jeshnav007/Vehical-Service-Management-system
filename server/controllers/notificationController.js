import asyncHandler from 'express-async-handler';
import Notification from '../models/notificationModel.js';

// Internal utility: Create Notification systematically
export const createNotification = async (userId, title, message, type = 'Info') => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (err) {
    console.error('Notification Generation Failed:', err.message);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (notification && notification.user.toString() === req.user._id.toString()) {
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } else {
    res.status(404);
    throw new Error('Notification not found or unauthorized');
  }
});

export { getNotifications, markAsRead };
