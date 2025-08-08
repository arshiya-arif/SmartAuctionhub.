import React from "react";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="relative w-full py-20 px-6 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Image - No shadow/border */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <img 
            src="/aboutsection.png" 
            alt="About AuctionHub" 
            className="relative z-10 w-full max-w-lg mx-auto"
          />
        </motion.div>

        {/* Right Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left"
        >
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>OUR STORY</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900">
            About <span className="text-indigo-600">AuctionHub</span>
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Revolutionizing online auctions with cutting-edge technology and unparalleled user experience.
          </p>
          
          <p className="text-lg text-gray-600 mb-8">
            Our platform connects buyers and sellers through seamless real-time bidding.
          </p>
          <a href="/about">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
           
          >
            Learn More
          </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;