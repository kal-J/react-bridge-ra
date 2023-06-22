import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { IonApp } from '@ionic/react';

import '@ionic/react/css/core.css';
import { setupIonicReact } from '@ionic/react';

setupIonicReact();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <IonApp>
      <App />
    </IonApp> 
  </React.StrictMode>
);
