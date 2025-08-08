import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaSearch, FaFilter, FaClock, FaTag, FaMoneyBillAlt, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/api/auctions`);
      setAuctions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      setIsLoading(false);
    }
  };

  const applyFilters = async () => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (category) query.append("category", category);
      if (minPrice) query.append("minPrice", minPrice);
      if (maxPrice) query.append("maxPrice", maxPrice);
      if (sort) query.append("sort", sort);

      const response = await axios.get(`http://localhost:3000/api/auctions?${query.toString()}`);
      setAuctions(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error applying filters:", error);
      setIsLoading(false);
    }
  };

  const removeFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    fetchAuctions();
  };

  const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(endDate));
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    function calculateTimeLeft(endDate) {
      const difference = new Date(endDate) - new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    }

    return (
      <div className="text-sm font-semibold text-gray-700">
        {timeLeft.days || timeLeft.hours || timeLeft.minutes || timeLeft.seconds ? (
          <span className="flex items-center">
            <FaClock className="mr-2 text-indigo-600" />
            Ends in:{" "}
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {timeLeft.hours > 0 && `${timeLeft.hours}h `}
            {timeLeft.minutes > 0 && `${timeLeft.minutes}m `}
            {timeLeft.seconds > 0 && `${timeLeft.seconds}s`}
          </span>
        ) : (
          <span className="text-red-600">Auction Ended</span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto p-6 pt-24">
        {/* Main Card Container */}
        <motion.div 
          className="relative bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-10 rounded-lg pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10 p-6 md:p-8">
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
              >
                LIVE AUCTIONS
              </motion.div>
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                Discover <span className="text-indigo-600">Exclusive</span> Items
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Bid on unique items from around the world
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4 bg-gray-50 p-6 rounded-xl mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative w-full sm:w-auto">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <FaTag className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-48"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="relative w-full sm:w-auto">
                <FaMoneyBillAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-32"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <FaMoneyBillAlt className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-32"
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-48"
                >
                  <option value="">Sort By</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="ending_soon">Ending Soon</option>
                </select>
              </div>

              <motion.button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center"
                onClick={applyFilters}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaFilter className="mr-2" />
                Apply Filters
              </motion.button>

              <motion.button
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all flex items-center"
                onClick={removeFilters}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaTimes className="mr-2" />
                Remove Filters
              </motion.button>
            </motion.div>

            {/* Auction Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
                  >
                    <div className="w-full h-56 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-1/3 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg mt-4 animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {auctions.length > 0 ? (
                  auctions.map((auction) => {
                    const normalizedImagePath = `/${auction.image.replace(/\\/g, "/")}`;
                    return (
                      <motion.div
                        key={auction._id}
                        className="bg-white p-4 rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg"
                        whileHover={{ y: -3 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Image Container */}
                        <div className="w-full h-56 flex items-center justify-center overflow-hidden rounded-lg mb-4">
                          <img
                            src={`http://localhost:3000${normalizedImagePath}`}
                            alt={auction.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = "http://localhost:3000/uploads/fallback.jpg";
                            }}
                          />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{auction.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <FaTag className="mr-2 text-indigo-600" />
                          Category: {auction.category}
                        </p>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <FaMoneyBillAlt className="mr-2 text-indigo-600" />
                          Starting Bid: <span className="font-bold text-indigo-600">${auction.startingBid}</span>
                        </p>
                        <p className="text-sm text-gray-600 mb-2 flex items-center">
                          <FaCalendarAlt className="mr-2 text-indigo-600" />
                          Ends On: {new Date(auction.endDate).toLocaleDateString()}
                        </p>
                        <CountdownTimer endDate={auction.endDate} />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Link 
                            to={`/auctions/${auction._id}`} 
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all mt-4 flex items-center justify-center"
                          >
                            <FaMoneyBillAlt className="mr-2" />
                            Place Bid
                          </Link>
                        </motion.div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg font-semibold text-gray-700">
                      No auctions found. Try adjusting your filters.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auctions;