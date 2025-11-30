const express = require("express");
const path = require("path");
const app = express();

app.use(express.urlencoded({ extended: true }));

let tempStorage = [];   // temporary storage

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/submit", (req, res) => {
    const { name, email, age } = req.body;

    // 🔍 SERVER-SIDE VALIDATION
    if (!name || name.length < 3) {
        return res.send("Server: Name must be at least 3 characters.");
    }

    if (!email.includes("@")) {
        return res.send("Server: Invalid email.");
    }

    if (age < 18) {
        return res.send("Server: Minimum age is 18.");
    }

    // ✔ If all valid → store in temporary storage
    tempStorage.push({ name, email, age });

    res.send(`Form submitted successfully! Current stored users: ${tempStorage.length}`);
});
    

app.listen(3000, () => console.log("Server running on port 3000"));
