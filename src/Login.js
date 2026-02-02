import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');


  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Ensure this matches your actual Render URL
    const API_BASE = "https://task-picker-api.onrender.com"; 
    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      const res = await axios.post(`${API_BASE}${endpoint}`, { 
        username, 
        password
      });

      // If we are logging in, we expect a token
      if (!isRegistering && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('username', res.data.username);
        setToken(res.data.access_token);
      } else if (isRegistering) {
        // If we just registered, switch to login mode
        setMessage("Registered successfully! Please login.");
        setIsRegistering(false);
        setPassword('');
      }
    } catch (err) {
      // This helps you see the REAL error in the UI
      console.error("Full Error:", err);
      setMessage(err.response?.data?.msg || "Connection to server failed.");
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