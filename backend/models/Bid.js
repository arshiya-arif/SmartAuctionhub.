const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bidAmount: { type: Number, required: true },
  maxBid: { type: Number }, // Only present for auto-bids
  username: { type: String }, // Optional: cache username for display
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bid", bidSchema);
