import React from "react";
import {
  FaHome,
  FaPlus,
  FaHistory,
  FaStar,
  FaList,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBox, // Icon for Manage Products
} from "react-icons/fa";

const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div
      className={`bg-gradient-to-b from-blue-800 to-purple-800 text-white min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-20"}`}
    >
      <div className="p-4 flex justify-between items-center">
        {isSidebarOpen && (
          <h1 className="text-xl font-bold text-white">Seller Dashboard</h1>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-gray-300 focus:outline-none"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>
      <nav className="mt-6">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "home" ? "bg-blue-700/50" : ""}`}
        >
          <FaHome className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Home</span>}
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "create" ? "bg-blue-700/50" : ""}`}
        >
          <FaPlus className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Create Auction</span>}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "history" ? "bg-blue-700/50" : ""}`}
        >
          <FaHistory className="text-xl" />
          {isSidebarOpen && <span className="ml-3">History</span>}
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "reviews" ? "bg-blue-700/50" : ""}`}
        >
          <FaStar className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Reviews</span>}
        </button>
        {/* <button
          onClick={() => setActiveTab("listings")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "listings" ? "bg-blue-700/50" : ""}`}
        >
          <FaList className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Listings</span>}
        </button> */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "profile" ? "bg-blue-700/50" : ""}`}
        >
          <FaCog className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Profile Settings</span>}
        </button>
        {/* Add Manage Products Option */}
        <button
          onClick={() => setActiveTab("manage-products")}
          className={`flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200 ${activeTab === "manage-products" ? "bg-blue-700/50" : ""}`}
        >
          <FaBox className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Manage Products</span>}
        </button>
        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role"); 
            sessionStorage.clear(); // Clear session
            window.location.href = "/login"; // Redirect to login page
          }}
          className="flex items-center py-2 px-4 w-full text-left hover:bg-blue-700/50 transition duration-200"
        >
          <FaSignOutAlt className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Logout</span>}
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;