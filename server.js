/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const cookieParser = require('cookie-parser');

// import routes
const spotifyOAuth = require('./routes/SpotifyOAuth');
const albums = require('./routes/Albums');
const transfer = require('./routes/LibraryTransfer');

// setting up env
dotenv.config({ path: './config/.env' });

// api connect data
// const client_id = process.env.CLIENT_ID; // Your client id
// const client_secret = process.env.CLIENT_SECRET; // Your secret
// const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri

// const stateKey = 'spotify_auth_state';

const app = express();

// temp enabled ejs for testing purposes
app.set('view engine', 'ejs');

// cors
app.use(cors());

// cookie parser
app.use(cookieParser());

// logging middleware. only in dev mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// setting public folder
app.use(express.static(path.join(__dirname, 'public/')));

// body parser from requests
app.use(express.json());

// routes
app.use(spotifyOAuth);
app.use(albums);
app.use(transfer);

const PORT = process.env.PORT || 5000;

// eslint-disable-next-line no-console
console.log(`Listening on ${PORT}`);
app.listen(PORT);
