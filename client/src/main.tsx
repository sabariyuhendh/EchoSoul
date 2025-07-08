import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error boundary for better error handling
window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('Cannot read properties of undefined')) {
    console.warn('Caught runtime error:', event.error.message);
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Cannot read properties of undefined')) {
    console.warn('Caught unhandled rejection:', event.reason.message);
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
