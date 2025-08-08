
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { FaGavel } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    setIsAuthenticated(!!token);
    setUserRole(role || "");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole("");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white py-4 px-6 fixed w-full z-50 shadow-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center text-2xl font-bold tracking-tight">
          <FaGavel className="mr-2 text-indigo-400" />
          <span className="text-white">Auction</span>
          <span className="text-indigo-400">Hub</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <NavItem to="/" label="Home" className="font-semibold hover:text-indigo-300" />
          <NavItem to="/auctions" label="Live Auctions" className="font-semibold hover:text-indigo-300" />
          <NavItem to="/about" label="About" className="font-semibold hover:text-indigo-300" />
          <NavItem to="/contact" label="Contact" className="font-semibold hover:text-indigo-300" />
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <button
              onClick={() => navigate(`/${userRole}-dashboard`)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {userRole === "seller" ? "Seller Dashboard" : "My Bids"}
            </button>
          )}
          <button
            onClick={isAuthenticated ? handleLogout : () => navigate("/login")}
            className="bg-white text-gray-900 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            {isAuthenticated ? "Logout" : "Login"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 w-full h-full bg-gray-800 shadow-xl transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden z-50`}
      >
        <div className="p-6 flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center text-2xl font-bold" onClick={() => setIsOpen(false)}>
              <FaGavel className="mr-2 text-indigo-400" />
              <span className="text-white">Auction</span>
              <span className="text-indigo-400">Hub</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col space-y-6">
            <NavItem to="/" label="Home" onClick={() => setIsOpen(false)} className="text-lg font-semibold hover:text-indigo-300" />
            <NavItem to="/auctions" label="Live Auctions" onClick={() => setIsOpen(false)} className="text-lg font-semibold hover:text-indigo-300" />
            <NavItem to="/about" label="About" onClick={() => setIsOpen(false)} className="text-lg font-semibold hover:text-indigo-300" />
            <NavItem to="/contact" label="Contact" onClick={() => setIsOpen(false)} className="text-lg font-semibold hover:text-indigo-300" />
          </div>

          <div className="flex flex-col space-y-4 pt-8">
            {isAuthenticated && (
              <button
                onClick={() => {
                  navigate(`/${userRole}-dashboard`);
                  setIsOpen(false);
                }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all"
              >
                {userRole === "seller" ? "Seller Dashboard" : "My Bids"}
              </button>
            )}
            <button
              onClick={() => {
                isAuthenticated ? handleLogout() : navigate("/login");
                setIsOpen(false);
              }}
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-100 transition-all"
            >
              {isAuthenticated ? "Logout" : "Login"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, label, onClick, className = "" }) => (
  <Link 
    to={to} 
    className={`${className} transition-colors`}
    onClick={onClick}
  >
    {label}
  </Link>
);

export default Navbar;