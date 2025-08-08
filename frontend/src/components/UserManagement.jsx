import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaUser,
  FaUserShield,
  FaUserTie,
  FaUserSlash,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/admin/users?page=${currentPage}&search=${searchTerm}`);
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm]);

  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/users/${userId}`);
      setUserDetails(res.data);
      setSelectedUser(userId);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
    }
  };

  const toggleSuspendUser = async (userId, isSuspended) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}/suspend`, {
        suspended: !isSuspended
      });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, suspended: !isSuspended } : user
      ));
      
      if (selectedUser === userId) {
        setUserDetails({
          ...userDetails,
          user: {
            ...userDetails.user,
            suspended: !isSuspended
          }
        });
      }
    } catch (error) {
      console.error('Error toggling user suspension:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
        if (selectedUser === userId) {
          setSelectedUser(null);
          setUserDetails(null);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserShield className="text-purple-500" />;
      case 'seller':
        return <FaUserTie className="text-blue-500" />;
      default:
        return <FaUser className="text-green-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {selectedUser ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <button
            onClick={() => setSelectedUser(null)}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <FaArrowLeft className="mr-2" /> Back to Users
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div>
              {/* User Profile Section */}
              <div className="flex items-start border-b border-gray-200 pb-6 mb-6">
                <div className="flex-shrink-0 h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                  {userDetails.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {userDetails.user.name}
                    <span className="ml-3 text-sm font-normal px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      {userDetails.user.role}
                    </span>
                    <span className={`ml-2 text-sm font-normal px-3 py-1 rounded-full ${
                      userDetails.user.suspended ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {userDetails.user.suspended ? 'Suspended' : 'Active'}
                    </span>
                  </h2>
                  <p className="text-gray-600 mt-1">{userDetails.user.email}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Joined: {formatDate(userDetails.user.createdAt)}
                  </p>
                  <div className="flex mt-4 space-x-3">
                    <button
                      onClick={() => toggleSuspendUser(userDetails.user._id, userDetails.user.suspended)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        userDetails.user.suspended
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      {userDetails.user.suspended ? 'Unsuspend User' : 'Suspend User'}
                    </button>
                    {userDetails.user.role !== 'admin' && (
                      <button
                        onClick={() => deleteUser(userDetails.user._id)}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 text-sm font-medium"
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* User Details Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Listed Auctions (for sellers) */}
                {userDetails.user.role === 'seller' && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Listed Auctions ({userDetails.listedAuctions.length})
                    </h3>
                    {userDetails.listedAuctions.length > 0 ? (
                      <div className="space-y-4">
                        {userDetails.listedAuctions.map((auction) => (
                          <div key={auction._id} className="border border-gray-200 rounded-lg p-3 hover:bg-white">
                            <div className="flex">
                              <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                                {auction.image && (
                                  <img
                                    src={auction.image}
                                    alt={auction.title}
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="ml-3">
                                <h4 className="font-medium text-gray-800">{auction.title}</h4>
                                <p className="text-sm text-gray-600 line-clamp-1">{auction.description}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-sm font-medium text-gray-800">
                                    ${auction.currentBid || auction.startingBid}
                                  </span>
                                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                    auction.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {auction.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No auctions listed</p>
                    )}
                  </div>
                )}

                {/* Won Auctions */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Won Auctions ({userDetails.wonAuctions.length})
                  </h3>
                  {userDetails.wonAuctions.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.wonAuctions.map((auction) => (
                        <div key={auction._id} className="border border-gray-200 rounded-lg p-3 hover:bg-white">
                          <h4 className="font-medium text-gray-800">{auction.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{auction.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-gray-800">
                              Won for: ${auction.winningAmount}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(auction.endDate)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No auctions won</p>
                  )}
                </div>

                {/* Bidding History */}
                <div className="bg-gray-50 rounded-lg p-4 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Bidding History ({userDetails.biddingHistory.length})
                  </h3>
                  {userDetails.biddingHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Auction
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Bid Amount
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userDetails.biddingHistory.map((bid) => (
                            <tr key={bid._id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {bid.auctionId?.title || 'Unknown Auction'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                ${bid.bidAmount}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(bid.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  bid.auctionId?.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                  bid.auctionId?.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bid.auctionId?.status || 'unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No bidding history</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-600 mt-2">
              Manage all user accounts, view details, and take administrative actions
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="relative w-full md:w-64 mb-4 md:mb-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">
                                Joined: {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRoleIcon(user.role)}
                            <span className="ml-2 capitalize">{user.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.suspended
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchUserDetails(user._id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => toggleSuspendUser(user._id, user.suspended)}
                              className={user.suspended ? "text-green-600 hover:text-green-900" : "text-yellow-600 hover:text-yellow-900"}
                              title={user.suspended ? "Unsuspend" : "Suspend"}
                            >
                              <FaUserSlash />
                            </button>
                            {user.role !== "admin" && (
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{" "}
                        <span className="font-medium">{Math.min(currentPage * 10, users.length)}</span> of{" "}
                        <span className="font-medium">{totalPages * 10}</span> users
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <FaArrowLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <FaArrowRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default UserManagement;