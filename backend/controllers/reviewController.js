const Review = require("../models/Review");
const Auction = require("../models/Auction");
const User = require("../models/User");

// Update seller stats helper function
const updateSellerStats = async (sellerId) => {
  try {
    const reviews = await Review.aggregate([
      { $match: { sellerId: sellerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const sales = await Auction.aggregate([
      { 
        $match: { 
          sellerId: sellerId,
          status: 'completed',
          paymentStatus: 'paid'
        } 
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$winningAmount" }
        }
      }
    ]);

    await User.findByIdAndUpdate(sellerId, {
      $set: {
        "sellerStats.averageRating": reviews[0]?.averageRating || 0,
        "sellerStats.reviewCount": reviews[0]?.reviewCount || 0,
        "sellerStats.totalSales": sales[0]?.totalSales || 0
      }
    });
  } catch (err) {
    console.error("Error updating seller stats:", err);
  }
};

exports.createReview = async (req, res) => {
  try {
    const { auctionId, rating, title, comment } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const review = new Review({
      auctionId,
      reviewerId: req.user._id,
      sellerId: auction.sellerId,
      rating,
      title,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ sellerId: req.params.sellerId })
      .populate("reviewerId", "name")
      .populate("auctionId", "title");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAuctionReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ auctionId: req.params.auctionId })
      .populate("reviewerId", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};