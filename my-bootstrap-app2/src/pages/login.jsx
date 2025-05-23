// src/pages/login.js
import Cookies from 'js-cookie';
import { useState } from 'react';

const COGNITO = {
  domain:   'eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com',
  clientId: '6u4cbji12b6do75n9nkbporvmc'  // <-- TaskManager-Public
};

export default function Login() {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    // Build the form body, including client_id but no secret:
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id:  COGNITO.clientId,
      username:   email,
      password:   pass,
      scope:      'openid email profile'
    });
    console.log('Form body:', body.toString());
    console.log('Cognito URL:', `https://${COGNITO.domain}/oauth2/token`);
    console.log('Cognito headers:', { 'Content-Type': 'application/x-www-form-urlencoded' });
    console.log('Cognito body:', body.toString());
    console.log('Cognito clientId:', COGNITO.clientId);
    console.log('Cognito clientSecret:', COGNITO.clientSecret);
    console.log('Cognito redirectUri:', COGNITO.redirectUri);
    console.log('Cognito scope:', 'openid email profile');
    console.log('Cognito response_type:', 'code');

    try {
      // Exchange creds for tokens
      const resp = await fetch(
        `https://${COGNITO.domain}/oauth2/token`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    body.toString()
        }
      );
      console.log('Response:', resp);

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText);
      }

      const data = await resp.json();

      // Persist tokens as cookies
      Cookies.set('idToken',     data.id_token,     { expires:1, sameSite:'lax' });
      Cookies.set('accessToken', data.access_token, { expires:1, sameSite:'lax' });
      if (data.refresh_token) {
        Cookies.set('refreshToken', data.refresh_token, { expires:30, sameSite:'lax' });
      }

      // Redirect home
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
          <input value={email}
                 onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div style={{marginTop:8}}>
          <label>Password</label><br/>
          <input type="password"
                 value={pass}
                 onChange={e=>setPass(e.target.value)} required />
        </div>
        <button type="submit" style={{marginTop:12}}>Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}
