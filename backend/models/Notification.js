const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['auction_won', 'auction_ended', 'new_bid', 'new_review', 'payment_success', 'payment_failed']
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedEntity: { 
    type: mongoose.Schema.Types.ObjectId 
  }, // Could be auctionId, reviewId, etc
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', notificationSchema);