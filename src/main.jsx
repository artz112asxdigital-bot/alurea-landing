import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

// Sem StrictMode: evita criar/destruir os contextos WebGL duas vezes no dev.
createRoot(document.getElementById('root')).render(<App />);
