// routes/web.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('index'));
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/tasks', (req, res) => {
  // optionally pass user from server session if you have it
  res.render('tasks', { user: null });
});

module.exports = router;
