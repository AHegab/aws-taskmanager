import { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL;  // e.g. https://k8xh767ord.execute-api.eu-north-1.amazonaws.com/yarab

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
        credentials: 'include',    // ← so browser picks up the HttpOnly cookies
        body:        JSON.stringify({ username: email, password })
      });
      console.log(JSON.stringify({ username: email, password }))
      console.log('→ API Response:', resp.status, resp.statusText);
      console.log('→ API Response Headers:', resp.headers.get('set-cookie'));
      console.log('→ API Response Body:', await resp.text());
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || resp.statusText);
      }

      // success! tokens are in cookies
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'2rem auto' }}>
      <h2>Sign In</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label><br/>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required style={{width:'100%'}}
          />
        </div>
        <div style={{marginTop:8}}>
          <label>Password</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required style={{width:'100%'}}
          />
        </div>
        <button type="submit" style={{marginTop:12}}>Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
