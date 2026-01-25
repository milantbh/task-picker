import React, { useState } from 'react';
import axios from 'axios';

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

  const pickTask = async () => {
    try {
      const response = await axios.post('https://task-picker-api.onrender.com/pick-task', {
        tasks: taskList
      });
      setResult(response.data.choice);
    } catch (error) {
      console.error("Error picking task", error);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Weighted Task Decider</h1>
      
      <div style={{ marginBottom: '20px' }}>
  <input 
    value={taskName} 
    onChange={(e) => setTaskName(e.target.value)} 
    placeholder="Task name..." 
  />

  {/* The Slider */}
  <label style={{ marginLeft: '15px' }}>
    Priority: {weight}
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={weight} 
      onChange={(e) => setWeight(e.target.value)} 
      style={{ verticalAlign: 'middle', marginLeft: '10px' }}
    />
  </label>

  <button onClick={addTask} style={{ marginLeft: '15px' }}>Add Task</button>
</div>

      <ul>
        {taskList.map((t, i) => (
          <li key={i}>{t.name} (Weight: {t.weight})</li>
        ))}
      </ul>

      {taskList.length > 0 && (
        <button onClick={pickTask} style={{ padding: '10px 20px', fontSize: '1.2rem', cursor: 'pointer' }}>
          Roll the Dice!
        </button>
      )}

      {result && (
        <div style={{ marginTop: '30px', color: 'blue' }}>
          <h2>The winner is: {result}</h2>
        </div>
      )}
    </div>
  );
}

export default App;