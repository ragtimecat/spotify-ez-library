const fetch = require('node-fetch');

// @desc Get User's albums
// @route GET /albums
// @access Private
exports.albums = async (req, res) => {
  const access_token = req.cookies.token;
  console.log(req.query.offset);

  const offset = req.query.offset || 0;
  const limit = 5;

  let response = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  // console.log(access_token);

  const albums = await response.json();

  console.log(albums);

  const pages_count = albums.total/limit;

  
  let names = [];
  albums.items.forEach(el => {
    let tracks = [];
    el.album.tracks.items.forEach(track => {
      tracks.push({ name: track.name, id: track.id });
    })
    names.push({
      artist: el.album.artists[0].name,
      name: el.album.name,
      picture: el.album.images[2].url,
      tracks: tracks,
      link: el.album.external_urls.spotify
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
  res.render('pages/about', { names, access_token, pages_count, limit });
}

