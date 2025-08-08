const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  const adminData = {
    name: 'Super Admin',
    email: 'admin@auctionhub.com',
    password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'SecurePassword123!', 12),
    role: 'admin',
    phone: '+10000000000',
    cnic: '0000000000000',
  };

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('ℹ️ Admin account already exists');
      return;
    }

    // Create new admin
    const admin = await User.create(adminData);
    console.log('✅ Admin account created:', {
      id: admin._id,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  }
};

module.exports = seedAdmin;