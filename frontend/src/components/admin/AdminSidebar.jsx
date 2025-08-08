import React from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaGavel,
  FaFlag,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBoxes,
  FaUserShield
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminSidebar = ({ 
  activeTab, 
  setActiveTab, 
  isSidebarOpen, 
  setIsSidebarOpen 
}) => {
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { id: "users", icon: <FaUsers />, label: "User Management" },
    { id: "auctions", icon: <FaGavel />, label: "Auction Monitoring" },
    { id: "products", icon: <FaBoxes />, label: "All Products" },
    { id: "admins", icon: <FaUserShield />, label: "Admin Management" },
    // { id: "analytics", icon: <FaChartBar />, label: "Analytics" },
    { id: "settings", icon: <FaCog />, label: "Settings" }
  ];

  const handleLogout = async () => {
    try {
      // Call logout API if you have one
      await axios.post('http://localhost:3000/api/auth/admin/logout', {}, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      sessionStorage.clear();
      
      // Force full page reload to reset all state
      window.location.href = '/admin/login';
    }
  };

  return (
    <div
      className={`bg-gradient-to-b from-indigo-800 to-indigo-900 text-white min-h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-indigo-700">
        {isSidebarOpen && (
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-indigo-200 focus:outline-none"
        >
          {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center py-3 px-4 w-full text-left transition duration-200 ${
              activeTab === item.id
                ? "bg-indigo-700/90 text-white"
                : "hover:bg-indigo-700/50 text-indigo-100"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isSidebarOpen && <span className="ml-3">{item.label}</span>}
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center py-3 px-4 w-full text-left hover:bg-red-600/80 transition duration-200 text-white mt-4"
        >
          <FaSignOutAlt className="text-xl" />
          {isSidebarOpen && <span className="ml-3">Logout</span>}
        </button>
      </nav>
    </div>
  );
};

export default AdminSidebar;