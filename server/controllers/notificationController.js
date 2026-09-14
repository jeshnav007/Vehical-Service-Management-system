import asyncHandler from 'express-async-handler';
import { db, docWithId, docsWithId } from '../config/firebase.js';

// Internal utility: Create Notification systematically
export const createNotification = async (userId, title, message, type = 'Info') => {
  try {
    if (!userId) return;
    await db.collection('notifications').add({
      user: userId.toString(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Notification Generation Failed:', err.message);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const snapshot = await db.collection('notifications')
    .where('user', '==', req.user._id)
    .get();

  let notifications = docsWithId(snapshot);
  notifications.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.status(200).json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notifRef = db.collection('notifications').doc(req.params.id);
  const notifDoc = await notifRef.get();

  if (!notifDoc.exists) {
    res.status(404);
    throw new Error('Notification not found');
  }

  const notification = notifDoc.data();

  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized access to notification');
  }

  await notifRef.update({
    isRead: true,
    updatedAt: new Date().toISOString(),
  });

  res.status(200).json({ message: 'Notification marked as read' });
});

export { getNotifications, markAsRead };
