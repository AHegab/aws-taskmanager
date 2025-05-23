import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

// Configuration - update these values with your actual Cognito settings
const COGNITO_CONFIG = {
  domain: 'eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com',
  clientId: '6thkk9j96oa02djeccritml1gr',
  redirectUri: 'http://ec2-13-61-180-35.eu-north-1.compute.amazonaws.com/callback',
  tokenEndpoint: '/oauth2/token',
  clientSecret: 'fndut3no3vqopsat6vo97hnrq40vtp2891vl07be8piavi46h8h' // if confidential
};

export default function Callback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthentication = async () => {
      console.log('Handling authentication callback...');

      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Authentication error:', {
          error: error,
          description: params.get('error_description'),
          uri: params.get('error_uri')
        });
        navigate(`/login?error=${error}`);
        return;
      }

      if (!code) {
        console.error('Missing authorization code');
        navigate('/login?error=missing_code');
        return;
      }

      try {
        console.log('Exchanging authorization code for tokens...');

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

        console.log('Token exchange successful:', {
          access_token: !!response.data.access_token,
          id_token: !!response.data.id_token,
          refresh_token: !!response.data.refresh_token
        });

        // Store tokens securely
        Cookies.set('idToken', response.data.id_token, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        Cookies.set('accessToken', response.data.access_token, {
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        if (response.data.refresh_token) {
          Cookies.set('refreshToken', response.data.refresh_token, {
            expires: 30,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
        }

        // ✅ Trigger backend Lambda to send SES verification
        try {
          const verifyResponse = await axios.post(
            'https://xppo00vwz7.execute-api.eu-north-1.amazonaws.com/prod/auth/callback', // TODO: Replace with your actual API Gateway endpoint
            {},
            {
              headers: {
                Authorization: `Bearer ${response.data.id_token}`
              }
            }
          );
          console.log('SES verification triggered:', verifyResponse.data);
        } catch (error) {
          console.error('SES verification failed:', error.response?.data || error.message);
        }

        navigate('/');

      } catch (err) {
        console.error('Token exchange failed:', {
          message: err.message,
          response: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            data: err.config?.data
          }
        });

        let errorMessage = 'token_exchange_failed';
        if (err.response) {
          if (err.response.status === 400) {
            errorMessage = err.response.data.error || 'invalid_request';
          } else if (err.response.status === 401) {
            errorMessage = 'invalid_client';
          }
        }

        navigate(`/login?error=${errorMessage}`);
      }
    };

    handleAuthentication();
  }, [location, navigate]);

  return (
    <div className="callback-container">
      <h2>Processing Authentication...</h2>
      <p>Please wait while we complete your login.</p>
      <div className="spinner"></div>
    </div>
  );
}
