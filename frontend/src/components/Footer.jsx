import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative w-full py-12 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-glow" />

      {/* Footer Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {/* About Section */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">AuctionHub</h3>
          <p className="text-gray-300">
            Revolutionizing online auctions with cutting-edge technology and seamless user experiences.
          </p>
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-300 hover:text-purple-400 transition-all"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-purple-400 transition-all"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-purple-400 transition-all"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-purple-400 transition-all"
            >
              <FaLinkedin size={24} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-all">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-all">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-all">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-all">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Newsletter</h3>
          <p className="text-gray-300">
            Subscribe to our newsletter to get the latest updates and offers.
          </p>
          <form className="flex space-x-2">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-300"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">Contact Info</h3>
          <ul className="space-y-2">
            <li className="text-gray-300">123 Auction Street, City, Country</li>
            <li className="text-gray-300">Email: support@auctionhub.com</li>
            <li className="text-gray-300">Phone: +1 234 567 890</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-12 text-center border-t border-gray-700 pt-8 relative z-10">
        <p className="text-gray-300">
          © {new Date().getFullYear()} AuctionHub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;