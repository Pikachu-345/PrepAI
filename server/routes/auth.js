const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', 
  });
};

// --- @route   POST /api/auth/signup ---
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
    });
    
    await user.save();

    const token = createToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- @route   POST /api/auth/login ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password'); 
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user._id);

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;