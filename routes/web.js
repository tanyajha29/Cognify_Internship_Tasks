const express = require('express');
const router = express.Router();

/* simple pages */
router.get('/', (req, res) => res.render('index'));
router.get('/register', (req, res) => res.render('register'));
router.get('/login', (req, res) => res.render('login'));
router.get('/tasks', (req, res) => res.render('tasks'));

module.exports = router;
