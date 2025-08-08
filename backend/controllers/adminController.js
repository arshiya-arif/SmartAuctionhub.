const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Remove password from body if included
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Also delete user's auctions and bids
    await Auction.deleteMany({ sellerId: req.params.id });
    await Bid.deleteMany({ userId: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};


exports.getAuctions = async (req, res, next) => {
  try {
    const auctions = await Auction.find()
      .populate('sellerId', 'name email')  // Explicitly populate seller
      .populate('winner', 'name email')
      .sort({ createdAt: -1 });

    // Calculate highest bid
    const auctionsWithBids = auctions.map(auction => {
      return {
        ...auction.toObject(),
        highestBid: auction.highestBid || auction.startingBid
      };
    });

    res.status(200).json({
      success: true,
      data: auctionsWithBids
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get auction bids
// @route   GET /api/admin/auctions/:id/bids
// @access  Private/Admin
exports.getAuctionBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.id })
      .populate('userId', 'name email')
      .sort({ bidAmount: -1 });

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End auction early
// @route   PUT /api/admin/auctions/:id/end
// @access  Private/Admin
exports.endAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return next(new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404));
    }

    if (auction.status !== 'active') {
      return next(new ErrorResponse('Auction is already ended', 400));
    }

    auction.status = 'ended_winner';
    auction.endDate = Date.now();
    await auction.save();

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      usersCount,
      auctionsCount,
      activeAuctions,
      completedAuctions,
      totalBids,
      totalRevenue,
      recentUsers,
      recentAuctions
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      Auction.countDocuments(),
      Auction.countDocuments({ status: 'active' }),
      Auction.countDocuments({ status: 'completed' }),
      Bid.countDocuments(),
      // Updated revenue calculation
      Auction.aggregate([
        { 
          $match: { 
            status: 'completed',
            $or: [
              { currentPrice: { $exists: true, $gt: 0 } },
              { highestBid: { $exists: true, $gt: 0 } }
            ]
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: {
                $cond: [
                  { $gt: ['$currentPrice', 0] },
                  '$currentPrice',
                  '$highestBid'
                ]
              }
            } 
          } 
        }
      ]).then(res => res[0]?.total || 0),
      // Recent users
      User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      // Recent auctions with proper price handling
      Auction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('sellerId', 'name email')
        .lean()
        .then(auctions => auctions.map(a => ({
          ...a,
          currentPrice: a.currentPrice || a.highestBid || a.startingBid || 0,
          startingPrice: a.startingPrice || a.startingBid || 0
        })))
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: usersCount,
          auctions: auctionsCount,
          activeAuctions,
          completedAuctions,
          totalBids,
          totalRevenue
        },
        recent: {
          users: recentUsers,
          auctions: recentAuctions.map(a => ({
            ...a,
            sellerId: a.sellerId || { name: 'No Seller', email: '' },
            currentPrice: a.currentPrice || a.highestBid || a.startingBid || 0,
            startingPrice: a.startingPrice || a.startingBid || 0
          }))
        }
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    next(new ErrorResponse('Failed to load dashboard data', 500));
  }
};
// @desc    End auction (now marks as 'completed' instead of 'ended_winner')
// @route   PUT /api/admin/auctions/:id/end
// @access  Private/Admin
exports.endAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return next(new ErrorResponse(`Auction not found with id of ${req.params.id}`, 404));
    }

    if (auction.status !== 'active') {
      return next(new ErrorResponse('Auction is already ended', 400));
    }

    auction.status = 'completed'; // Changed from 'ended_winner'
    auction.endDate = Date.now();
    await auction.save();

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    next(error);
  }
};






// @desc    Get all auctions (named as products for frontend)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProductsList = async (req, res, next) => {
  try {
    const auctions = await Auction.find()
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    // Transform auction data to match "products" naming
    const products = auctions.map(auction => ({
      _id: auction._id,
      title: auction.title,
      description: auction.description,
      category: auction.category,
      image: auction.image,
      sellerId: auction.sellerId,
      status: auction.status,
      currentPrice: auction.currentBid || auction.highestBid || auction.startingBid || 0,
      startingPrice: auction.startingBid || 0,
      createdAt: auction.createdAt
    }));

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};



exports.getAdmins = async (req, res, next) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (err) {
    next(err);
  }
};



exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already exists', 400));
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin'
    });

    // Remove password from response
    admin.password = undefined;

    res.status(201).json({
      success: true,
      data: admin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update admin
// @route   PUT /api/admin/admins/:id
// @access  Private/Admin
exports.updateAdmin = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    const admin = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete admin
// @route   DELETE /api/admin/admins/:id
// @access  Private/Admin
exports.deleteAdmin = async (req, res, next) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return next(new ErrorResponse('You cannot delete yourself', 400));
    }

    const admin = await User.findByIdAndDelete(req.params.id);

    if (!admin) {
      return next(new ErrorResponse(`Admin not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};





