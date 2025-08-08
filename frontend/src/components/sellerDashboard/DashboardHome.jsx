import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const DashboardHome = () => {
  const [productsCount, setProductsCount] = useState(0); 

 
  useEffect(() => {
  
    const fetchProductsCount = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/products/count", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch products count");
        }
        const data = await response.json();
        setProductsCount(data.count);
      } catch (error) {
        console.error("Error fetching products count:", error);
      }
    };

    fetchProductsCount();
  }, []);

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Your Seller Dashboard!
        </h1>
        <p className="text-lg text-gray-600">
          Manage your auctions, track sales, and connect with buyers seamlessly.
        </p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Products Listed Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">
            {productsCount}
          </h2>
          <p className="text-gray-700">Products Listed</p>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-green-600 mb-2">$12,345</h2>
          <p className="text-gray-700">Total Sales</p>
        </div>

        {/* Active Auctions Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-purple-600 mb-2">15</h2>
          <p className="text-gray-700">Active Auctions</p>
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-12 text-center"
      >
        
      </motion.div>
    </div>
  );
};

export default DashboardHome;