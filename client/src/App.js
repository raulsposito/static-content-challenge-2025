// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ContentPage from './components/ContentPage';

function App() {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the content structure from the API
    fetch('/api/structure')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch structure');
        }
        return response.json();
      })
      .then(data => {
        setStructure(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading content structure...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Router>
      <div className="app">
        <header>
          <h1>Your Site Title</h1>
          <Navigation structure={structure} />
        </header>
        
        <main>
          <Routes>
            <Route path="/" element={<ContentPage path="" />} />
            <Route path="/:path/*" element={<DynamicContentRoute />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

// Component to handle dynamic routes
function DynamicContentRoute() {
  const remainingPath = window.location.pathname.substring(1); // Get the full path without leading '/'
  console.log("🚀 ~ DynamicContentRoute ~ remainingPath:", remainingPath)
  
  return <ContentPage path={remainingPath} />;
}

export default App;