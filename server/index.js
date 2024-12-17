//index.js
require('dotenv').config(); // Load environment variables from .env file
require("express-async-errors");
const express = require('express');
const cors = require('cors');
const path = require('path'); // Required to serve static files
const connection = require("./db");
const userRoutes = require('./routes/users');
const authRoutes = require("./routes/auth");
const songsRoutes = require("./routes/songs"); 
const playlistRoutes = require("./routes/playlist");
const searchRoutes = require("./routes/songs");

const app = express();
connection(); // Connect to the database

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/login", authRoutes);
app.use("/api/songs", songsRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/search", searchRoutes);

// Serve the React app in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong!' });
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
