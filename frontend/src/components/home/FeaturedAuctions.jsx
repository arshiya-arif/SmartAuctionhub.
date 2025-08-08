
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFire, FaArrowRight, FaExclamationTriangle, FaWifi, FaCalendarTimes } from "react-icons/fa";
import AuctionCard from "../home/AuctionCard";
import axios from "axios";

const FeaturedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    error: null,
    usingFallback: false
  });

  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchFeaturedAuctions = async () => {
      if (!navigator.onLine) {
        setNetworkStatus({
          isOnline: false,
          error: "You're currently offline",
          usingFallback: false
        });
        setAuctions([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/auctions/featured/active", {
          timeout: 5000
        });

        if (response.data?.success && response.data?.auctions?.length > 0) {
          setAuctions(response.data.auctions.map((auction, index) => ({
            ...auction,
            index
          })));
          setNetworkStatus({
            isOnline: true,
            error: null,
            usingFallback: false
          });
        } else {
          setAuctions([]);
          setNetworkStatus({
            isOnline: true,
            error: "No active auctions currently available",
            usingFallback: false
          });
        }
      } catch (err) {
        console.error("API Error:", err);
        setAuctions([]);
        setNetworkStatus({
          isOnline: navigator.onLine,
          error: err.message.includes("Network Error") 
            ? "Couldn't connect to server" 
            : "No active auctions available",
          usingFallback: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAuctions();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.section 
      className="relative w-full py-20 px-6 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Container */}
      <motion.div
        className="relative bg-gray-100 shadow-sm border border-gray-100 rounded-lg overflow-hidden max-w-7xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        {/* Content Container */}
        <div className="relative z-10 p-8 md:p-12">
          <HeaderSection 
            isEmpty={auctions.length === 0} 
            networkStatus={networkStatus} 
          />
          
          {auctions.length > 0 ? (
            <AuctionGrid auctions={auctions} />
          ) : (
            <NoAuctionsMessage networkStatus={networkStatus} />
          )}
          
          <ViewAllButton isEmpty={auctions.length === 0} />
        </div>
      </motion.div>
    </motion.section>
  );
};

const NoAuctionsMessage = ({ networkStatus }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.3 }}
  >
    <motion.div
      className="bg-indigo-50 p-6 rounded-full mb-6"
      animate={{ 
        rotate: [0, 5, -5, 0],
        scale: [1, 1.05, 1]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3
      }}
    >
      <FaCalendarTimes className="text-indigo-500 text-4xl" />
    </motion.div>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      {networkStatus.isOnline ? "No Active Auctions" : "Offline Mode"}
    </h3>
    <p className="text-gray-600 max-w-md text-center mb-6">
      {networkStatus.isOnline 
        ? "There are currently no live auctions. Please check back later."
        : "You're currently offline. Connect to the internet to view live auctions."}
    </p>
    <NetworkAlert networkStatus={networkStatus} />
  </motion.div>
);

const LoadingSkeleton = () => (
  <motion.section 
    className="relative w-full py-20 px-6 bg-gray-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      className="relative bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden max-w-7xl mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8 md:p-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-4 mx-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaFire className="mr-2 text-indigo-500" />
            LOADING LIVE AUCTIONS
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 rounded-lg p-4 h-96"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="bg-gray-200 h-48 rounded-md mb-4 animate-pulse"></div>
                <div className="bg-gray-200 h-6 rounded-md mb-2 w-3/4 animate-pulse"></div>
                <div className="bg-gray-200 h-4 rounded-md mb-2 w-1/2 animate-pulse"></div>
                <div className="bg-gray-300 h-10 rounded-md animate-pulse"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  </motion.section>
);

