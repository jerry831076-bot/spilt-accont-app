import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx'; // *** 將這一行改為 .jsx ***

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);