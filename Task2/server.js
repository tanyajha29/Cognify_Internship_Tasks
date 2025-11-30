const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const storageFile = path.join(__dirname, "data", "storage.json");

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.render("index", { errors: {}, old: {} });
});

app.post("/submit", (req, res) => {
  const { fullname, username, email, password } = req.body;

  let errors = {};

  // -------- SERVER-SIDE VALIDATION --------
  if (!fullname || fullname.length < 3) {
    errors.fullname = "Full Name must be at least 3 characters.";
  }

  if (!username || username.length < 4) {
    errors.username = "Username must be at least 4 characters.";
  }

  const emailPattern = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email || "")) {
    errors.email = "Enter a valid email address.";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  // If errors → show form again
  if (Object.keys(errors).length > 0) {
    return res.render("index", {
      errors,
      old: { fullname, username, email }
    });
  }

  // ---------- STORE DATA IN storage.json ----------
  const fileData = JSON.parse(fs.readFileSync(storageFile, "utf-8"));
  fileData.push({ fullname, username, email, password });
  fs.writeFileSync(storageFile, JSON.stringify(fileData, null, 2));

  // Successful response
  res.render("result", { fullname, username, email });
});

// ---------- SERVER START ----------
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
