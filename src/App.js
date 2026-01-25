import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import loaderImg from './assets/dog.gif';

function App() {
  const [taskName, setTaskName] = useState("");
  const [weight, setWeight] = useState(1);
  const [taskList, setTaskList] = useState([]);
  const [result, setResult] = useState(null);

  const addTask = () => {
    if (taskName) {
      // Store as an object
      setTaskList([...taskList, { name: taskName, weight: weight }]);
      setTaskName("");
      setWeight(1);
    }
  };

  const deleteTask = (indexToDelete) => {
  const updatedList = taskList.filter((_, index) => index !== indexToDelete);
  setTaskList(updatedList);
};

 const [isLoading, setIsLoading] = useState(false); // Add this state

const pickTask = async () => {
  setIsLoading(true); // Start loading
  setResult(null);    // Clear old result
  try {
    const response = await axios.post('https://task-picker-api.onrender.com/pick-task', {
      tasks: taskList
    });
    setResult(response.data.choice);
  } catch (error) {
    alert("The server is waking up... please try again in 10 seconds!");
  } finally {
    setIsLoading(false);
  }
};

return (
  <div className="app-wrapper">
    <div className="main-card">
      <header>
        <h1>Decision Maker</h1>
        <p>Assign weight to your choices</p>
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
  {taskList.map((t, i) => {
    const totalWeight = taskList.reduce((sum, item) => sum + Number(item.weight), 0);
    const chance = ((t.weight / totalWeight) * 100).toFixed(0);
    
    return (
      <div key={i} className="task-row">
        <div className="task-info">
          <span className="task-name">{t.name}</span>
          <span className="task-chance">Chance: {chance}%</span>
        </div>
        <button 
          className="delete-btn" 
          onClick={() => deleteTask(i)}
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
              <p>One moment please...</p>
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