// Authentication service

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register a new user
exports.registerUser = async (email, password) => {
  // Generate a salt and hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create a new user in the database
  const user = new User({ email, password: hashedPassword });
  await user.save();

  return user;
};

// Login user and generate a JWT token
exports.loginUser = async (email, password) => {
  // Fetch the user from the database
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Compare the provided password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return token;
};
