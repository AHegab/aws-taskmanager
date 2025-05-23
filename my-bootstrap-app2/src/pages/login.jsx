// src/pages/login.js
import React, { useState } from 'react';
import Cookies from 'js-cookie';

const COGNITO = {
  domain:   'eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com',
  clientId: '6thkk9j96oa02djeccritml1gr',
  clientSecret: 'fndut3no3vqopsat6vo97hnrq40vtp2891vl07be8piavi46h8h'
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    // 1) Build the request body WITHOUT client_secret
    const body = new URLSearchParams({
      grant_type: 'password',
      username,
      password,
      scope: 'openid email profile'
    });

    // 2) Build Basic auth header
    const basicAuth = btoa(`${COGNITO.clientId}:${COGNITO.clientSecret}`);

    try {
      // 3) Send the POST with the Authorization header
      const resp = await fetch(
        `https://${COGNITO.domain}/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          },
          body: body.toString()
        }
      );

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg);
      }

      const data = await resp.json();

      // 4) Store tokens in cookies on this origin
      Cookies.set('idToken',     data.id_token,     { expires:1, secure:false, sameSite:'lax' });
      Cookies.set('accessToken', data.access_token, { expires:1, secure:false, sameSite:'lax' });
      if (data.refresh_token) {
        Cookies.set('refreshToken', data.refresh_token, { expires:30, secure:false, sameSite:'lax' });
      }

      // 5) Redirect to home
      window.location.href = '/';
    } catch(err) {
      console.error(err);
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <div style={{maxWidth:400,margin:'2rem auto'}}>
      <h2>Sign In</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label><br/>
          <input value={username}
                 onChange={e=>setUsername(e.target.value)} required />
        </div>
        <div style={{marginTop:8}}>
          <label>Password</label><br/>
          <input type="password"
                 value={password}
                 onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{marginTop:12}}>Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
