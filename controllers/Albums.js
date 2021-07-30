const fetch = require('node-fetch');
const {
  getAlbums
} = require('../utils/services');
const {
  dbConnection,
  syncLoadedAlbumsWithDB,
  getAllAlbumsFromDB
} = require('../utils/db');

let albumsLoaded = [];

// @desc Get User's albums
// @route GET /albums
// @access Private
exports.albums = async (req, res) => {
  const access_token = req.cookies.token;

  const offset = req.query.offset || 0;
  const limit = 15;

  // await dbConnection();

  // Options: transfer_data, library_listing_data, all_data
  const { resultingData, numberOfAlbums } = await getAlbums(access_token, limit, false, 'library_listing_data', offset);

  // syncLoadedAlbumsWithDB(resultingData);

  console.log(await getAllAlbumsFromDB());
  resultingDataLoaded = resultingData;
  const pages_count = numberOfAlbums/limit;

  // res.render('pages/albums', { resultingData.albums, access_token, pages_count, limit, noAlbums: false });
  res.send('hello');
}

exports.syncWithDB = async (req, res) => {
  
}