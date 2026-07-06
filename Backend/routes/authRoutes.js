const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Create a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // 5. Send response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // 4. Send response
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      monthlyBudget: user.monthlyBudget,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current logged-in user's profile (protected route)
router.get('/profile', protect, async (req, res) => {
  res.status(200).json(req.user);
});

// Update monthly budget (protected route)
router.put('/budget', protect, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    req.user.monthlyBudget = monthlyBudget;
    await req.user.save();

    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      monthlyBudget: req.user.monthlyBudget,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;