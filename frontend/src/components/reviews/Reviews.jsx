import { useState, useEffect } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const Reviews = ({ sellerId, auctionId, currentUserId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: ""
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch reviews and check if user has reviewed
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/api/reviews/auction/${auctionId}`);
        setReviews(res.data);

        // Check if current user has already reviewed
        if (currentUserId) {
          const userReviewed = res.data.some(review => 
            (review.reviewerId?._id || review.reviewerId) === currentUserId
          );
          setHasReviewed(userReviewed);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) fetchReviews();
  }, [auctionId, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login to submit a review");
        return;
      }

      if (hasReviewed) {
        setError("You can only submit one review per auction");
        return;
      }

      const res = await axios.post(
        "http://localhost:3000/api/reviews",
        {
          auctionId,
          sellerId,
          ...formData
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      // Update reviews and mark as reviewed
      setReviews([res.data, ...reviews]);
      setHasReviewed(true);
      setFormData({ rating: 5, title: "", comment: "" });
      setError(null);
    } catch (err) {
      if (err.response?.data?.code === 11000) {
        setError("You've already reviewed this auction");
        setHasReviewed(true);
      } else {
        setError(err.response?.data?.message || "Failed to submit review");
      }
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Review Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-3">Write Your Review</h3>
        <form onSubmit={handleSubmit}>
          <div className="flex mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData({...formData, rating: star})}
                className="text-2xl mr-1 focus:outline-none"
              >
                <FaStar 
                  className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"} 
                />
              </button>
            ))}
          </div>
          
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 mb-3 border rounded"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          
          <textarea
            placeholder="Your review..."
            className="w-full p-2 mb-3 border rounded"
            rows="3"
            value={formData.comment}
            onChange={(e) => setFormData({...formData, comment: e.target.value})}
            required
          />
          
          <button
            type="submit"
            disabled={!isAuthenticated || hasReviewed}
            className={`px-4 py-2 rounded ${
              isAuthenticated && !hasReviewed
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {!isAuthenticated ? "Login to Review" :
             hasReviewed ? "Already Reviewed" : 
             "Submit Review"}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      {loading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review._id} className="border-b pb-4">
              <div className="flex items-center mb-1">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                  ))}
                </div>
                <h4 className="font-medium">{review.title}</h4>
              </div>
              <p className="text-gray-700 mb-1">{review.comment}</p>
              <p className="text-sm text-gray-500">
                By {review.reviewerId?.name || "Anonymous"} • {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;