import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthRedirect() {
  useEffect(() => {
    // Construct Cognito URL with `localhost` callback + EC2 IP in `state`
    const cognitoUrl = new URL(
      'https://eu-north-1u8wcgtv8c.auth.eu-north-1.amazoncognito.com/login'
    );

    const params = new URLSearchParams({
      client_id: '6thkk9j96oa02djeccritml1gr',
      response_type: 'code',
      scope: 'email openid profile',
      redirect_uri: 'http://localhost:3000/callback', // Must match Cognito config
      state: 'http://16.170.172.194:3000', // 👈 Final destination
    });

    // Redirect to Cognito
    window.location.href = `${cognitoUrl}?${params}`;
  }, []);

  return <div>Redirecting to login...</div>;
}