import { createRoot } from 'react-dom/client';
import './tailwindcss.css';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <App />
    // </StrictMode>,
);