const HeaderSection = ({ isEmpty, networkStatus }) => (
  <motion.div
    initial={{ opacity: 0, y: -30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, type: "spring" }}
    viewport={{ once: true }}
    className="text-center mb-12"
  >
    <motion.div
      className="inline-flex items-center bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-medium mb-4 mx-auto"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <FaFire className="mr-2 text-indigo-500" />
      </motion.span>
      {isEmpty ? "NO LIVE AUCTIONS" : "TRENDING NOW"}
    </motion.div>
    
    <motion.h2 
      className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-800"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      viewport={{ once: true }}
    >
      Featured <motion.span 
        className="text-indigo-500"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 10,
          delay: 0.3
        }}
      >Live</motion.span> Auctions
    </motion.h2>
    
    {isEmpty ? (
      <motion.p 
        className="text-lg text-gray-500 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
      >
        {networkStatus.isOnline 
          ? "Check back soon for new auctions!" 
          : "Connect to the internet to view live auctions"}
      </motion.p>
    ) : (
      <motion.p 
        className="text-lg text-gray-500 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
      >
        Bid on these exclusive items before time runs out!
      </motion.p>
    )}
  </motion.div>
);

const NetworkAlert = ({ networkStatus }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5, type: "spring" }}
    className={`mt-4 p-3 rounded-md inline-block ${
      networkStatus.isOnline 
        ? "bg-yellow-50 border-l-4 border-yellow-300" 
        : "bg-red-50 border-l-4 border-red-300"
    }`}
  >
    <div className="flex items-start">
      <motion.div 
        className="flex-shrink-0"
        animate={{ 
          rotate: networkStatus.isOnline ? [0, -10, 10, 0] : [0, 0],
          scale: networkStatus.isOnline ? [1, 1.1, 1] : [1, 1]
        }}
        transition={{ 
          duration: 0.6,
          repeat: networkStatus.isOnline ? Infinity : 0,
          repeatDelay: 3
        }}
      >
        {networkStatus.isOnline ? (
          <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        ) : (
          <FaWifi className="h-5 w-5 text-red-400" />
        )}
      </motion.div>
      <div className="ml-3">
        <p className={`text-sm ${
          networkStatus.isOnline ? "text-yellow-600" : "text-red-600"
        }`}>
          {networkStatus.error}
        </p>
      </div>
    </div>
  </motion.div>
);

const AuctionGrid = ({ auctions }) => (
  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1, 
        transition: { 
          staggerChildren: 0.15,
          when: "beforeChildren"
        } 
      },
    }}
  >
    {auctions.map((auction) => (
      <motion.div
        key={`${auction.id}-${auction.isFallback ? 'fallback' : 'live'}`}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
              type: "spring",
              stiffness: 100,
              damping: 10
            }
          }
        }}
        whileHover={{ 
          y: -5,
          transition: { 
            type: "spring",
            stiffness: 400,
            damping: 10
          } 
        }}
        whileTap={{ scale: 0.98 }}
      >
        <AuctionCard
          title={auction.title}
          currentBid={auction.currentBid || auction.bid}
          image={auction.image}
          index={auction.index}
          id={auction.id}
          isFallback={auction.isFallback}
        />
      </motion.div>
    ))}
  </motion.div>
);

const ViewAllButton = ({ isEmpty }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, type: "spring" }}
    viewport={{ once: true }}
    className="text-center mt-16"
  >
    <Link to="/auctions">
      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.95 }}
        className={`bg-gradient-to-r px-8 py-3 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center mx-auto ${
          isEmpty 
            ? "from-gray-400 to-gray-500 text-white" 
            : "from-indigo-500 to-purple-500 text-white"
        }`}
        animate={{
          background: isEmpty 
            ? ["#9CA3AF", "#6B7280", "#9CA3AF"] 
            : ["#6366F1", "#8B5CF6", "#6366F1"]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {isEmpty ? "Browse All Auctions" : "View All Live Auctions"}
        <motion.span
          animate={{ x: [0, 5, 0] }}
          transition={{ 
            duration: 2,
            repeat: Infinity
          }}
        >
          <FaArrowRight className="ml-2" />
        </motion.span>
      </motion.button>
    </Link>
  </motion.div>
);

export default FeaturedAuctions;