import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="475515716539-3hr5brnc6abg27bh5abl0ib1ple1sjd6.apps.googleusercontent.com">
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
