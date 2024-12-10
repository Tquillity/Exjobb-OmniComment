// src/pages/externalConnectMain.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import ExternalConnect from './externalConnect';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ExternalConnect />
  </React.StrictMode>
);