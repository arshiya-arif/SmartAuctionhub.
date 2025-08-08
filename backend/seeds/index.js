const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminSeed = require('./admin.seed');

dotenv.config();

const runSeeds = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🚀 Connected to database');
    
    // Run your seeds here
    await adminSeed();
    
    console.log('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(' Seed error:', error);
    process.exit(1);
  }
};

runSeeds();