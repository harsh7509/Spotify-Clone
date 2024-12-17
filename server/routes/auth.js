//routes/auth.js
const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");

// Login user
router.post("/", async (req, res) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send({ message: "Invalid email or password" });

        // Compare password with the hashed password in the database
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).send({ message: "Invalid email or password" });

        // Generate auth token (assuming you have a method on the User model to generate tokens)
        const token = user.generateAuthToken();

        // Send success response with token
        res.status(200).send({ data: token, message: "Signing in, please wait..." });
    } catch (error) {
        // Handle any other errors
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
