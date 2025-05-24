// src/components/Login.js
import { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const resp = await fetch(`${API_BASE}/auth/token`, {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ username: email, password }),
      });

      console.log('→ API Response:', resp.status, resp.statusText);
      // read the JSON once
      const payload = await resp.json();
      console.log('→ API Response Body:', payload);

      if (!resp.ok) {
        throw new Error(payload.error || payload.message || resp.statusText);
      }

      // payload.cookies is an array of strings like:
      // "idToken=<longjwt>; HttpOnly; Secure; ...",
      // "accessToken=…; HttpOnly; …", "refreshToken=…; HttpOnly; …"
      payload.cookies.forEach(cookieString => {
        // grab "<name>=<value>" before the first ";" and re‐set as JS cookie
        const [nameValue] = cookieString.split(';');
        document.cookie = `${nameValue}; Path=/;`;
      });

      // redirect on success
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto' }}>
      <h2>Sign In</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>
        <button type="submit" style={{ marginTop: 12 }}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
