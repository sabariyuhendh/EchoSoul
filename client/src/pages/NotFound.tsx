import React, { useEffect } from "react";
import { useLocation } from "wouter";

const NotFound = () => {
  const [location] = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location
    );
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-gray-300 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
