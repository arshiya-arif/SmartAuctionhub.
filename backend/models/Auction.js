const mongoose = require("mongoose");




const auctionSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  image: String,
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  startingBid: Number,
  currentBid: Number, // Add this if you want to track current bid separately
  highestBid: { type: Number, default: 0 },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  winningBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  winningAmount: Number,
  status: { 
    type: String, 
    enum: ['active', 'ended_no_bids', 'ended_winner', 'completed', 'ended'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  endDate: { type: Date, required: true }, // Main end date field
  // Optional: Add startDate if you need it
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Auction", auctionSchema);