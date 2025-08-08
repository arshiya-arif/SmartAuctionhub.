const Notification = require('../models/Notification');

exports.sendNotification = async (userId, notificationData) => {
  try {
    const notification = new Notification({
      user: userId,
      type: notificationData.type,
      message: notificationData.message,
      relatedEntity: notificationData.auctionId || notificationData.reviewId || null,
      isRead: false
    });

    await notification.save();

    // Emit real-time notification
    if (typeof socket !== 'undefined' && socket.getIO) {
      socket.getIO().to(userId.toString()).emit('notification', {
        type: notificationData.type,
        message: notificationData.message,
        timestamp: new Date()
      });
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};