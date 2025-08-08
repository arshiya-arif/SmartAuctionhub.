
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const AuctionCard = ({ id, title, currentBid, image, index, isFallback }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      {/* Image Section - Full width with separate styling */}
      <div className="relative w-full h-56 bg-gradient-to-r from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <img 
          src={image} 
          alt={title} 
          className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {isFallback && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            SAMPLE
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LIVE AUCTION
          </span>
        </div>
      </div>
      
      {/* Content Section - Distinct styling */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 font-['Inter'] line-clamp-2 leading-tight">
            {title}
          </h3>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full my-2"></div>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">CURRENT BID</p>
              <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentBid}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 font-medium"></p>
              <p className="text-sm font-semibold text-gray-700"></p>
            </div>
          </div>
          
          <Link to={`/auctions/${id}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Place Bid
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AuctionCard;