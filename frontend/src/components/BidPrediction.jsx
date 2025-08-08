
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CircularProgress, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const BidPrediction = ({ auction, sellerId, currentBid }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sellerRating, setSellerRating] = useState(3);
  const previousBidRef = useRef(null);

  useEffect(() => {
    const fetchSellerRating = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/reviews/seller/${sellerId}/average`);
        setSellerRating(response.data.averageRating || 3);
      } catch (err) {
        console.error("Using default rating");
        setSellerRating(3);
      }
    };

    if (sellerId) fetchSellerRating();
  }, [sellerId]);


  useEffect(() => {

    if (currentBid !== previousBidRef.current) {
      previousBidRef.current = currentBid;
      fetchPrediction();
    }
  }, [currentBid, auction?.startingPrice, auction?.endTime, sellerRating]);

  const fetchPrediction = async () => {
    if (!auction || !sellerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      
      const basePrice = currentBid !== undefined && currentBid !== null 
        ? parseFloat(currentBid) 
        : parseFloat(auction.startingPrice);
      
      const timeRemainingDays = (new Date(auction.endTime) - Date.now()) / (1000 * 60 * 60 * 24);

      const response = await axios.post('http://localhost:3000/api/auctions/predict-bid', {
        openbid: basePrice, 
        bidderrate: sellerRating,
        bidtime_days: timeRemainingDays
      });

     
      const finalPrediction = Math.max(
        parseFloat(response.data.predictedBid),
        basePrice
      );

      setPrediction(finalPrediction);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePrediction = () => {
    if (prediction && window.confirm(`Set your bid to $${prediction.toFixed(2)}?`)) {
      console.log(`Bid set to: $${prediction.toFixed(2)}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200 my-5">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 m-0">Smart Bid Prediction</h3>
        <Tooltip title="Suggested bid based on current market conditions">
          <IconButton size="small" className="ml-2">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2.5 text-gray-600">
          <CircularProgress size={24} />
          <span>Calculating...</span>
        </div>
      ) : error ? (
        <div className="text-red-700 bg-red-50 px-3 py-2 rounded-md text-sm">
          ⚠️ {error}
        </div>
      ) : prediction ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Current {currentBid ? 'Bid' : 'Starting Price'}:</span>
            <span className="font-medium">
              ${currentBid ? parseFloat(currentBid).toFixed(2) : parseFloat(auction.startingPrice).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Suggested Bid:</span>
            <span className="text-2xl font-bold text-green-800">
              ${prediction.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={handleUsePrediction}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
          >
            Use This Bid
          </button>
        </>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No prediction available
        </div>
      )}
    </div>
  );
};

export default BidPrediction;

