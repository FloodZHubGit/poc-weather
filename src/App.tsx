import React from 'react';
import './App.css';
import { Weather } from './view/Weather';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Weather />
      </header>
    </div>
  );
}

export default App;