import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../index.css';
import Connect from './Connect';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Connect />
  </React.StrictMode>
);