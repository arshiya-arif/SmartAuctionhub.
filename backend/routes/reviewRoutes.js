const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/authMiddleware");

// Post a review
router.post("/", auth, reviewController.createReview);

// Get reviews for a seller
router.get("/seller/:sellerId", reviewController.getSellerReviews);

// Get reviews for an auction
router.get("/auction/:auctionId", reviewController.getAuctionReviews);
// Get average seller rating
router.get('/seller/:sellerId/average', async (req, res) => {
  try {
    const result = await Review.aggregate([
      { $match: { sellerId: req.params.sellerId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" } } }
    ]);
    
    res.json({ 
      averageRating: result[0]?.averageRating || 0 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;