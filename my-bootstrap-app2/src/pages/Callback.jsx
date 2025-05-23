import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

export const COGNITO_CONFIG = {
  domain: 'eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com',
  clientId: '6thkk9j96oa02djeccritml1gr',
  redirectUri: 'http://localhost:3000/callback', // Must match Navbar's redirect_uri
  tokenEndpoint: '/oauth2/token',
  clientSecret: 'fndut3no3vqopsat6vo97hnrq40vtp2891vl07be8piavi46h8h' // Replace with your actual secret
};

export default function Callback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthentication = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');
      const state = params.get('state') || 'http://16.170.172.194:3000';

      if (error) {
        navigate(`/login?error=${error}`);
        return;
      }

      if (!code) {
        navigate('/login?error=missing_code');
        return;
      }

      try {
        const tokenParams = new URLSearchParams();
        tokenParams.append('grant_type', 'authorization_code');
        tokenParams.append('client_id', COGNITO_CONFIG.clientId);
        tokenParams.append('code', code);
        tokenParams.append('redirect_uri', COGNITO_CONFIG.redirectUri);
        
        if (COGNITO_CONFIG.clientSecret) {
          tokenParams.append('client_secret', COGNITO_CONFIG.clientSecret);
        }

        const response = await axios.post(
          `https://${COGNITO_CONFIG.domain}${COGNITO_CONFIG.tokenEndpoint}`,
          tokenParams.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 10000
          }
        );

        // Store tokens
        Cookies.set('idToken', response.data.id_token, { secure: true, sameSite: 'lax' });
        Cookies.set('accessToken', response.data.access_token, { secure: true, sameSite: 'lax' });
        if (response.data.refresh_token) {
          Cookies.set('refreshToken', response.data.refresh_token, { secure: true, sameSite: 'lax' });
        }

        // Redirect to final destination from state
        window.location.href = state;

      } catch (err) {
        console.error('Authentication failed:', err);
        navigate('/login?error=auth_failed');
      }
    };

    handleAuthentication();
  }, [location, navigate]);

  return (
    <div className="callback-container">
      <h2>Processing Authentication...</h2>
      <p>Please wait while we complete your login.</p>
    </div>
  );
}