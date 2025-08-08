import React from "react";
import {
  FaHome,
  FaHistory,
  FaTrophy,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const BuyerSidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div
      className={`bg-gradient-to-b from-indigo-700 to-purple-700 text-white min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"}`}
    >
      <div className="p-4 flex justify-between items-center">
        {isSidebarOpen && (
          <h1 className="text-xl font-bold text-white">Buyer Dashboard</h1>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-indigo-200 focus:outline-none"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
      <nav className="mt-6">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center py-3 px-4 w-full text-left hover:bg-indigo-600/80 transition duration-200 ${activeTab === "home" ? "bg-indigo-600/80 border-r-4 border-indigo-300" : ""}`}
        >
          <FaHome className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Dashboard</span>}
        </button>
        <button
          onClick={() => setActiveTab("bidding-history")}
          className={`flex items-center py-3 px-4 w-full text-left hover:bg-indigo-600/80 transition duration-200 ${activeTab === "bidding-history" ? "bg-indigo-600/80 border-r-4 border-indigo-300" : ""}`}
        >
          <FaHistory className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Bidding History</span>}
        </button>
        <button
          onClick={() => setActiveTab("winning-bids")}
          className={`flex items-center py-3 px-4 w-full text-left hover:bg-indigo-600/80 transition duration-200 ${activeTab === "winning-bids" ? "bg-indigo-600/80 border-r-4 border-indigo-300" : ""}`}
        >
          <FaTrophy className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Winning Bids</span>}
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center py-3 px-4 w-full text-left hover:bg-indigo-600/80 transition duration-200 ${activeTab === "profile" ? "bg-indigo-600/80 border-r-4 border-indigo-300" : ""}`}
        >
          <FaCog className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Profile Settings</span>}
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role"); 
            sessionStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center py-3 px-4 w-full text-left hover:bg-indigo-600/80 transition duration-200 mt-4"
        >
          <FaSignOutAlt className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Logout</span>}
        </button>
      </nav>
    </div>
  );
};

export default BuyerSidebar;