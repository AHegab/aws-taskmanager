// src/pages/LoginErrorPage.js
import { useLocation } from 'react-router-dom';

export default function LoginErrorPage() {
  const params = new URLSearchParams(useLocation().search);
  const error = params.get('error');
  
  return (
    <div>
      <h2>Login Error</h2>
      <p>{error || 'Unknown error occurred'}</p>
      <a href="/">Return to home</a>
    </div>
  );
}