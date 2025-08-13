const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register
exports.registerUser = async (req, res) => {
  const { username, email, password, bio } = req.body;
  const avatarUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-avatar.jpg';

  try {
    let user = await User.findOne({ email });
    if (user) {
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting failed upload:', err);
        });
      }
      return res.status(400).json({ error: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword,
      bio,
      avatarUrl,
    });
    await user.save();

    // JWT authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({
      success: true, message: 'User registered successfully', token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        followers: user.followers || [],
        following: user.following || [],
        isPrivate: user.isPrivate,
      },
    });

  } catch (error) {
    console.error('Error :', error);
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file :', err);
      });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email or password is incorrect!' });
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({ success: false, message: 'Email or password is incorrect!' });
    }

      // JWT token with consistent payload shape
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: user.toObject({
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      }),
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found!' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};