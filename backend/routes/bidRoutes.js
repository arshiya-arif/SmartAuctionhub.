

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Bid = require("../models/Bid");
const Auction = require("../models/Auction");

module.exports = (io) => {
  const router = express.Router();


  router.post("/place-bid", authMiddleware, async (req, res) => {
    const { auctionId, bidAmount } = req.body;

    try {
      const auction = await Auction.findById(auctionId);
      if (!auction) return res.status(404).json({ message: "Auction not found" });

      if (bidAmount <= auction.currentBid) {
        return res.status(400).json({ message: "Bid must be higher than current bid" });
      }

      const newBid = new Bid({
        auction: auctionId,
        bidder: req.user.id,
        amount: bidAmount
      });

      await newBid.save();

      auction.currentBid = bidAmount;
      await auction.save();

      
      io.emit("newBid", {
        auctionId,
        bidAmount,
        bidder: req.user.name || req.user.id
      });

      res.status(201).json({ message: "Bid placed successfully", newBid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};

