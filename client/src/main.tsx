import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Improved error handling - log all errors for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Only prevent default for specific known issues
  if (event.error?.message?.includes('Cannot read properties of undefined')) {
    console.warn('Caught runtime error:', event.error.message);
    // Don't prevent default - let it be logged
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Only prevent default for specific known issues
  if (event.reason?.message?.includes('Cannot read properties of undefined')) {
    console.warn('Caught unhandled rejection:', event.reason.message);
    // Don't prevent default - let it be logged
  }
});

// Ensure root element exists before mounting
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="color: white; padding: 20px; background: black;">Error: Root element not found. Please check the HTML.</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('React app mounted successfully');
  } catch (error) {
    console.error('Failed to mount React app:', error);
    rootElement.innerHTML = `
      <div style="color: white; padding: 20px; background: black; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="text-align: center;">
          <h1 style="color: red; margin-bottom: 20px;">Failed to Load App</h1>
          <p style="color: #ccc; margin-bottom: 10px;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}
