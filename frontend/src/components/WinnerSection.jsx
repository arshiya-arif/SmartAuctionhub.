import { FaCheckCircle } from "react-icons/fa";

const WinnerSection = ({ 
  isWinner, 
  paymentStatus, 
  winningAmount, 
  onPay, 
  onReview 
}) => {
  if (!isWinner) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-white mb-4 md:mb-0">
          <h3 className="text-xl font-bold mb-2">🎉 Congratulations! You won this auction!</h3>
          <p className="text-green-100">
            Final Price: <span className="font-bold text-white">${winningAmount}</span>
          </p>
          {paymentStatus === 'paid' ? (
            <p className="mt-2 text-green-200 flex items-center">
              <FaCheckCircle className="mr-1" /> Payment completed successfully!
            </p>
          ) : (
            <p className="mt-2 text-green-200">Please complete your payment to claim your item.</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          {paymentStatus !== 'paid' && (
            <button
              onClick={onPay}
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold shadow-md transition-all"
            >
              Pay Now
            </button>
          )}
          {paymentStatus === 'paid' && (
            <button
              onClick={onReview}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all"
            >
              Leave Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerSection;