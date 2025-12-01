const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/* Register */
router.post('/register', async (req, res) => {
  try {
    const { fullname, username, email, password, confirm_password } = req.body;
    const errors = {};
    if (!fullname || fullname.trim().length < 3) errors.fullname = 'Full name min 3 chars';
    if (!username || !/^[\w-]{4,}$/.test(username)) errors.username = 'Username invalid';
    if (!email || !/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(email)) errors.email = 'Email invalid';
    if (!password || password.length < 8) errors.password = 'Password must be ≥8 chars';
    if (password !== confirm_password) errors.confirm_password = 'Passwords do not match';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    // uniqueness
    if (await User.findOne({ username })) return res.status(400).json({ errors: { username: 'Username taken' }});
    if (await User.findOne({ email })) return res.status(400).json({ errors: { email: 'Email registered' }});

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ fullname, username, email: email.toLowerCase(), passwordHash });
    await user.save();

    // return minimal
    return res.status(201).json({ message: 'Registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/* Login -> returns JWT */
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }] });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '7d' });

    // return token + basic user info
    return res.json({ token, user: { id: user._id, username: user.username, fullname: user.fullname }});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
