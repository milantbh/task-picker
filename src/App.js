import axios from 'axios';
import './App.css';
import loaderImg from './assets/dog.gif';
import Login from './Login';
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:5000' 
  : 'https://task-picker-api.onrender.com';

function App() {
  // 1. All Hooks at the top (Rule of Hooks)
  const [taskName, setTaskName] = useState("");
  const [weight, setWeight] = useState(1);
  const [taskList, setTaskList] = useState([]);
  const [result, setResult] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username')); // New state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  if (token) {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_BASE}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTaskList(res.data);
      } catch (err) {
        console.error("Failed to load tasks");
      }
    };
    fetchTasks();
  }
}, [token]);

  // 2. Updated Logout to clear username
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username'); // Clear username
    setToken(null);
    setUsername(null);
  };

  // 3. Updated Login wrapper to grab username from storage after login
  if (!token) {
    return (
      <Login 
        setToken={(t) => {
          setToken(t);
          setUsername(localStorage.getItem('username'));
        }} 
      />
    );
  }

  const addTask = async () => {
  if (taskName) {
    try {
      const res = await axios.post(`${API_BASE}/tasks`, 
        { name: taskName, weight: weight },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add the response (which includes the DB ID) to your list
      setTaskList([...taskList, res.data]);
      setTaskName("");
      setWeight(1);
    } catch (err) {
      alert("Could not save task.");
    }
  }
};

  const deleteTask = async (idToDelete) => {
  try {
    await axios.delete(`${API_BASE}/tasks/${idToDelete}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Remove from local state
    setTaskList(taskList.filter(t => t.id !== idToDelete));
  } catch (err) {
    alert("Could not delete task.");
  }
};

  const pickTask = async () => {
    setIsLoading(true);
    setResult(null);
    try {
      // Added Authorization header so the backend allows the request
      const response = await axios.post('https://task-picker-api.onrender.com/pick-task', 
        { tasks: taskList },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setResult(response.data.choice);
    } catch (error) {
      // If token is expired (401), force logout
      if (error.response && error.response.status === 401) {
        handleLogout();
      } else {
        alert("The server is waking up... please try again in 10 seconds!");
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="app-wrapper">
      {/* Personal Greeting Header */}
        <div className="user-nav">
          <span>Hi, <strong>{username}</strong>!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      <div className="main-card">
        

        <header>
          <h1>Decision Maker</h1>
        </header>

        <div className="input-section">
          <input 
            type="text"
            value={taskName} 
            onChange={(e) => setTaskName(e.target.value)} 
            placeholder="What's the task?" 
          />
          
          <div className="weight-control">
            <label>Priority: <span>{weight}</span></label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
            />
          </div>

          <button className="add-button" onClick={addTask}>Add to List</button>
        </div>

        <div className="list-container">
          {taskList.map((t) => {
            const totalWeight = taskList.reduce((sum, item) => sum + Number(item.weight), 0);
            const chance = ((t.weight / totalWeight) * 100).toFixed(0);
            
            return (
              <div key={t.id} className="task-row">
                <div className="task-info">
                  <span className="task-name">{t.name}</span>
                  <span className="task-chance">Chance: {chance}%</span>
                </div>
                <button 
                  className="delete-btn" 
                  onClick={() => deleteTask(t.id)}
                  title="Remove task"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        {taskList.length > 0 && (
          <div className="action-area">
            {isLoading ? (
              <div className="loading-state">
                <img src={loaderImg} className="custom-loader" alt="Loading..." />
                <p>One moment please... Waking up the server.</p>
              </div>
            ) : (
              <button className="decide-button" onClick={pickTask}>
                Pick My Task
              </button>
            )}
          </div>
        )}

        {result && (
          <div className="result-card">
            <small>The universe suggests:</small>
            <h2>{result}</h2>
            <h1>You are filled with determination.</h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;