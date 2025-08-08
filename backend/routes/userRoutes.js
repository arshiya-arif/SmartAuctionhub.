const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Review = require("../models/Review"); // Make sure to import Review model

// Get user by ID with seller stats
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -otp -cnic")
      .lean(); // Convert to plain JavaScript object
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only calculate stats if user is a seller
    if (user.role === 'seller') {
      const reviews = await Review.find({ sellerId: req.params.id });
      
      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      const totalSales = 0; 

      // Add seller stats to the response
      user.sellerStats = {
        averageRating,
        reviewCount: reviews.length,
        totalSales
      };
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;