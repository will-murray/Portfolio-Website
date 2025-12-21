import { useEffect, useRef, useState } from 'react';
import './App.css';
import FractalApp from './fractalLIB/FractalCanvas';


function App() {


  const [keyPressed, setKeyPressed] = useState(null);

  useEffect(() => {
    const handle = e => setKeyPressed(e.key);
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);


  return (
    <div className="App">
      <header className="App-header">
        <FractalApp 
        keyPressed={keyPressed}
        />

      </header>
      
    </div>
  );
}

export default App;
