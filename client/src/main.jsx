import './index.css'

import ReactDOM from 'react-dom/client'
import { ToastBar } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
        <ToastBar/>
    </BrowserRouter>
)
