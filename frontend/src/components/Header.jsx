



import React from "react";
import { FaHome, FaPlusCircle, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Header = ({ setActiveTab, userRole }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            AuctionHub
          </span>
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Home Button */}
        <button
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-md flex items-center"
        >
          <FaHome className="mr-2" /> Home
        </button>
        
        {/* Create Auction Button - Only for sellers */}
        {userRole === "seller" && (
          <button
            onClick={() => setActiveTab("create")}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-300 shadow-md flex items-center"
          >
            <FaPlusCircle className="mr-2" /> Create Auction
          </button>
        )}
        
        {/* User Profile */}
        <button className="text-white hover:text-indigo-200 transition-colors duration-200">
          <FaUser className="text-xl" />
        </button>
      </div>
    </header>
  );
};

export default Header;