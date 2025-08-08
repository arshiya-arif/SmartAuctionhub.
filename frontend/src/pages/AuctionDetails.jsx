
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Reviews from "../components/reviews/Reviews";
import BidPrediction from "../components/BidPrediction";
import SellerInfo from "../components/reviews/SellerInfo";
import { 
  FaClock, 
  FaMoneyBillAlt, 
  FaUser, 
  FaHistory, 
  FaChevronDown, 
  FaChevronUp, 
  FaTrophy, 
  FaCreditCard, 
  FaBell,
  FaStar,
  FaGavel,
  FaHeart,
  FaShareAlt,
  FaInfoCircle
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";


const stripePromise = loadStripe('pk_test_51RKxnUCEh2pcLN9xtooYDgE2oTrT75Hn3Qk0ax9AWKQ9HaMVmW8z0xSJxWy9gq7E0WG3Kwmn38xfNs0fYxYprqk500guTJg0TJ');
const socket = io("http://localhost:3000");

const StripeCheckoutForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required'
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg w-full mt-4"
      >
        {loading ? 'Processing...' : 'Complete Payment'}
      </button>
    </form>
  );
};

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [maxAutoBid, setMaxAutoBid] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({});
  const [autoBidActive, setAutoBidActive] = useState(false);
  const [autoBidMax, setAutoBidMax] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [winningBid, setWinningBid] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const timerRef = useRef(null);

  // Check for auto-bid status on component mount
  useEffect(() => {
    const storedAutoBid = localStorage.getItem(`autoBid_${id}`);
    if (storedAutoBid === "true") setAutoBidActive(true);
  }, [id]);

  // Calculate time remaining
  const calculateTimeLeft = (endDate) => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) return { ended: true };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      ended: false
    };
  };

  // Fetch auction data
  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [auctionRes, bidsRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/auctions/${id}`, { headers }),
        axios.get(`http://localhost:3000/api/auctions/${id}/bids`, { headers })
      ]);

      const updatedAuction = auctionRes.data;
      setAuction(updatedAuction);
      setBids(bidsRes.data);
      
      const newTimeLeft = calculateTimeLeft(updatedAuction.endDate);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.ended || updatedAuction.status !== 'active') {
        try {
          const winnerRes = await axios.get(
            `http://localhost:3000/api/auctions/${id}/winner`,
            { headers }
          );
          
          if (winnerRes.data.success) {
            const winnerInfo = winnerRes.data;
            
            setIsWinner(winnerInfo.isWinner);
            setPaymentDone(winnerInfo.paymentStatus === 'paid');
            
            // Ensure winning bid has proper user data
            const winningBidWithUser = {
              ...winnerInfo.winningBid,
              displayName: getDisplayName(winnerInfo.winningBid)
            };
            
            setWinningBid(winningBidWithUser);

            if (winnerInfo.isWinner && !localStorage.getItem(`notified_${id}`)) {
              setNotificationMessage(
                `You won ${updatedAuction.title} with $${winnerInfo.winningBid?.bidAmount || updatedAuction.highestBid}!`
              );
              setShowNotification(true);
              localStorage.setItem(`notified_${id}`, "true");
            }
          } else {
            console.log("Winner API returned unsuccessful:", winnerRes.data.message);
            fallbackWinnerCheck(updatedAuction, bidsRes.data);
          }
        } catch (err) {
          console.log("Error checking winner:", err.response?.data || err.message);
          fallbackWinnerCheck(updatedAuction, bidsRes.data);
        }
      }

      const userId = localStorage.getItem("userId");
      if (userId) {
        const userAutoBid = bidsRes.data.find(bid => 
          (bid.userId?._id === userId || bid.userId === userId) && bid.maxBid
        );
        if (userAutoBid) {
          setAutoBidActive(true);
          setAutoBidMax(userAutoBid.maxBid);
          localStorage.setItem(`autoBid_${id}`, "true");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get display name from bid
  const getDisplayName = (bid) => {
    if (!bid || !bid.userId) return 'Anonymous';
    
    // If userId is populated with user object
    if (bid.userId.name) return bid.userId.name;
    if (bid.userId.username) return bid.userId.username;
    
    // If userId is just an ID string
    if (typeof bid.userId === 'string') return `User ${bid.userId.substring(0, 6)}`;
    
    return 'Anonymous';
  };

  // Fallback winner determination
  const fallbackWinnerCheck = (auction, bids) => {
    if (bids.length > 0) {
      const highestBid = bids.reduce((max, bid) => 
        bid.bidAmount > max.bidAmount ? bid : max, bids[0]);
      
      const bidUserId = highestBid.userId?._id || highestBid.userId;
      const currentUserId = localStorage.getItem("userId");
      const isWinner = bidUserId === currentUserId;
      
      setIsWinner(isWinner);
      setPaymentDone(auction.paymentStatus === 'paid');
      
      // Ensure winning bid has proper display name
      setWinningBid({
        ...highestBid,
        displayName: getDisplayName(highestBid)
      });

      if (isWinner && !localStorage.getItem(`notified_${id}`)) {
        setNotificationMessage(`You won ${auction.title} with $${highestBid.bidAmount}!`);
        setShowNotification(true);
        localStorage.setItem(`notified_${id}`, "true");
      }
    }
  };

  // Initialize payment
  const initiatePayment = async () => {
    try {
      setPaymentError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to make payment");
      }

      const { data } = await axios.post(
        `http://localhost:3000/api/payments/create-payment-intent`,
        { auctionId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.message || "Failed to initiate payment");
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setPaymentDone(true);
    setClientSecret(null);
    fetchAuctionData();
  };

  // Place bid function
  const placeBid = async (type) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to bid!");
      return;
    }

    try {
      setError(null);
      const payload = type === "manual" 
        ? { bidAmount: parseFloat(bidAmount) }
        : { maxBid: parseFloat(maxAutoBid) };

      await axios.post(
        `http://localhost:3000/api/auctions/${id}/place-bid`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (type === "auto") {
        setAutoBidActive(true);
        setAutoBidMax(payload.maxBid);
        localStorage.setItem(`autoBid_${id}`, "true");
      }

      setBidAmount("");
      setMaxAutoBid("");
      fetchAuctionData();
    } catch (err) {
      console.error("Bid error:", err);
      setError(err.response?.data?.message || "Failed to place bid");
    }
  };

  // Cancel auto bid
  const cancelAutoBid = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to cancel auto-bid!");
        return;
      }

      await axios.delete(
        `http://localhost:3000/api/auctions/${id}/auto-bid`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAutoBidActive(false);
      setAutoBidMax(null);
      localStorage.removeItem(`autoBid_${id}`);
      fetchAuctionData();
    } catch (err) {
      console.error("Cancel auto-bid error:", err);
      setError(err.response?.data?.message || "Failed to cancel auto-bid");
    }
  };

  // Timer effect
  useEffect(() => {
    if (!auction?.endDate) return;

    const updateTimer = () => {
      setTimeLeft(prev => {
        const newTimeLeft = calculateTimeLeft(auction.endDate);
        
        if (!prev.ended && newTimeLeft.ended) {
          fetchAuctionData();
        }
        
        return newTimeLeft;
      });
    };

    timerRef.current = setInterval(updateTimer, 1000);
    return () => clearInterval(timerRef.current);
  }, [auction?.endDate]);

  // Initialize component
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setCurrentUserId(userId);
    
    if (!id) return;
    
    fetchAuctionData();

    socket.on("newBid", (data) => {
      if (data.auctionId === id) fetchAuctionData();
    });

    socket.on("auctionEnded", (data) => {
      if (data.auctionId === id) fetchAuctionData();
    });

    socket.on("winnerNotification", (data) => {
      if (data.auctionId === id && data.userId === userId) {
        setNotificationMessage(`You won ${auction?.title} with $${data.winningAmount}!`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 10000);
      }
    });

    return () => {
      socket.off("newBid");
      socket.off("auctionEnded");
      socket.off("winnerNotification");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id, auction?.title]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-2xl">Loading auction details...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-xl mb-4">{error}</div>
      <button 
        onClick={fetchAuctionData}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium"
      >
        Retry
      </button>
    </div>
  );

  if (!auction) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-2xl">Auction not found</div>
    </div>
  );

  const minimumBid = auction.highestBid ? auction.highestBid + 1 : auction.startingBid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg shadow-xl z-50 max-w-md w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaBell className="mr-3 text-yellow-300 animate-pulse" size={20} />
                <div>
                  <h3 className="font-bold">You Won! 🎉</h3>
                  <p>{notificationMessage}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-4 text-white hover:text-yellow-200 text-xl"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 max-w-7xl">
        {/* Main Auction Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100"
        >
          {/* Auction Header with Gradient */}
          <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-white"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">{auction.title}</h1>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                      {auction.category}
                    </span>
                    <button className="text-white/80 hover:text-white">
                      <FaHeart className="text-pink-400" />
                    </button>
                    <button className="text-white/80 hover:text-white">
                      <FaShareAlt />
                    </button>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                  <FaGavel className="mr-2 text-yellow-300" />
                  <span className="font-medium">
                    {timeLeft.ended ? 'Auction Ended' : 'Live Auction'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:flex">
            {/* Left Column - Image */}
            <div className="md:w-1/2 p-6">
              <div className="relative h-96 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={`http://localhost:3000/${auction.image.replace(/\\/g, "/")}`}
                  alt={auction.title}
                  className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                  onError={(e) => e.target.src = "https://via.placeholder.com/500"}
                />
                {timeLeft.ended && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                      Auction Ended
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-600" />
                  Description
                </h2>
                <p className="text-gray-700">{auction.description}</p>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="md:w-1/2 p-6">
              {/* Auction Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm"
                >
                  <div className="flex items-center text-indigo-600 mb-1">
                    <FaMoneyBillAlt className="mr-2" />
                    <span className="font-medium">Current Bid</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">
                    ${auction.highestBid || auction.startingBid}
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm"
                >
                  <div className="flex items-center text-indigo-600 mb-1">
                    <FaClock className="mr-2" />
                    <span className="font-medium">Time Left</span>
                  </div>
                  {timeLeft.ended ? (
                    <div className="text-xl font-bold text-red-600">Ended</div>
                  ) : (
                    <div className="text-xl font-bold text-gray-800">
                      {timeLeft.days > 0 && `${timeLeft.days}d `}
                      {timeLeft.hours > 0 && `${timeLeft.hours}h `}
                      {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
                      {timeLeft.seconds > 0 && `${timeLeft.seconds}s`}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Auto-bid Status */}
              {autoBidActive && !timeLeft.ended && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl p-4 mb-6 border border-blue-200 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-bold text-blue-800 flex items-center">
                        <FaStar className="mr-2 text-yellow-400" />
                        Your auto-bid is active
                      </p>
                      <p className="text-blue-600">
                        {autoBidMax ? `Max bid: $${autoBidMax}` : `Auto-bidding active`}
                      </p>
                    </div>
                    <button
                      onClick={cancelAutoBid}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium border border-blue-200 shadow-sm"
                    >
                      Cancel Auto-Bid
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Bid Forms or Winner/Payment Section */}
              {timeLeft.ended ? (
                isWinner ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200 shadow-lg mb-8"
                  >
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-800 p-3 rounded-full mb-3">
                        <FaTrophy className="text-2xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-yellow-800 mb-2">Congratulations! You Won! 🎉</h3>
                      <p className="text-lg text-yellow-700 mb-1">
                        Your winning bid: <span className="font-bold">${winningBid?.bidAmount}</span>
                      </p>
                      <p className="text-yellow-600">Complete your payment to claim your item</p>
                    </div>
                    
                    {!paymentDone ? (
                      clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                          <StripeCheckoutForm 
                            onSuccess={handlePaymentSuccess}
                            onError={setPaymentError}
                          />
                        </Elements>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={initiatePayment}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg w-full flex items-center justify-center"
                        >
                          <FaCreditCard className="mr-2" />
                          Pay Now
                        </motion.button>
                      )
                    ) : (
                      <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-medium border border-green-200">
                        ✅ Payment completed! Seller will contact you soon.
                      </div>
                    )}
                    
                    {paymentError && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded"
                      >
                        <p>{paymentError}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
                    <div className="flex items-center justify-center">
                      <div className="bg-yellow-100 p-2 rounded-full mr-3">
                        <FaTrophy className="text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Auction Winner</h3>
                        <p className="text-gray-700">
                          {winningBid?.displayName || 
                           winningBid?.userId?.name || 
                           winningBid?.userId?.username || 
                           (winningBid?.userId ? `User ${winningBid.userId.substring(0, 6)}` : 'Anonymous')} 
                          won with ${winningBid?.bidAmount}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="space-y-4 mb-8">
                   {/* Add BidPrediction here */}
    {/* <BidPrediction 
      auction={{
        startingPrice: auction.startingBid,
        endTime: new Date(auction.endDate).getTime(),
        currentBid: auction.highestBid || auction.startingBid
      }}
      sellerId={auction.sellerId} // Pass sellerId but it won't be displayed
    /> */}
<BidPrediction 
  auction={{
    startingPrice: auction.startingBid,
    endTime: auction.endDate,  // Just pass the date string, let component handle conversion
  }}
  currentBid={auction.highestBid}  // Pass current bid separately (can be null/undefined)
  sellerId={auction.sellerId}
/>


                  <motion.div 
                    whileHover={{ y: -2 }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`Enter bid (min $${minimumBid})`}
                      className="flex-grow border border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min={minimumBid}
                      step="1"
                    />
                    <button
                      onClick={() => placeBid("manual")}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
                    >
                      Place Bid
                    </button>
                  </motion.div>

                  {!autoBidActive && (
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <input
                        type="number"
                        value={maxAutoBid}
                        onChange={(e) => setMaxAutoBid(e.target.value)}
                        placeholder={`Set max auto-bid (min $${minimumBid})`}
                        className="flex-grow border border-indigo-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        min={minimumBid}
                        step="1"
                      />
                      <button
                        onClick={() => placeBid("auto")}
                        className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-md"
                      >
                        Set Auto-Bid
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
                >
                  <p>{error}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bid History */}
          <div className="p-6 border-t border-gray-200">
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex items-center cursor-pointer mb-2"
              onClick={() => setShowBidHistory(!showBidHistory)}
            >
              <h2 className="text-xl font-semibold flex items-center">
                <FaHistory className="mr-2 text-indigo-600" />
                Bid History ({bids.length})
              </h2>
              {showBidHistory ? (
                <FaChevronUp className="ml-2 text-indigo-600" />
              ) : (
                <FaChevronDown className="ml-2 text-indigo-600" />
              )}
            </motion.div>
            
            <AnimatePresence>
              {showBidHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    {bids.length > 0 ? (
                      bids.map((bid, index) => {
                        const isCurrentUser = bid.userId?._id === currentUserId || bid.userId === currentUserId;
                        const isWinningBid = winningBid && 
                          ((winningBid._id === bid._id) || 
                           (winningBid.bidAmount === bid.bidAmount && 
                            (winningBid.userId === (bid.userId?._id || bid.userId))));
                        
                        return (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 border-b flex justify-between items-center ${
                              isCurrentUser ? "bg-indigo-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`p-2 rounded-full mr-3 ${
                                isCurrentUser ? "bg-indigo-100" : "bg-gray-100"
                              }`}>
                                <FaUser className={isCurrentUser ? "text-indigo-600" : "text-gray-600"} />
                              </div>
                              <div>
                                <p className={`font-medium ${isCurrentUser ? "text-indigo-600" : "text-gray-800"}`}>
                                  {isCurrentUser ? "You" : bid.userId?.name || bid.userId?.username || `User ${(bid.userId?._id || bid.userId || "").substring(0, 6)}`}
                                  {isWinningBid && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                                      Winner
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(bid.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${isCurrentUser ? "text-indigo-600" : "text-gray-800"}`}>
                                ${bid.bidAmount}
                              </p>
                              {isCurrentUser && bid.maxBid && (
                                <p className="text-xs text-blue-600">Auto-bid (max: ${bid.maxBid})</p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500 italic">
                        No bids yet. Be the first to bid!
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Seller Info Section */}
          <div className="p-6 border-t border-gray-200">
            <SellerInfo sellerId={auction.sellerId} />
          </div>

          {/* Reviews Section */}
          <div className="p-6 border-t border-gray-200">
            <Reviews 
              sellerId={auction.sellerId} 
              auctionId={auction._id}
              currentUserId={currentUserId}
            />
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuctionDetails;






