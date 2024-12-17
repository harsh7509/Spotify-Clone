import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Joi from "joi";
import { login } from "../../redux/authSlice/apiCalls";
import TextField from "../../components/Inputs/TextField";
import Button from "../../components/Button";
import { Paper } from "@mui/material";
import styles from "./styles.module.scss";
import { toast } from "react-toastify"; // Import toast for notifications

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const { isFetching } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const schema = {
    email: Joi.string().email({ tlds: false }).required().label("Email"),
    password: Joi.string().required().label("Password"),
  };

  const handleInputState = (name, value) => {
    setData({ ...data, [name]: value });
  };

  const handleErrorState = (name, value) => {
    value === ""
      ? delete errors[name]
      : setErrors({ ...errors, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input data
    const result = Joi.object(schema).validate(data, { abortEarly: false });
    if (!result.error) {
      try {
        // Dispatch login action directly
        login(data, dispatch); // Pass data directly for login
      } catch (error) {
        console.error("Login failed", error.response?.data?.message || error.message);
        toast.error(error.response?.data?.message || "Login failed. Please try again."); // Show error message
      }
    } else {
      // Handle validation errors
      const errorMessages = {};
      result.error.details.forEach((err) => {
        errorMessages[err.path[0]] = err.message;
      });
      setErrors(errorMessages);
    }
  };

  return (
    <div className={styles.container}>
      <Paper className={styles.form_container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.heading}>Login</div>
          <div className={styles.input_container}>
            <TextField
              name="email"
              label="Email"
              value={data.email}
              handleInputState={handleInputState}
              handleErrorState={handleErrorState}
              error={errors.email}
              schema={schema.email}
              required={true}
            />
          </div>
          <div className={styles.input_container}>
            <TextField
              name="password"
              label="Password"
              value={data.password}
              handleInputState={handleInputState}
              handleErrorState={handleErrorState}
              error={errors.password}
              schema={schema.password}
              type="password"
              required={true}
            />
          </div>
          <div className={styles.btn_wrapper}>
            <Button type="submit" label="Submit" isFetching={isFetching} />
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
