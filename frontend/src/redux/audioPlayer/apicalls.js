import axiosInstance from "../axiosInstance";
import { getSongsStart, getSongsSuccess, getSongsFailure } from "./songslice";

// Example getSongs function
export const getSongs = async (dispatch) => {
    try {
        const response = await axiosInstance.get(apiUrl + "/songs" ); // Adjust your endpoint
        dispatch({
            type: 'GET_SONGS_SUCCESS',
            payload: response.data, // Make sure this matches your expected data structure
        });
    } catch (error) {
        dispatch({
            type: 'GET_SONGS_FAILURE',
            payload: error.message,
        });
    }
};
