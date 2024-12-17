import React, { Fragment, useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getSongs } from "../../redux/audioPlayer/apicalls"; 
import Song from "../../components/Song/index"; 
import Playlist from "../../components/Playlist/index"; 
import styles from "./styles.module.scss";
import axiosInstance from "../../redux/axiosInstance"; 

const Home = () => {
    const [firstPlaylists, setFirstPlaylists] = useState([]);
    const [secondPlaylists, setSecondPlaylists] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const dispatch = useDispatch();

    // Use optional chaining and default values
    const songs = useSelector((state) => state.songs?.songs || []);
    const { loading, error } = useSelector((state) => state.songs || {});

    // Fetch songs on component mount
    useEffect(() => {
		const fetchSongs = async () => {
			try {
				const response = await getSongs(dispatch);
				console.log(response); // Log the response to check its structure
			} catch (err) {
				console.error("Error fetching songs:", err);
			}
		};
		
        fetchSongs();
    }, [dispatch]);

    // Fetch random playlists from the API
    const getRandomPlaylists = async () => {
        try {
            setIsFetching(true);
            const url = `${process.env.REACT_APP_API_URL}/playlists/random`;
            const { data } = await axiosInstance.get(url);
            const array1 = data.data.splice(0, 4);
            const array2 = data.data;
            setFirstPlaylists(array1);
            setSecondPlaylists(array2);
        } catch (error) {
            console.error("Error fetching playlists:", error);
        } finally {
            setIsFetching(false);
        }
    };

    // Fetch random playlists on component mount
    useEffect(() => {
        getRandomPlaylists();
    }, []);

    // Handle loading and error states
    if (loading) return <p>Loading songs...</p>;
    if (error) return <p>Error loading songs.</p>;

    return (
        <Fragment>
            {isFetching ? (
                <div className={styles.progress_container}>
                    <CircularProgress style={{ color: "#1ed760" }} size="5rem" />
                </div>
            ) : (
                <div className={styles.container}>
                    <h1>Good afternoon</h1>
                    <div className={styles.playlists_container}>
                        <Playlist playlists={firstPlaylists} />
                    </div>
                    <h1>Just the hits</h1>
                    <div className={styles.playlists_container}>
                        <Playlist playlists={secondPlaylists} />
                    </div>
                    <div>
                        {songs.length > 0 ? (
                            songs.map((song) => <Song key={song._id} song={song} />)
                        ) : (
                            <p>No songs available</p>
                        )}
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default Home;
