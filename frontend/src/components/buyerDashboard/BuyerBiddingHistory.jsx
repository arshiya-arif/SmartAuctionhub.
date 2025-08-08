import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaImage, FaExclamationTriangle } from "react-icons/fa";

const BuyerBiddingHistory = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBiddingHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:3000/api/auctions/buyer/bidding-history",
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("API Response:", {
          data: response.data,
          imageUrls: response.data.map(bid => bid.itemImage)
        });

        setBids(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error Details:", {
          message: error.message,
          response: error.response?.data,
          config: error.config
        });
        setError(error.response?.data?.message || "Failed to load bidding history");
        setLoading(false);
      }
    };

    fetchBiddingHistory();
  }, []);

  const formatImageUrl = (imgPath) => {
    if (!imgPath) return null;
    
    // If already a complete URL
    if (imgPath.startsWith('http')) return imgPath;
    
    // Handle local development paths
    if (process.env.NODE_ENV === 'development') {
      // Remove any duplicate 'uploads' in path
      const cleanPath = imgPath.replace(/(^\/?uploads\/)/, '');
      return `http://localhost:3000/uploads/${cleanPath}`;
    }
    
    // Production path
    return imgPath;
  };

  const filteredBids = bids.filter(bid => 
    (bid.itemName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || '') ||
    (bid.auctionId?.toString().includes(searchTerm) || '')
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Bidding History</h1>
      
      {/* Search Bar */}
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBids.length > 0 ? (
                filteredBids.map((bid) => {
                  const imageUrl = formatImageUrl(bid.itemImage);
                  console.log(`Bid ${bid._id} image:`, {
                    original: bid.itemImage,
                    formatted: imageUrl
                  });

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
                                  alt={bid.itemName || 'Auction item'}
                                  onError={(e) => {
                                    console.error(`Failed to load image: ${imageUrl}`);
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
                              {bid.itemName || 'Unknown Item'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bid.auctionId?.toString().slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${bid.bidAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bid.createdAt ? new Date(bid.createdAt).toLocaleDateString() : 'Unknown date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${bid.status === 'active' ? 'bg-green-100 text-green-800' : 
                            bid.status === 'won' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {bid.status || 'unknown'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No matching bids found' : 'No bidding history found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BuyerBiddingHistory;