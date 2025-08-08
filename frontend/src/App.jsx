import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import './index.css'
// import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgetPassword from "./pages/ForgetPassword";
import Auctions from "./pages/Auctions";
import Contact from "./pages/Contact";
import About from "./pages/About";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Admin from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AuctionDetails from "./pages/AuctionDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

function App() {
  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Admin login route (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Route */}
        <Route
          path="/admin/*"
          element={
            <AdminProtectedRoute>
              <Admin/>
            </AdminProtectedRoute>
          }
        />
        
        {/* Protected Seller Dashboard */}
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Buyer Dashboard */}
        <Route
          path="/buyer-dashboard"
          element={
            <ProtectedRoute requiredRole="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;