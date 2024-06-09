import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import checkGuest from "./checkGuest";

const RegisterComponent = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/reg", formData);

      if (response.status === 201) {
        console.log("User registered successfully:", response.data);
        setError("");
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        const { username, password1, password2 } = error.response.data;
        setError(`Validation errors: ${username}, ${password1}, ${password2}`);
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Error registering user:", error.response.data);
    }
  };

  return (
    <div>
      <div className="container">
        <h2>Register New User</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password1"
              className="form-control"
              value={formData.password1}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              name="password2"
              className="form-control"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button className="btn btn-primary float-right" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default  checkGuest(RegisterComponent);
