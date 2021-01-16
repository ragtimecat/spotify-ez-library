/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const dotenv = require('dotenv');
const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const fetch = require('node-fetch');

const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const generateRandomString = require('./utils/generateRandomString');

//import routes
const spotifyOAuth = require('./routes/SpotifyOAuth');
const albums = require('./routes/Albums');

// setting up env 
dotenv.config({ path: './config/.env' });

// api connect data
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = process.env.REDIRECT_URI; // Your redirect uri


const stateKey = 'spotify_auth_state';

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
};

//setting public folder
app.use(express.static(__dirname + '/public'));



// app.get('/login', function (req, res) {

//   var state = generateRandomString(16);
//   res.cookie(stateKey, state);

//   // your application requests authorization
//   var scope = 'user-read-private user-read-email user-library-read streaming user-modify-playback-state';
//   res.redirect('https://accounts.spotify.com/authorize?' +
//     querystring.stringify({
//       response_type: 'code',
//       client_id: client_id,
//       scope: scope,
//       redirect_uri: redirect_uri,
//       state: state
//     }));
// });

// app.get('/callback', function (req, res) {

//   // your application requests refresh and access tokens
//   // after checking the state parameter

//   var code = req.query.code || null;
//   var state = req.query.state || null;
//   var storedState = req.cookies ? req.cookies[stateKey] : null;

//   if (state === null || state !== storedState) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     res.clearCookie(stateKey);
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };

//     request.post(authOptions, function (error, response, body) {
//       if (!error && response.statusCode === 200) {

//         var access_token = body.access_token,
//           refresh_token = body.refresh_token;

//         var options = {
//           url: 'https://api.spotify.com/v1/me',
//           headers: { 'Authorization': 'Bearer ' + access_token },
//           json: true
//         };

//         // use the access token to access the Spotify Web API
//         request.get(options, function (error, response, body) {
//           // console.log(body);
//         });

//         // we can also pass the token to the browser to make requests from there
//         res.cookie('token', access_token).redirect('/#' +
//           querystring.stringify({
//             access_token: access_token,
//             refresh_token: refresh_token
//           }));
//       } else {
//         res.redirect('/#' +
//           querystring.stringify({
//             error: 'invalid_token'
//           }));
//       }
//     });
//   }
// });

// app.get('/refresh_token', function (req, res) {

//   // requesting access token from refresh token
//   var refresh_token = req.query.refresh_token;
//   var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//     form: {
//       grant_type: 'refresh_token',
//       refresh_token: refresh_token
//     },
//     json: true
//   };

//   request.post(authOptions, function (error, response, body) {
//     if (!error && response.statusCode === 200) {
//       var access_token = body.access_token;
//       res.cookie('token', access_token).send({
//         'access_token': access_token
//       });
//     }
//   });
// });

// app.get('/albums', async function (req, res) {
//   const access_token = req.cookies.token;

//   const limit = 2;

//   let response = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}`, {
//     method: 'GET',
//     headers: { 'Authorization': `Bearer ${access_token}` }
//   });

//   const albums = await response.json();

//   let names = [];
//   albums.items.forEach(el => {
//     let tracks = [];
//     el.album.tracks.items.forEach(track => {
//       tracks.push(track.name);
//     })
//     names.push({
//       artist: el.album.artists[0].name,
//       name: el.album.name,
//       picture: el.album.images[2].url,
//       tracks: tracks
//     });
//   });

//   // <----Get ALL albums in library -->

//   // let lastResult = albums;

//   // do {
//   //   response = await fetch(lastResult.next, {
//   //     method: 'GET',
//   //     headers: { 'Authorization': `Bearer ${access_token}` }
//   //   });

//   //   const data = await response.json();

//   //   data.items.forEach(el => names.push(el.album.name));
//   //   console.log('api call' + data.next);
//   //   lastResult = data;
//   // } while (lastResult.next !== null)

//   // <-------All albums end ---->


//   //res.send(albums);
//   res.render('pages/about', { names });
// });

app.use(spotifyOAuth);
app.use(albums);

const PORT = process.env.PORT || 5000;

console.log(`Listening on ${PORT}`);
app.listen(PORT);
