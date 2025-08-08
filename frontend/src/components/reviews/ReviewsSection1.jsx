import { FaStar } from "react-icons/fa";

const ReviewsSection1 = ({ reviews, averageRating }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold mb-4">Seller Reviews</h3>
        <p className="text-gray-500 italic">No reviews yet</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-bold mb-4">Seller Reviews</h3>
      
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="ml-2 text-gray-600">
            {averageRating.toFixed(1)} ({reviews.length} reviews)
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4">
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="font-medium">{review.reviewer?.name || 'Anonymous'}</p>
            </div>
            {review.comment && <p className="text-gray-700">{review.comment}</p>}
            <p className="text-sm text-gray-500 mt-1">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection1;