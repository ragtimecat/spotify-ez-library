const querystring = require('querystring');
const request = require('request'); // "Request" library
require('dotenv').config({ path: './config/.env' });

const generateRandomString = require('../utils/generateRandomString');
// .env variables
const stateKey = process.env.STATEKEY;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

// @desc Login User through Spotify API
// @route GET /login
// @access Public
exports.login = async (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope =
    'user-read-private user-read-email user-library-read user-library-modify streaming user-modify-playback-state';
  res.redirect(
    `https://accounts.spotify.com/authorize?${querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state,
    })}`
  );
};

// @desc Get Spotify API access and refresh token
// @route GET /callback
// @access Public
exports.callback = async (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect(
      `/#${querystring.stringify({
        error: 'state_mismatch',
      })}`
    );
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString('base64')}`,
      },
      json: true,
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const { access_token: accessToken, refresh_token: refreshToken } = body;

        // we can also pass the token to the browser to make requests from there
        res
          .cookie('token', accessToken)
          .cookie('refresh_token', refreshToken)
          .redirect('/#logged');
      } else {
        res.redirect('/#logged');
      }
    });
  }
};

// @desc Refresh Spotify API access token
// @route GET /refresh_token
// @access Public
exports.refreshToken = async (req, res) => {
  // requesting access token from refresh token
  const refreshToken = req.query.refresh_token;
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString('base64')}`,
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    },
    json: true,
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const accessToken = body.access_token;
      res.cookie('token', accessToken).send({
        access_token: accessToken,
      });
    }
  });
};
