
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const storagePath = path.join(__dirname, 'data', 'storage.json'); // tasks (level1)
const usersPath   = path.join(__dirname, 'data', 'users.json');   // users (level2)

/* ---------- helper: safe read JSON ---------- */
function readJsonSafe(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

/* ---------- Level1 routes (keep as before) ---------- */
// Home: show add-task form
app.get('/', (req, res) => {
  res.render('index', { errors: [], task: {} });
});

// Handle add-task (server-side minimal validation + save to storage.json)
app.post('/add-task', (req, res) => {
  const { title, description } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters.');
  }

  if (errors.length > 0) {
    return res.render('index', { errors, task: { title, description } });
  }

  // read storage.json (create if missing)
  let data = readJsonSafe(storagePath);

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    description: description ? description.trim() : '',
    createdAt: new Date().toISOString()
  };

  data.push(newTask);
  fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), 'utf8');

  res.render('result', { task: newTask });
});

/* ---------- Level2: Registration routes ---------- */

// Show registration form
app.get('/register', (req, res) => {
  res.render('register', { errors: {}, old: {} });
  console.log("data",req.body);
});

// Handle registration POST
app.post('/register', (req, res) => {
  const { fullname, username, email, password, confirm_password } = req.body;

  // server-side validation
  const errors = {};
  if (!fullname || fullname.trim().length < 3) {
    errors.fullname = 'Full name must be at least 3 characters.';
  }
  const cleanUsername = (username || "").trim();

if (cleanUsername.length < 4 || !/^[\w\-]+$/.test(cleanUsername)) {
    errors.username = 'Username must be ≥4 chars and contain only letters, numbers, _ or -';
}

  const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (password !== confirm_password) {
    errors.confirm_password = 'Passwords do not match.';
  }

  // check username/email uniqueness in users.json
  const users = readJsonSafe(usersPath);
  if (users.find(u => u.username.toLowerCase() === (username || '').toLowerCase())) {
    errors.username = 'Username already taken.';
  }
  if (users.find(u => u.email.toLowerCase() === (email || '').toLowerCase())) {
    errors.email = 'Email already registered.';
  }

  if (Object.keys(errors).length > 0) {
    return res.render('register', { errors, old: { fullname, username, email }});
  }

  // Save new user (temporary: store plain password for Level-2; we'll hash in Level-6)
  const newUser = {
    id: Date.now(),
    fullname: fullname.trim(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: password, // NOTE: in Level-6 we'll hash this (bcrypt)
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');

  res.render('register-result', { user: { fullname: newUser.fullname, username: newUser.username, email: newUser.email }});
});

/* ---------- debug route (list users) - optional ---------- */
app.get('/_debug/users', (req, res) => {
  const users = readJsonSafe(usersPath);
  res.json(users);
});

// Show login page
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJsonSafe(usersPath);

  const found = users.find(u =>
    (u.username.toLowerCase() === username.toLowerCase() ||
     u.email.toLowerCase() === username.toLowerCase()) &&
    u.password === password
  );

  if (!found) {
    return res.render('login', { error: "Invalid username or password." });
  }

  // For now, store user in memory (level‑4 adds sessions)
  res.render('login-success', { user: found });
});

// at top with other requires
const apiRoutes = require('./routes/api');

// after app.use(express.static(...)) and before your render routes:
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
