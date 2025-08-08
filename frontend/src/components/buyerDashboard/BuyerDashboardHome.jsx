import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BuyerDashboardHome = () => {
  const [stats, setStats] = useState({
    activeBids: 0,
    totalBids: 0,
    wonAuctions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/api/auctions/buyer/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching buyer stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Buyer Dashboard</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your bids, manage your wins, and find new auctions to participate in.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {/* Active Bids Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-indigo-500"
        >
          <h2 className="text-3xl font-bold text-indigo-600 mb-2">
            {stats.activeBids}
          </h2>
          <p className="text-gray-600">Active Bids</p>
        </motion.div>

        {/* Total Bids Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-purple-500"
        >
          <h2 className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalBids}
          </h2>
          <p className="text-gray-600">Total Bids Placed</p>
        </motion.div>

        {/* Won Auctions Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border-t-4 border-pink-500"
        >
          <h2 className="text-3xl font-bold text-pink-600 mb-2">
            {stats.wonAuctions}
          </h2>
          <p className="text-gray-600">Auctions Won</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BuyerDashboardHome;