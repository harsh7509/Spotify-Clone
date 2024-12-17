//routes/playlist.js
const router = require("express").Router();
const { User } = require("../models/user");
const { Playlist, validatePlaylist } = require("../models/playlist");
const { Song } = require("../models/song");
const auth = require("../middleware/auth");
const validObjectid = require("../middleware/validateObjectId");

const Joi = require("@hapi/joi");
//create
router.post("/", auth, async (req, res) => {
    try {
        const { error } = validatePlaylist(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        const newPlaylist = new Playlist({ ...req.body, user: user._id });
        await newPlaylist.save();

        if (!user.playlists) user.playlists = [];  // Ensure playlists array exists
        user.playlists.push(newPlaylist._id);  // Push the new playlist to user's playlists
        await user.save();

        res.status(201).send({ data: newPlaylist });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Something went wrong!" });
    }
});



// Edit playlist
router.put("/edit/:id", [auth, validObjectid], async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().allow(""),
        img: Joi.string().allow(""),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send("Playlist not found");

    const user = await User.findById(req.user._id);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({ message: "User doesn't have access to edit" });

    playlist.name = req.body.name;
    playlist.desc = req.body.desc;
    playlist.img = req.body.img;
    await playlist.save();
    res.status(200).send({ message: "Updated successfully" });
});

// Add songs to playlist
router.put("/addsong/:id", [auth, validObjectid], async (req, res) => {
    // Validate the song ID from the request body
    const schema = Joi.object({
        songId: Joi.string().required(),  // Only validate songId
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // Find the user and playlist
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.params.id);  // Get playlist ID from URL parameter
    if (!playlist) return res.status(404).send({ message: "Playlist not found" });

    // Check if the playlist belongs to the user
    if (!user._id.equals(playlist.user)) {
        return res.status(403).send({ message: "User doesn't have access to add song" });
    }

    // Add song if it's not already in the playlist
    if (!playlist.songs.includes(req.body.songId)) {
        playlist.songs.push(req.body.songId);
        await playlist.save();
        res.status(200).send({ data: playlist, message: "Song added successfully" });
    } else {
        res.status(400).send({ message: "Song already exists in the playlist" });
    }
});




// Delete song from playlist
router.delete("/removesong/:id", [auth, validObjectid], async (req, res) => {
    const schema = Joi.object({
        songId: Joi.string().required(),
        playlistId: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({ message: "User doesn't have access to remove song" });

    const index = playlist.songs.indexOf(req.body.songId);
    if (index !== -1) {
        playlist.songs.splice(index, 1);
    }
    await playlist.save();
    res.status(200).send({ data: playlist, message: "Song removed successfully" });
});


// User favorite playlist
router.get("/favourite", [auth], async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user.playlists || user.playlists.length === 0) return res.status(404).send("No favorite playlists found.");

    const playlists = await Playlist.find({ _id: { $in: user.playlists } });
    res.status(200).send({ data: playlists });
});

// Get random playlist
router.get("/random", auth, async (req, res) => {
    const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);
    res.status(200).send({ data: playlists });
});

// Get playlist by id
router.get("/:id", [auth, validObjectid], async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ message: "Playlist not found" });

    const songs = await Song.find({ _id: { $in: playlist.songs } });
    res.status(200).send({ data: { playlist, songs } });
});

// Get all playlists
router.get("/", [auth], async (req, res) => {
    const playlists = await Playlist.find();
    res.status(200).send({ data: playlists });
});

// Delete playlist by ID
router.delete("/:id", [auth, validObjectid], async (req, res) => {
    try {
        // Find the user based on the token
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).send({ message: "User not found" });

        // Ensure that user.playlists is initialized as an array
        if (!user.playlists) user.playlists = [];

        // Find the playlist by the ID provided in the URL
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).send({ message: "Playlist not found" });

        // Check if the user has the rights to delete the playlist
        if (!user._id.equals(playlist.user)) {
            return res.status(403).send({ message: "User doesn't have access to delete this playlist" });
        }

        // Delete the playlist
        await Playlist.deleteOne({ _id: playlist._id });

        // Remove the playlist from the user's playlist array
        const index = user.playlists.indexOf(playlist._id);
        if (index > -1) {
            user.playlists.splice(index, 1); // Remove playlist from user data
            await user.save(); // Save the updated user data
        }

        res.status(200).send({ message: "Playlist removed successfully" });
    } catch (error) {
        console.error(error); // Log any unexpected errors
        res.status(500).send({ message: "Something went wrong!" });
    }
});


module.exports = router;
