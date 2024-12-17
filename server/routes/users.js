//routes/users.js
const router = require("express").Router(); 
const { User, validate } = require("../models/user.js");
const bcrypt = require("bcrypt");
const auth = require('../middleware/auth.js');
const admin = require("../middleware/admin.js");
const validObjectid = require("../middleware/validateObjectId.js");

// Create user
router.post("/", async (req, res) => {
    try {
        // Validate request body
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if user already exists
        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(403).send({ message: "User email already exists" });

        // Hash the password
        const salt = await bcrypt.genSalt(Number(process.env.SALT)); 
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new user
        let newUser = new User({
            ...req.body,
            password: hashedPassword,
        });

        // Save the new user
        await newUser.save();

        // Remove sensitive fields from the response
        newUser.password = undefined;
        newUser.__v = undefined;

        // Send success response
        res.status(200).send({ data: newUser, message: "Account created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

// Get all users (admin-only)
router.get("/", admin, async (req, res) => {
    try {
        const users = await User.find().select("-password -__v");
        res.status(200).send({ data: users });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

// Get user by ID (auth required)
router.get("/:id", [validObjectid, auth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -__v");
        if (!user) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ data: user });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});


// Update user by ID (auth required)
router.put("/:id", [validObjectid, auth], async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select("-password -__v");
        
        if (!user) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ data: user });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

// Delete user by ID (auth required)
router.delete("/:id", [validObjectid, auth], async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });
        res.status(200).send({ message: "Successfully deleted" });
    } catch (error) {
        res.status(500).send({ message: "Internal server error", error: error.message });
    }
});

module.exports = router;
