// auth-server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const AWS        = require('aws-sdk');

const app = express();
app.use(cors());               // allow your React origin
app.use(bodyParser.json());    // parse JSON payloads

// configure AWS SDK
AWS.config.update({ region: 'eu-north-1' });
const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = 'eu-north-1_U8WCGtv8c';
const CLIENT_ID    = '6u4cbji12b6do75n9nkbporvmc';

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const params = {
      AuthFlow:       'ADMIN_USER_PASSWORD_AUTH',
      UserPoolId:     USER_POOL_ID,
      ClientId:       CLIENT_ID,
      AuthParameters: { USERNAME: username, PASSWORD: password }
    };

    const result = await cognito.adminInitiateAuth(params).promise();

    // result.AuthenticationResult contains tokens
    return res.json({
      id_token:      result.AuthenticationResult.IdToken,
      access_token:  result.AuthenticationResult.AccessToken,
      refresh_token: result.AuthenticationResult.RefreshToken,
    });

  } catch (err) {
    console.error('Login error:', err);
    // hide exact error for security in prod
    return res.status(401).json({ error: 'Invalid credentials' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth proxy listening on port ${PORT}`);
});
