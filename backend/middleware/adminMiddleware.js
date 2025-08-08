const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return next(new ErrorResponse('Access denied, admin privileges required', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};