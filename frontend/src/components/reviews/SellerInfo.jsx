import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaRegStar, FaStarHalfAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

const SellerInfo = ({ sellerId, refreshTrigger }) => {
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        
        // Fetch both seller info and their reviews
        const [sellerRes, reviewsRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/users/${sellerId}`),
          axios.get(`http://localhost:3000/api/reviews/seller/${sellerId}`)
        ]);

        const sellerData = {
          ...sellerRes.data,
          sellerStats: sellerRes.data.sellerStats || {
            averageRating: 0,
            reviewCount: 0,
            totalSales: 0
          }
        };

        setSeller(sellerData);
        setReviews(reviewsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load seller info");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [sellerId, refreshTrigger]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400 inline" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 inline" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 inline" />);
      }
    }
    
    return stars;
  };

  if (loading) return <div className="text-center py-4">Loading seller info...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!seller) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Seller Information</h2>
      
      {/* Seller Basic Info */}
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 rounded-full p-3 mr-4">
          <span className="text-purple-600 font-bold text-xl">
            {seller.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-bold">{seller.name}</h3>
          <p className="text-gray-600">Member since {new Date(seller.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Seller Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 mb-1">Rating</div>
          <div className="text-2xl font-bold">
            {seller.sellerStats.averageRating.toFixed(1)}
            <span className="text-sm text-gray-500 ml-1">/ 5</span>
          </div>
          <div className="mt-1">
            {seller.sellerStats.reviewCount > 0 
              ? renderStars(seller.sellerStats.averageRating) 
              : "No ratings yet"}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 mb-1">Reviews</div>
          <div className="text-2xl font-bold">
            {seller.sellerStats.reviewCount}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-gray-600 mb-1">Items Sold</div>
          <div className="text-2xl font-bold">
            ${seller.sellerStats.totalSales.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Seller Reviews Section */}
      <div className="border-t pt-4">
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => setShowAllReviews(!showAllReviews)}
        >
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {showAllReviews ? <FaChevronUp /> : <FaChevronDown />}
        </div>

        {showAllReviews && (
          <div className="space-y-4 mt-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500">No reviews yet for this seller</p>
            ) : (
              reviews.map(review => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"} 
                        />
                      ))}
                    </div>
                    <h4 className="font-medium">{review.title}</h4>
                  </div>
                  <p className="text-gray-700 mb-1">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    From auction: {review.auctionId?.title || "Unknown Auction"} • 
                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerInfo;