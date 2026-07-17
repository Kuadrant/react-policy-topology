import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import '@patternfly/patternfly/patternfly.css';
import loadConfig from './config.js';

// Function to render the React application
const renderApp = (config) => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App config={config} />
    </React.StrictMode>
  );
};

// Load configuration and then render the app
loadConfig()
  .then((config) => {
    console.log('Configuration loaded:', config);
    renderApp(config);
  })
  .catch((error) => {
    console.error('Failed to load configuration:', error);
    // Optionally, render a fallback UI or message
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Failed to load configuration.</h1>
          <p>Please try refreshing the page.</p>
        </div>
      </React.StrictMode>
    );
  });
