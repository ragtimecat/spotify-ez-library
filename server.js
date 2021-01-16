/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '..', '/.env') });
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
const fetch = require('node-fetch');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.get('/login', function (req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-library-read streaming user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function (req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          // console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.cookie('token', access_token).redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.cookie('token', access_token).send({
        'access_token': access_token
      });
    }
  });
});

app.get('/albums', async function (req, res) {
  // try {
  //   // const response = await fetch('	https://api.spotify.com/v1/me/albums/contains');
  //   // const albums = await response.json();
  //   const resp = await axios.get('https://api.spotify.com/v1/me/albums/contains');
  //   const albums = await resp.json();
  // } catch (err) {
  //   console.log(err.text);
  // }

  const access_token = req.cookies.token;

  const limit = 2;

  let response = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  const albums = await response.json();

  let names = [];
  albums.items.forEach(el => {
    let tracks = [];
    el.album.tracks.items.forEach(track => {
      tracks.push(track.name);
    })
    names.push({
      artist: el.album.artists[0].name,
      name: el.album.name,
      picture: el.album.images[2].url,
      tracks: tracks
    });
  });

  // <----Get ALL albums in library -->

  // let lastResult = albums;

  // do {
  //   response = await fetch(lastResult.next, {
  //     method: 'GET',
  //     headers: { 'Authorization': `Bearer ${access_token}` }
  //   });

  //   const data = await response.json();

  //   data.items.forEach(el => names.push(el.album.name));
  //   console.log('api call' + data.next);
  //   lastResult = data;
  // } while (lastResult.next !== null)

  // <-------All albums end ---->


  // res.send(albums);
  res.render('pages/about', { names });
});

const PORT = 5000;

console.log(`Listening on ${PORT}`);
app.listen(PORT);
