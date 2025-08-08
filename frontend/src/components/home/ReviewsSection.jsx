import React from "react";
import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "John Doe",
    role: "CEO, TechCorp",
    comment: "AuctionHub has completely transformed how we handle online auctions. The platform is intuitive, fast, and reliable. Highly recommended!",
    image: "./icons8-user-default-96.png",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Art Collector",
    comment: "I've found some of the rarest collectibles on AuctionHub. The bidding process is seamless, and the support team is fantastic!",
    image: "/icons8-user-default-96.png",
  },
  {
    id: 3,
    name: "Alex Johnson",
    role: "Entrepreneur",
    comment: "The AI-powered pricing predictions are a game-changer. I've saved so much time and money using AuctionHub. Truly innovative!",
    image: "/icons8-user-default-96.png",
  },
];

const ReviewsSection = () => {
  return (
    <section className="relative w-full py-20 px-6 bg-gray-800 text-white overflow-hidden">
      {/* Background Glow Effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"
      />

      {/* Section Heading */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-5xl font-bold text-center mb-12 tracking-wide"
      >
        What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Clients Say</span>
      </motion.h2>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 border border-gray-700 hover:border-indigo-500/50 transition-all"
          >
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={review.image || "/default-avatar.png"}
                alt={review.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/50"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
              <div>
                <h3 className="text-xl font-semibold">{review.name}</h3>
                <p className="text-sm text-gray-400">{review.role}</p>
              </div>
            </div>
            <p className="text-lg text-gray-300">{review.comment}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ReviewsSection;