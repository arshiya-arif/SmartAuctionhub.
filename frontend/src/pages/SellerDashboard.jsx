import React, { useState, useEffect } from "react";
import Sidebar from "../components/sellerDashboard/Sidebar";
import Header from "../components/Header";
import CreateAuctionForm from "../components/sellerDashboard/CreateAuctionForm";
import History from "../components/sellerDashboard/HistoryPage";
import Reviews from "../components/sellerDashboard/ReviewsPage";
import Listings from "../pages/Auctions";
import ProfileSettings from "../components/ProfileSettingPage";

import Home from "../components/sellerDashboard/DashboardHome";
import ProductManagement from "../components/sellerDashboard/ProductManagement"; // Import the new component

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("home"); // State to manage active tab
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar visibility
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // State to check if the screen is mobile

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Automatically close the sidebar on mobile when a tab is clicked
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          setActiveTab={setActiveTab}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "home" && <Home />}
          {activeTab === "create" && <CreateAuctionForm />}
          {activeTab === "history" && <History />}
          {activeTab === "reviews" && <Reviews />}
          {/* {activeTab === "listings" && <Listings />} */}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "manage-products" && <ProductManagement />} {/* Add this line */}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;