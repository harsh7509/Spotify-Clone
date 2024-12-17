import { Fragment, useState } from "react";
import axiosInstance from "../../redux/axiosInstance";
import Song from "../../components/Song";
import Playlist from "../../components/Playlist";
import { IconButton, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "./styles.module.scss";

const Search = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({ songs: [], playlists: [] });
  const [isFetching, setIsFetching] = useState(false);

  const handleSearch = async ({ currentTarget: input }) => {
    setSearch(input.value);
    setResults({ songs: [], playlists: [] }); // Clear results before fetching new ones
    try {
      setIsFetching(true);
      const url = `http://localhost:8080/api/search?query=${input.value}`;
      const { data } = await axiosInstance.get(url);
      setResults(data); // Ensure that 'data' has a structure of { songs: [], playlists: [] }
      setIsFetching(false);
    } catch (error) {
      console.log(error);
      setIsFetching(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.search_input_container}>
        <IconButton>
          <SearchIcon />
        </IconButton>
        <input
          type="text"
          placeholder="Search for songs and playlists"
          onChange={handleSearch}
          value={search}
        />
        <IconButton onClick={() => setSearch("")}>
          <ClearIcon />
        </IconButton>
      </div>

      {isFetching && (
        <div className={styles.progress_container}>
          <CircularProgress style={{ color: "#1ed760" }} size="5rem" />
        </div>
      )}

      {results.songs && results.songs.length !== 0 && (
        <div className={styles.songs_container}>
          {results.songs.map((song) => (
            <Fragment key={song._id}>
              <Song song={song} />
            </Fragment>
          ))}
        </div>
      )}

      {results.playlists && results.playlists.length !== 0 && (
        <div className={styles.playlists_container}>
          <Playlist playlists={results.playlists} />
        </div>
      )}
    </div>
  );
};

export default Search;
