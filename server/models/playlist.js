// Playlist model
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const ObjectId = mongoose.Schema.Types.ObjectId;

const playlistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    user: { type: ObjectId, ref: "User", required: true },
    desc: { type: String, default: "" },
    songs: { type: Array, default: [] },
    img: { type: String, default: "" },
});

const validatePlaylist = (playlist) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().allow(""),
        songs: Joi.array().items(Joi.string()),
        img: Joi.string().allow(""),
    });
    return schema.validate(playlist);
};

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = { Playlist, validatePlaylist };
