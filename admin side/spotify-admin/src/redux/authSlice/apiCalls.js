import axios from "axios";
import jwt_decode from "jwt-decode";
import { toast } from "react-toastify";
import { loginStart, loginSuccess, loginFailure } from "./index";

// Correct API URL
const apiUrl = "http://localhost:8080/api/login";

export const login = async (user, dispatch) => {
  dispatch(loginStart()); // Start login process
  try {
    // Make API call to login endpoint
    const { data } = await axios.post(apiUrl, user);

    // Log the data to verify the structure
    console.log("Response from API:", data);

    // Check if data contains the token
    if (!data || !data.data) {
      throw new Error("No token received from the server.");
    }

    // Decode the JWT token (assuming it's in data.data)
    const decodedToken = jwt_decode(data.data);
    console.log("Decoded JWT:", decodedToken);

    // Check if the user is an admin
    if (!decodedToken.isAdmin) {
      toast.error("You don't have admin access.");
      dispatch(loginFailure()); // Dispatch failure action
      return; // Stop further execution
    }

    // Show success message and store token
    toast.success(data.message);

    // Dispatch login success action with user data and token
    dispatch(loginSuccess({ ...decodedToken, token: data.data }));

    // Redirect to home page after successful login
    window.location = "/";
    
  } catch (error) {
    // Log error details for debugging
    console.error("Login Error:", error.response ? error.response.data : error.message);

    // Handle login failure and display error message
    dispatch(loginFailure());
    if (error.response) {
      if (error.response.status >= 400 && error.response.status < 500) {
        toast.error(error.response.data.message || "Invalid credentials.");
      } else {
        toast.error("An error occurred during login. Please try again later.");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
  }
};
