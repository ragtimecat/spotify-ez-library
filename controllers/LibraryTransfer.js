const fetch = require('node-fetch');

let transferAlbumsDataSave = [];

// @desc Transfer user's albums
// @route GET /transfer
// @access Private
exports.transfer = async (req, res) => {
  const access_token = req.cookies.token;
  const transferData = await getAllAlbums(access_token);
  transferAlbumsDataSave = transferData;
  const userData = await getUserData(access_token);
  // dbConnection(transferData);
  // console.log('transfer data in memory');
  res.render('pages/transfer', { transferData, userData });
}

exports.transferAlbumsToRecipient = async (req, res) => {
  const recipientAccessToken = req.body.access_token; 
  // let albumIdsArray = [];
  // // transferAlbumsDataSave.forEach(el => {
  // //   albumIdsArray.push(el.id);
  // // });

  const limit = 50;

  if(transferAlbumsDataSave.length > limit) {
    console.log('have to make it in cycle');
  }

  for (i = 0; i < Math.ceil(transferAlbumsDataSave.length/limit); i++) {
    let slice_border = '';
    if ((transferAlbumsDataSave.length - i*limit) < limit && transferAlbumsDataSave.length % limit < (i + 1)*limit) {
      slice_border = transferAlbumsDataSave.length % limit + i*limit;
    } else {
      slice_border = (i+1)*limit;
    }
    const tempArray = transferAlbumsDataSave.slice(i*limit, slice_border);

    let transferChunkArray = [];
    tempArray.forEach(el => {
      transferChunkArray.push(el.id);
    }) 
  

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/albums`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${recipientAccessToken}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          ids: transferChunkArray
        })

      });
      console.log(response);
    } catch (e) {
      console.log(e);
    }

  }

  res.status(200).json({
    success: true,
    data: {}
  })
}

// @desc Add single album by id
// @route GET /add-single-album
// @access Private
exports.addSingleAlbum = async (req, res) => {
  const access_token = req.cookies.token;

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/albums`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        ids: [req.body.albumId]
      })

    });
    console.log(response);
  } catch (e) {
    console.log(e);
  }


  res.status(200).json({
    success: true,
    data: {}
  })
}

// @desc Get Recipient User's Albums
// @route GET /recipient-albums
// @access Private
exports.recipientsAlbums = async (req, res) => {
  const access_token = req.body.token;
  console.log(access_token);
  // const albums = await getAllAlbums(access_token);
  // res.status(200).json({
  //   success: true,
  //   data: albums
  // })
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


// @desc Get User Data
// @route POST /get-user-data
// @access Private
exports.getUserData = async (req, res) => {
  const access_token = req.body.token;
  const data = await getUserData(access_token);
  res.status(200).json({
    success: true,
    data
  })
}

const getUserData = async (token) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const parsedResponse = await response.json();
  return { 
    name: parsedResponse.display_name,
    email: parsedResponse.email
  };
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
