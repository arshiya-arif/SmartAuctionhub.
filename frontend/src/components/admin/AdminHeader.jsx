import React from "react";
import { FaChevronRight } from "react-icons/fa";

const AdminHeader = ({ 
  activeTab, 
  setIsSidebarOpen, 
  isSidebarOpen 
}) => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 text-gray-600 hover:text-indigo-600"
          >
            <FaChevronRight />
          </button>
        )}
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {activeTab.replace(/-/g, " ")}
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
          {localStorage.getItem("username")?.charAt(0).toUpperCase() || "A"}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {localStorage.getItem("username") || "Admin"}
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;



