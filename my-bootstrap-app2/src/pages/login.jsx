import React, { useState } from 'react';
import Cookies from 'js-cookie';

const COGNITO = {
  domain:   'eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com',
  clientId: '6thkk9j96oa02djeccritml1gr'
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const body = new URLSearchParams({
        grant_type: 'password',
        client_id:  COGNITO.clientId,
        username,
        password,
        scope: 'openid email profile'
      });

      const resp = await fetch(
        `https://${COGNITO.domain}/oauth2/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        }
      );
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg);
      }
      const data = await resp.json();
      // store cookies on this IP origin
      Cookies.set('idToken',     data.id_token,    { expires:1, secure:false, sameSite:'lax' });
      Cookies.set('accessToken', data.access_token,{ expires:1, secure:false, sameSite:'lax' });
      if (data.refresh_token) {
        Cookies.set('refreshToken', data.refresh_token, { expires:30, secure:false, sameSite:'lax' });
      }
      // redirect into your app
      window.location.href = '/';
    } catch(err) {
      console.error(err);
      setError('Login failed: ' + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Sign In</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label><br/>
          <input value={username}
                 onChange={e=>setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password</label><br/>
          <input type="password"
                 value={password}
                 onChange={e=>setPassword(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
