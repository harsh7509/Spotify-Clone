//song.js
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const songSchema = new mongoose.Schema({
    name: { type: String, required: true },
    artist: { type: String, required: true },
    song: { type: String, required: true },  // Assuming this field holds song URL or path
    img: { type: String, required: true },
    duration: { type: Number, required: true },  // Duration in seconds or milliseconds
});

const validateSong = (song) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        artist: Joi.string().required(),
        song: Joi.string().required(),
        img: Joi.string().required(),
        duration: Joi.number().required(),
    });
    return schema.validate(song);
};

const Song = mongoose.model("Song", songSchema);

module.exports = { Song, validateSong };
