const fetch = require('node-fetch');
const {
  getAlbums
} = require('../utils/services');

// @desc Get User's albums
// @route GET /albums
// @access Private
exports.albums = async (req, res) => {
  const access_token = req.cookies.token;

  const offset = req.query.offset || 0;
  const limit = 15;

  console.log(offset);
  
  const { resultingArray: albums, numberOfAlbums } = await getAlbums(access_token, limit, false, 'library_listing_data', offset);

  const pages_count = numberOfAlbums/limit;

  res.render('pages/about', { albums, access_token, pages_count, limit });
}

