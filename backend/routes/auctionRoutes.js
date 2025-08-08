const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const authMiddleware = require("../middleware/authMiddleware");
const auctionController = require('../controllers/auctionController');
const reviewController = require('../controllers/reviewController');
const router = express.Router();
const { predictBid } = require('../services/predictionService');
module.exports = (io) => {
  // Configure Multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Save uploaded files in the "uploads" folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
    },
  });

  const upload = multer({ storage });

 
router.post("/create", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, startingBid, endDate } = req.body;

    if (!title || !description || !category || !req.file || !startingBid || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate) || parsedEndDate <= new Date()) {
      return res.status(400).json({ message: "End date must be a valid future date" });
    }

    const sellerId = req.user.id;

    const newAuction = new Auction({
      title,
      description,
      category,
      startingBid,
      image: req.file.path,
      sellerId,
      endDate: parsedEndDate, // Store auction end date
    });

    await newAuction.save();
    res.status(201).json({ message: "Auction created successfully", auction: newAuction });
  } catch (error) {
    console.error("Error creating auction:", error);
    res.status(500).json({ message: "Server error" });
  }
});

 
  router.get("/", async (req, res) => {
    try {
      let { search, category, minPrice, maxPrice, sort } = req.query;
      let filter = {};

      if (search) {
        filter.title = { $regex: search, $options: "i" }; // Case-insensitive search
      }
      if (category) {
        filter.category = category;
      }

      if (minPrice || maxPrice) {
        filter.startingBid = {};
        if (minPrice) filter.startingBid.$gte = Number(minPrice);
        if (maxPrice) filter.startingBid.$lte = Number(maxPrice);
      }

      let query = Auction.find(filter);

      // Sorting logic
      if (sort === "price_asc") {
        query = query.sort({ startingBid: 1 });
      } else if (sort === "price_desc") {
        query = query.sort({ startingBid: -1 });
      } else if (sort === "ending_soon") {
        query = query.sort({ endDate: 1 });
      }

      const auctions = await query.exec();
      res.status(200).json(auctions);
      console.log(auctions);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      res.status(500).json({ error: "Error fetching auctions" });
    }
  });


  router.get("/:id", async (req, res) => {
    try {
      const auction = await Auction.findById(req.params.id);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
      res.status(200).json(auction);
    } catch (error) {
      res.status(500).json({ error: "Error fetching auction" });
    }
  });


  router.put("/products/:id", authMiddleware, upload.single("image"), async (req, res) => {
    try {
      let product = await Auction.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

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
        if (isNaN(parsedEndDate) || parsedEndDate <= new Date()) {
          return res.status(400).json({ message: "End date must be a valid future date" });
        }
        product.endDate = parsedEndDate;
      }

      if (req.file) {
        product.image = req.file.path;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  
  router.delete("/products/:id", authMiddleware, async (req, res) => {
    try {
      const product = await Auction.findById(req.params.id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.sellerId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized action" });
      }

      await product.deleteOne();
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  //place bid
  router.post("/:id/place-bid", authMiddleware, async (req, res) => {
    try {
      const { bidAmount, maxBid } = req.body;
      const auctionId = req.params.id;
      const userId = req.user.id;
  
      // Validate auction exists
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return res.status(404).json({ message: "Auction not found" });
      }
  
      // Check if auction has ended
      if (new Date(auction.endDate) <= new Date()) {
        return res.status(400).json({ message: "Auction has already ended" });
      }
  
      // Fetch highest current bid
      const highestBid = await Bid.findOne({ auctionId }).sort("-bidAmount");
      const currentHighest = highestBid?.bidAmount || auction.startingBid;
      const minRequiredBid = currentHighest + 1;
  
      // Validate at least one bid type is provided
      if (!bidAmount && !maxBid) {
        return res.status(400).json({ 
          message: "Either bidAmount or maxBid must be provided" 
        });
      }
  
      // Validate manual bid amount
      if (bidAmount && bidAmount < minRequiredBid) {
        return res.status(400).json({ 
          message: `Bid must be at least $${minRequiredBid} (current highest is $${currentHighest})`,
          minimumBid: minRequiredBid
        });
      }
  
      // Validate auto bid amount
      if (maxBid && maxBid <= currentHighest) {
        return res.status(400).json({ 
          message: `Your maximum bid must be higher than current highest bid ($${currentHighest})`,
          currentHighest: currentHighest
        });
      }
  
      // Process manual bid first if provided
      if (bidAmount) {
        const newBid = new Bid({ auctionId, userId, bidAmount });
        await newBid.save();
  
        auction.highestBid = bidAmount;
        await auction.save();
  
        io.emit("newBid", { auctionId, bidAmount, userId });
  
        // Check if this triggers any auto-bids
        await processAutoBids(auctionId, bidAmount, userId, io);
  
        return res.status(201).json({ message: "Bid placed successfully", bid: newBid });
      }
  
      // Handle auto-bid
      if (maxBid) {
        // First, save the user's max bid
        const autoBid = new Bid({
          auctionId,
          userId,
          bidAmount: minRequiredBid,
          maxBid
        });
  
        await autoBid.save();
  
        // Set the current bid to the minimum required
        auction.highestBid = minRequiredBid;
        await auction.save();
  
        io.emit("newBid", { 
          auctionId, 
          bidAmount: minRequiredBid, 
          userId,
          isAutoBid: true 
        });
  
        // Check if this triggers any competing auto-bids
        await processAutoBids(auctionId, minRequiredBid, userId, io);
  
        return res.status(201).json({ 
          message: "Auto-bid placed successfully", 
          bid: autoBid,
          isAutoBid: true
        });
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Helper function to process auto-bids
  async function processAutoBids(auctionId, currentBidAmount, excludingUserId, io) {
    let biddingComplete = false;
    let lastBidAmount = currentBidAmount;
    let lastBidder = excludingUserId;
  
    while (!biddingComplete) {
      // Find the highest competing auto-bid that can beat the current bid
      const competingBid = await Bid.findOne({
        auctionId,
        userId: { $ne: lastBidder },
        maxBid: { $gt: lastBidAmount },
        $or: [
          { bidAmount: { $lt: lastBidAmount } },
          { bidAmount: { $exists: false } }
        ]
      }).sort("-maxBid");
  
      if (!competingBid) {
        biddingComplete = true;
        break;
      }
  
      // Calculate the new bid amount (current bid +1 or up to the max bid)
      const newBidAmount = Math.min(lastBidAmount + 1, competingBid.maxBid);
  
      // Create the new bid
      const newBid = new Bid({
        auctionId,
        userId: competingBid.userId,
        bidAmount: newBidAmount,
        maxBid: competingBid.maxBid
      });
  
      await newBid.save();
  
      // Update auction highest bid
      await Auction.findByIdAndUpdate(auctionId, { highestBid: newBidAmount });
  
      // Notify all clients
      io.emit("newBid", { 
        auctionId, 
        bidAmount: newBidAmount, 
        userId: competingBid.userId,
        isAutoBid: true
      });
  
      // Update for next iteration
      lastBidAmount = newBidAmount;
      lastBidder = competingBid.userId;
  
      // If we've reached the max bid, we're done
      if (newBidAmount >= competingBid.maxBid) {
        biddingComplete = true;
      }
    }
  }

  // Add new endpoint for auto-bid only
  router.post("/:id/auto-bid", authMiddleware, async (req, res) => {
    try {
      const { maxBid } = req.body;
      const auctionId = req.params.id;
      const userId = req.user.id;

      if (!maxBid || maxBid <= 0) {
        return res.status(400).json({ message: "Valid maximum bid amount is required" });
      }

      // Reuse the place-bid logic but with auto-bid focus
      return await router.post("/:id/place-bid").call(this, {
        ...req,
        body: { maxBid }
      }, res);
    } catch (error) {
      console.error("Error setting auto-bid:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.delete("/:id/auto-bid", authMiddleware, async (req, res) => {
    try {
      const auctionId = req.params.id;
      const userId = req.user.id;
  
      // Remove all auto-bids for this user on this auction
      await Bid.deleteMany({ 
        auctionId, 
        userId,
        maxBid: { $exists: true }
      });
  
      // Find new highest bid
      const newHighestBid = await Bid.findOne({ auctionId }).sort("-bidAmount");
      
      if (newHighestBid) {
        await Auction.findByIdAndUpdate(auctionId, {
          highestBid: newHighestBid.bidAmount
        });
      }
  
      io.emit("autoBidCancelled", { auctionId, userId });
      res.json({ message: "Auto-bid cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling auto-bid:", error);
      res.status(500).json({ message: "Server error" });
    }
  });



// Get single auction details
router.get("/:id", async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate("sellerId", "name") // Include seller info
      .lean();

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    // Calculate time remaining
    const now = new Date();
    const endDate = new Date(auction.endDate);
    const timeRemaining = endDate - now;

    res.status(200).json({
      ...auction,
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching auction" });
  }
});

// Get bids for an auction
router.get("/:id/bids", async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.id })
      .populate("userId", "name") // Include bidder info
      .sort("-createdAt")
      .lean();

    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bids" });
  }
});


router.post('/:id/end-auction', authMiddleware, async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const auction = await Auction.findById(req.params.id).session(session);
      if (!auction) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Auction not found' });
      }

      // Verify auction is active
      if (auction.status !== 'active') {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Auction has already ended' });
      }

      // Find the highest bid with transaction
      const winningBid = await Bid.findOne({ auctionId: req.params.id })
        .sort('-bidAmount')
        .populate('userId')
        .session(session);

      if (winningBid) {
        // Update auction with winner info
        auction.winner = winningBid.userId._id;
        auction.winningBid = winningBid._id;
        auction.winningAmount = winningBid.bidAmount;
        auction.status = 'ended_winner';
        auction.highestBid = winningBid.bidAmount;

        // Mark the winning bid
        winningBid.isWinning = true;
        await winningBid.save({ session });

        // Create notification record (if you have notifications)
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

      // Emit real-time events
      io.emit('auctionEnded', { 
        auctionId: auction._id,
        winnerId: winningBid?.userId?._id,
        winningAmount: winningBid?.bidAmount
      });

      if (winningBid?.userId) {
        io.to(winningBid.userId._id.toString()).emit('winnerNotification', {
          auctionId: auction._id,
          title: auction.title,
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
    res.status(500).json({ 
      message: 'Failed to end auction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/:id/winner', authMiddleware, async (req, res) => {
  try {
    // Find auction and deeply populate winner and winning bid with user details
    const auction = await Auction.findById(req.params.id)
      .populate({
        path: 'winner',
        select: 'name email'
      })
      .populate({
        path: 'winningBid',
        populate: {
          path: 'userId',
          select: 'name username'
        }
      });

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Auction not found'
      });
    }

    // Handle expired but active auctions
    if (auction.status === 'active' && new Date() > new Date(auction.endDate)) {
      const highestBid = await Bid.findOne({ auctionId: auction._id })
        .sort({ bidAmount: -1 })
        .populate('userId', 'name username');

      if (highestBid) {
        auction.winner = highestBid.userId._id;
        auction.winningBid = highestBid._id;
        auction.winningAmount = highestBid.bidAmount;
      }

      auction.status = 'ended';
      await auction.save();
    }

    if (auction.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Auction is still active'
      });
    }

    if (!auction.winner) {
      return res.json({
        success: true,
        isWinner: false,
        message: 'Auction ended with no winner'
      });
    }

    const isWinner = auction.winner._id.toString() === req.user._id.toString();

    // Prepare winning bid data with proper user information
    const winningBidData = auction.winningBid ? {
      _id: auction.winningBid._id,
      bidAmount: auction.winningBid.bidAmount,
      userId: {
        _id: auction.winningBid.userId?._id,
        name: auction.winningBid.userId?.name,
        username: auction.winningBid.userId?.username
      }
    } : null;

    return res.json({
      success: true,
      isWinner,
      winningBid: winningBidData,
      paymentStatus: auction.paymentStatus,
      auctionStatus: auction.status
    });

  } catch (error) {
    console.error('Error in winner endpoint:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});






// Complete payment
router.post('/:id/complete-payment', authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Check if user is the winner
    if (!auction.winner || auction.winner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the winner can complete payment' });
    }

    // Check if auction has a winner
    if (auction.status !== 'ended_winner') {
      return res.status(400).json({ message: 'Auction does not have a winner' });
    }

    // Check if already paid
    if (auction.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // In a real app, you would process payment here
    // For demo, we'll just mark as paid
    auction.paymentStatus = 'paid';
    auction.status = 'completed';
    await auction.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get buyer dashboard stats
router.get('/buyer/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Count active bids
    const activeBids = await Bid.countDocuments({
      userId,
      auctionId: {
        $in: (await Auction.find({
          endDate: { $gt: new Date() },
          status: 'active'
        }).distinct('_id'))
      }
    });
    
    // Count total bids
    const totalBids = await Bid.countDocuments({ userId });
    
    // Count won auctions
    const wonAuctions = await Auction.countDocuments({ 
      winner: userId,
      status: { $in: ['ended_winner', 'completed'] }
    });
    
    res.json({
      activeBids,
      totalBids,
      wonAuctions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get buyer's bidding history
// Get buyer's bidding history
// Get buyer's bidding history with proper image URLs
router.get('/buyer/bidding-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const bids = await Bid.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId)
        } 
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'auctions',
          localField: 'auctionId',
          foreignField: '_id',
          as: 'auction'
        }
      },
      { $unwind: '$auction' },
      {
        $project: {
          _id: 1,
          bidAmount: 1,
          createdAt: 1,
          auctionId: '$auction._id',
          itemName: '$auction.title',
          itemImage: {
            $cond: {
              if: { $ne: ['$auction.image', null] },
              then: { $concat: [process.env.BASE_URL || 'http://localhost:3000', '/', '$auction.image'] },
              else: null
            }
          },
          status: {
            $cond: {
              if: { $gt: ['$auction.endDate', new Date()] },
              then: 'active',
              else: 'ended'
            }
          },
          // Additional useful fields
          endDate: '$auction.endDate',
          currentHighestBid: '$auction.highestBid',
          isWinner: {
            $eq: [
              { $toString: '$auction.winner' },
              userId
            ]
          }
        }
      }
    ]);

    res.json(bids);
  } catch (error) {
    console.error("Error in bidding history:", error);
    res.status(500).json({ 
      message: "Error fetching bidding history",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// Get buyer's winning bids
router.get('/buyer/winning-bids', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const winningBids = await Auction.aggregate([
      { 
        $match: { 
          winner: new mongoose.Types.ObjectId(userId),
          status: { $in: ['ended_winner', 'completed'] },
          winner: { $exists: true, $ne: null } // Double check winner exists
        }
      },
      { $sort: { endDate: -1 } },
      {
        $lookup: {
          from: 'bids',
          let: { winningBidId: '$winningBid' },
          pipeline: [
            { 
              $match: {
                $expr: { $eq: ['$_id', '$$winningBidId'] }
              }
            },
            {
              $project: {
                _id: 1,
                bidAmount: 1,
                createdAt: 1
              }
            }
          ],
          as: 'winningBidData'
        }
      },
      { $unwind: '$winningBidData' },
      {
        $lookup: {
          from: 'users',
          localField: 'sellerId',
          foreignField: '_id',
          as: 'sellerData'
        }
      },
      { $unwind: '$sellerData' },
      {
        $project: {
          _id: 1,
          itemName: '$title',
          itemDescription: '$description',
          itemImage: {
            $cond: {
              if: { $ne: ['$image', null] },
              then: { 
                $concat: [
                  process.env.BASE_URL || 'http://localhost:3000', 
                  '/', 
                  { $substrCP: ['$image', { $indexOfCP: ['$image', 'uploads/'] }, { $strLenCP: ['$image'] }] }
                ]
              },
              else: null
            }
          },
          auctionId: '$_id',
          winningAmount: '$winningBidData.bidAmount',
          originalPrice: '$startingBid',
          wonAt: '$endDate',
          paymentStatus: 1,
          sellerName: '$sellerData.name',
          sellerId: '$sellerData._id',
          bidCount: { $size: '$bids' } // If you have bids array
        }
      }
    ]);

    console.log('Winning bids query results:', winningBids);
    res.json(winningBids);
  } catch (error) {
    console.error("Error fetching winning bids:", error);
    res.status(500).json({ 
      message: "Failed to load winning bids",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Get featured auctions (active, limited to 3)
router.get("/featured/active", async (req, res) => {
  try {
    const featuredAuctions = await Auction.find({
      status: "active",
      endDate: { $gt: new Date() }
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Ensure we always return an array, even if empty
    const data = featuredAuctions.length > 0 ? featuredAuctions : [];

    // Format the response
    const formattedAuctions = data.map((auction) => ({
      id: auction._id,
      title: auction.title,
      bid: `$${auction.highestBid || auction.startingBid}`,
      image: auction.image 
        ? `${process.env.BASE_URL || "http://localhost:3000"}/${auction.image}`
        : "https://source.unsplash.com/random/300x200/?auction",
      timeLeft: formatTimeLeft(auction.endDate),
      index: 0 // Will be set in component
    }));

    res.status(200).json({
      success: true,
      auctions: formattedAuctions
    });
  } catch (error) {
    console.error("Error fetching featured auctions:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching featured auctions",
     
    });
  }
});

function formatTimeLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  
  if (diff <= 0) return "Ended";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}








router.post('/predict-bid', async (req, res) => {
  try {
    const { openbid, bidderrate, bidtime_days } = req.body;
    
    if (!openbid || !bidderrate || !bidtime_days) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const prediction = await predictBid(openbid, bidderrate, bidtime_days);
    res.json({ predictedBid: prediction });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

  return router;
};
  