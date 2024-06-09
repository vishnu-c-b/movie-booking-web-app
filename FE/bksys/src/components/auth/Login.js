import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import checkGuest from "./checkGuest";

function Login() {
  const [formData, setFormData] = useState({ username:"", password:"" });
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const attemptLogin = () => {
    axios
      .post("http://127.0.0.1:8000/log", formData)
      .then((response) => {
        setErrorMessage("");
        const user = {
          username: formData.username,
          token: response.data.token,
        };
        dispatch(setUser(user));
        if (user.username === "cb@admin.com") {
          navigate("/adminDash");
        } else {
          navigate("/home");
        }
        
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            setErrorMessage(Object.values(error.response.data.errors).join(" "));
          } else if (error.response.data.message) {
            setErrorMessage(error.response.data.message);
          } else {
            setErrorMessage("Failed to login user. Please contact admin.");
          }
        } else {
          setErrorMessage("An unexpected error occurred. Please try again later.");
        }
      });
  };

  return (
    <div>
      <div className="container">
        <div className="row">
          <div className="col-8 offset-2">
            <h1>Login</h1>
            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}
            <div className="form-group">
              <label>Email:</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <button
                className="btn btn-primary float-right"
                onClick={attemptLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default checkGuest(Login);
