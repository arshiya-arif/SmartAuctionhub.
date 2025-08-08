const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  auction: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Auction', 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { type: Number, required: true },
  stripePaymentId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  receiptUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);