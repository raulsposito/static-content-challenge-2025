import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import ContentPage from './components/ContentPage';
import './App.css';

function App() {
  const [structure, setStructure] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStructure = () => {
    fetch('/api/structure')
      .then(response => response.json())
      .then(data => {
        setStructure(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  if (loading) return <div className="loading">Loading content structure...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <Router>
      <div className="app">
        <nav className="sidebar">
          <h2 className="sidebar-title">CRM Menu</h2>
          <Navigation structure={structure} refreshStructure={fetchStructure} />
        </nav>

        <div className="content">
          <header className="top-bar">
            <h1 className="site-title">Your Site Title</h1>
          </header>
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ContentPage path="" />} />
              <Route path="/:path/*" element={<DynamicContentRoute />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function DynamicContentRoute() {
  const remainingPath = window.location.pathname.substring(1);
  return <ContentPage path={remainingPath} />;
}

export default App;
