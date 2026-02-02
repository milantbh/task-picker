import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

    
    
    try {
      // Replace with your actual Render backend URL
      const res = await axios.post(`${API_BASE}/register`, { 
  username, 
  password
      });

      if (!isRegistering && res.data.access_token) {
        // Save the "Key" to the browser
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('username', res.data.username);
        setToken(res.data.access_token);
      } else {
        setMessage("Registered successfully! Please login.");
        setIsRegistering(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">{isRegistering ? "Sign Up" : "Login"}</button>
      </form>
      
      <p onClick={() => setIsRegistering(!isRegistering)} style={{cursor: 'pointer', color: 'blue'}}>
        {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
      </p>
      {message && <p className="error-msg">{message}</p>}
    </div>
  );
};

export default Login;