
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrophy, FaSearch, FaExclamationTriangle, FaImage } from "react-icons/fa";

const BuyerWinningBids = () => {
  const [winningBids, setWinningBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
  const fetchWinningBids = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.get(
        "http://localhost:3000/api/auctions/buyer/winning-bids",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("API Response:", response.data);

      if (!response.data.data || response.data.data.length === 0) {
        console.log("No winning bids found for user");
        setWinningBids([]);
        setLoading(false);
        return;
      }

      const formattedBids = response.data.data.map((bid, index) => ({
        ...bid,
        itemImage: response.data.imageUrls[index]?.formatted || bid.image
      }));

      setWinningBids(formattedBids);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Failed to load winning bids");
      setLoading(false);
    }
  };

  fetchWinningBids();
}, []);

  const formatImageUrl = (imgPath) => {
    if (!imgPath) return null;
    // Normalize path for Windows/Linux compatibility
    const normalizedPath = imgPath.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) return normalizedPath;
    return `${window.location.origin}/${normalizedPath.replace(/^uploads\//, '')}`;
  };

  const filteredWinningBids = winningBids.filter(bid => 
    (bid.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || 
    (bid._id?.toString().includes(searchTerm))
  ));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <FaTrophy className="text-yellow-500 mr-2" /> Winning Bids
      </h1>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by item name or auction ID..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredWinningBids.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winning Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Won On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWinningBids.map((bid) => {
                const imageUrl = formatImageUrl(bid.itemImage);
                return (
                  <tr key={bid._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {imageUrl ? (
                            <>
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={imageUrl}
                                alt={bid.title}
                                onError={(e) => {
                                  e.target.src = '';
                                  e.target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 bg-gray-200 rounded-full items-center justify-center">
                                <FaImage className="text-gray-500" />
                              </div>
                            </>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FaImage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {bid.title || 'Unknown Item'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bid._id?.toString().slice(-6) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${bid.winningAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bid.endDate ? new Date(bid.endDate).toLocaleDateString() : 'Unknown date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${bid.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {bid.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FaTrophy className="mx-auto text-gray-400 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {searchTerm ? "No matching winning bids found" : "No winning bids found"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm 
              ? "Try a different search term" 
              : "You haven't won any auctions yet. Keep bidding!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default BuyerWinningBids;