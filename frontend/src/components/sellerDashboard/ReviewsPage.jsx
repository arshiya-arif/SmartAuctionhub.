import React from "react";
import { FaStar } from "react-icons/fa";

const ReviewsPage = () => {
  const reviewsData = [
    { id: 1, buyer: "John Doe", rating: 5, comment: "Great product, fast delivery!" },
    { id: 2, buyer: "Jane Smith", rating: 4, comment: "Good quality, but a bit late." },
    { id: 3, buyer: "Alice Johnson", rating: 5, comment: "Excellent service!" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Reviews</h2>
      <div className="space-y-4">
        {reviewsData.map((review) => (
          <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="text-yellow-500 flex">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <span className="text-sm text-gray-700">{review.buyer}</span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;