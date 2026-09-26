require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = String(process.argv[2] || '').trim().toLowerCase();

const promoteAdmin = async () => {
  if (!email) {
    console.error('Usage: node utils/promoteAdmin.js owner@example.com');
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('No registered account found for that email. Register through the website first.');
    }

    user.role = 'admin';
    await user.save();
    console.log(`Administrator access enabled for ${user.email}.`);
  } catch (error) {
    console.error('Admin promotion failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

promoteAdmin();
