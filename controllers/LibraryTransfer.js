const fetch = require('node-fetch');

// @desc Transfer user's albums
// @route GET /transfer
// @access Private
exports.transfer = async (req, res) => {
  const access_token = req.cookies.token;
  const transferData = await getAllAlbums(access_token);
  dbConnection(transferData);
  res.render('pages/transfer', { transferData });
}

// @desc Add single album by id
// @route GET /add-single-album
// @access Private
exports.addSingleAlbum = async (req, res) => {
  console.log(req.body);
  console.log('im here');
  res.status(200).json({
    success: true,
    data: {}
  })
}


// @desc Utility method/Get all user's ablums for transfering purposes
const getAllAlbums = async (access_token) => {
  let response = await fetch(`https://api.spotify.com/v1/me/albums?limit=50`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  const albums = await response.json();
  
  let transfer_array = [];
  albums.items.forEach(el => {
    const artists = [];
    el.album.artists.forEach(artist => {
      artists.push(artist.name);
    })
    transfer_array.push({ 
      id: el.album.id,
      name: el.album.name,
      artists,
      })
  })

  // let lastResult = albums;
  // do {
  //   response = await fetch(lastResult.next, {
  //     method: 'GET',
  //     headers: { 'Authorization': `Bearer ${access_token}` }
  //   });

  //   const data = await response.json();

  //   data.items.forEach(el => {
  //     const artists = [];
  //     el.album.artists.forEach(artist => {
  //       artists.push(artist.name);
  //     })
  //     transfer_array.push({ 
  //       id: el.album.id,
  //       name: el.album.name,
  //       artists
  //       })
  //   })

  //   lastResult = data;
  // } while (lastResult.next !== null)

  return transfer_array;
}

const dbConnection = async (transferData) => {
  const connectionString = process.env.DB_CONNECT;
  const { Pool} = require('pg')
  const pool = new Pool({
    connectionString
  })

  await pool.query('TRUNCATE albums');       

  let insertQueryString = 'INSERT INTO albums (album_id, name, artist) VALUES';
  
  let dataPreparedForQuery = [];
  transferData.forEach((el, index) => {
    insertQueryString += ` ($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}),`;
    dataPreparedForQuery.push(el.id);
    dataPreparedForQuery.push(el.name);
    dataPreparedForQuery.push(el.artists[0]);
  })
  insertQueryString = insertQueryString.slice(0, -1) + ';';

  pool.query(insertQueryString, dataPreparedForQuery, (err, res) => {
    if(err) {
      console.log(err);
    }
    pool.end();
  })  
}
