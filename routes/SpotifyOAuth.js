const express = require('express');
const {
  login,
  callback,
  refreshToken,
} = require('../controllers/SpotifyOAuth');

const router = express.Router();

// spotify login
router.get('/login', login);
// callback function for spotify oAuth
router.get('/callback', callback);
// spotify access token refresh
router.get('/refresh_token', refreshToken);

module.exports = router;
