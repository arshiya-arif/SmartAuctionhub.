import React, { useState, useEffect } from "react";
import Sidebar from "../components/admin/AdminSidebar";
import Header from "../components/admin/AdminHeader";
import AdminDashboardHome from "../components/admin/AdminDashboardHome";
import AdminUsers from "../components/admin/AdminUsers";
import AdminAuctions from "../components/admin/AdminAuctions";

import AdminProducts from "../components/admin/AdminProducts";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import AdminManagement from "../components/admin/AdminManagement";
import AdminSettings from "../components/admin/AdminSettings";
import { useNavigate } from "react-router-dom";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();


  useEffect(() => {
    // Double-check authentication on mount
    const authData = JSON.parse(localStorage.getItem('auth'));
    if (!authData?.token || authData.user?.role !== 'admin') {
      console.warn('Invalid auth - redirecting to login');
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeTab === "dashboard" && <AdminDashboardHome />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "auctions" && <AdminAuctions />}
          {/* {activeTab === "fraud-cases" && <AdminFraudCases />} */}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "admins" && <AdminManagement />}
          {activeTab === "settings" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
