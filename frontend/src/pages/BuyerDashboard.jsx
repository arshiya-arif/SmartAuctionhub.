import React, { useState, useEffect } from "react";
import Sidebar from "../components/buyerDashboard/BuyerSidebar";
import Header from "../components/Header";
import BuyerHome from "../components/buyerDashboard/BuyerDashboardHome";
import BiddingHistory from "../components/buyerDashboard/BuyerBiddingHistory";
import WinningBids from "../components/buyerDashboard/BuyerWinningBids";
import ProfileSettings from "../components/ProfileSettingPage";

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, isMobile]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Buyer Sidebar */}
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
          {activeTab === "home" && <BuyerHome />}
          {activeTab === "bidding-history" && <BiddingHistory />}
          {activeTab === "winning-bids" && <WinningBids />}
          {activeTab === "profile" && <ProfileSettings />}
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;