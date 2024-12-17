import { createSlice } from "@reduxjs/toolkit";

export const songSlice = createSlice({
    name: "songs",
    initialState: {
        songs: [],
        loading: false,
        error: false,
    },
    reducers: {
        getSongsStart: (state) => {
            state.loading = true;
        },
        getSongsSuccess: (state, action) => {
            state.loading = false;
            state.songs = action.payload;
        },
        getSongsFailure: (state) => {
            state.loading = false;
            state.error = true;
        },
    },
});

export const { getSongsStart, getSongsSuccess, getSongsFailure } = songSlice.actions;
export default songSlice.reducer;
