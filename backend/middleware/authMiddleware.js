
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      message: "Authorization header missing" 
    });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Invalid token format" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Standardize the user object
    req.user = {
      _id: decoded._id || decoded.id, // Handle both _id and id
      id: decoded._id || decoded.id,  // Set both for compatibility
      ...(decoded.user || decoded)    // Handle both direct and nested user objects
    };
    
    // Debugging log
    console.log('Authenticated user:', req.user);
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      success: false,
      message: "Invalid or expired token",
      error: error.message 
    });
  }
};

module.exports = authMiddleware;








