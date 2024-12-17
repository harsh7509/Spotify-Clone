//routes/songs.js
const router = require("express").Router();
const { User } = require("../models/user");
const { Song, validateSong } = require("../models/song");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

// Create song
router.post("/", admin, async (req, res) => {
    const { error } = validateSong(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });
    
    const song = await Song(req.body).save();
    res.status(201).send({ data: song, message: "Song created successfully" });
});

// Get all songs
router.get("/", async (req, res) => {
    const songs = await Song.find();
    res.status(200).send({ data: songs });
});

// Update song
router.put("/:id", [validateObjectId, admin], async (req, res) => {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!song) return res.status(404).send({ message: "Song not found" });
    
    res.status(200).send({ data: song, message: "Song updated successfully" });
});

// Delete song
router.delete("/:id", [validateObjectId, admin], async (req, res) => {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) return res.status(404).send({ message: "Song not found" });

    res.status(200).send({ data: song, message: "Song deleted successfully" });
});

// Like song
router.put("/:id/like", [validateObjectId, auth], async (req, res) => {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).send({ message: "Song not found" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: "User not found" });

    // Ensure likedSongs is initialized
    user.likedSongs = user.likedSongs || [];
    
    const index = user.likedSongs.indexOf(song._id);
    let resMessage;

    if (index === -1) {
        user.likedSongs.push(song._id);
        resMessage = "Added to your liked songs";
    } else {
        user.likedSongs.splice(index, 1);
        resMessage = "Removed from your liked songs";  
    }
    
    await user.save();
    res.status(200).send({ message: resMessage });
});


// Get all liked songs
router.get("/liked", [auth], async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send({ message: "User not found" });

    const songs = await Song.find({ _id: user.likedSongs });
    res.status(200).send({ data: songs }); 
});

module.exports = router;
