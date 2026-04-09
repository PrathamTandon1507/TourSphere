const mongoose = require('mongoose');
require('../server/config/loadEnv');
const Tour = require('../server/models/tourModel');

const check = async () => {
  try {
    const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    await mongoose.connect(db);
    
    const newest = await Tour.findOne().sort({ createdAt: -1 });
    const standard = await Tour.findOne({ name: 'The Forest Hiker' }) || await Tour.findOne();

    console.log('--- NEWEST TOUR (POTENTIALLY BROKEN) ---');
    console.log(JSON.stringify({
      name: newest.name,
      startLocation: newest.startLocation,
      locations: newest.locations
    }, null, 2));

    console.log('\n--- STANDARD TOUR (WORKING) ---');
    console.log(JSON.stringify({
      name: standard.name,
      startLocation: standard.startLocation,
      locations: standard.locations
    }, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
};

check();
