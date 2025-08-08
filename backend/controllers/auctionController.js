const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Create new auction
exports.createAuction = async (req, res) => {
  try {
    const { title, description, category, startingBid, endDate } = req.body;

    if (!title || !description || !category || !req.file || !startingBid || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate) ){
      return res.status(400).json({ message: "Invalid end date format" });
    }

    const newAuction = new Auction({
      title,
      description,
      category,
      startingBid,
      image: req.file.path,
      sellerId: req.user.id,
      endDate: parsedEndDate,
      status: 'active'
    });

    await newAuction.save();
    res.status(201).json({ message: "Auction created successfully", auction: newAuction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all auctions with filters
exports.getAuctions = async (req, res) => {
  try {
    let { search, category, minPrice, maxPrice, sort } = req.query;
    let filter = { status: 'active' };

    if (search) filter.title = { $regex: search, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.startingBid = {};
      if (minPrice) filter.startingBid.$gte = Number(minPrice);
      if (maxPrice) filter.startingBid.$lte = Number(maxPrice);
    }

    let query = Auction.find(filter);

    switch (sort) {
      case "price_asc": query.sort({ startingBid: 1 }); break;
      case "price_desc": query.sort({ startingBid: -1 }); break;
      case "ending_soon": query.sort({ endDate: 1 }); break;
      default: query.sort({ createdAt: -1 });
    }

    const auctions = await query.exec();
    res.status(200).json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Error fetching auctions" });
  }
};

// Get single auction details
exports.getAuctionDetails = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("sellerId", "name email")
      .lean();

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const timeRemaining = new Date(auction.endDate) - new Date();
    res.status(200).json({
      ...auction,
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching auction" });
  }
};

// Get seller's auctions
exports.getSellerAuctions = async (req, res) => {
  try {
    const products = await Auction.find({ sellerId: req.user.id });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update auction
exports.updateAuction = async (req, res) => {
  try {
    let product = await Auction.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Auction not found" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    const { title, description, category, startingBid, endDate } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (category) product.category = category;
    if (startingBid) product.startingBid = startingBid;

    if (endDate) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate)) {
        return res.status(400).json({ message: "Invalid end date format" });
      }
      product.endDate = parsedEndDate;
    }

    if (req.file) product.image = req.file.path;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete auction
exports.deleteAuction = async (req, res) => {
  try {
    const product = await Auction.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Auction not found" });
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await product.deleteOne();
    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// End auction and determine winner
exports.endAuction = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const auction = await Auction.findById(req.params.id).session(session);
      if (!auction) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Auction not found' });
      }

      if (auction.sellerId.toString() !== req.user.id) {
        await session.abortTransaction();
        return res.status(403).json({ message: 'Only the seller can end this auction' });
      }

      if (auction.status !== 'active') {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Auction has already ended' });
      }

      const winningBid = await Bid.findOne({ auctionId: req.params.id })
        .sort('-bidAmount')
        .populate('userId')
        .session(session);

      if (winningBid) {
        auction.winner = winningBid.userId._id;
        auction.winningBid = winningBid._id;
        auction.winningAmount = winningBid.bidAmount;
        auction.status = 'ended_winner';
        auction.highestBid = winningBid.bidAmount;

        winningBid.isWinning = true;
        await winningBid.save({ session });

        await Notification.create([{
          userId: winningBid.userId._id,
          type: 'auction_won',
          message: `You won the auction for ${auction.title}`,
          auctionId: auction._id,
          read: false
        }], { session });
      } else {
        auction.status = 'ended_no_bids';
      }

      await auction.save({ session });
      await session.commitTransaction();

      if (winningBid?.userId) {
        req.io.emit('auctionEnded', { 
          auctionId: auction._id,
          winnerId: winningBid.userId._id,
          winningAmount: winningBid.bidAmount
        });
      }

      res.json({
        success: true,
        auction,
        winningBid: winningBid || null
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error ending auction:', error);
    res.status(500).json({ message: 'Failed to end auction' });
  }
};