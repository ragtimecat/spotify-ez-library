const { getAlbums } = require('../utils/services');
// eslint-disable-next-line no-unused-vars
const { syncLoadedAlbumsWithDB, getAllAlbumsFromDB } = require('../utils/db');

// @desc Get User's albums
// @route GET /albums
// @access Private
exports.albums = async (req, res) => {
  const access_token = req.cookies.token;

  const offset = req.query.offset || 0;
  const limit = 15;

  // await dbConnection();

  // Options: transfer_data, library_listing_data, all_data
  // eslint-disable-next-line no-unused-vars
  const { resultingData, numberOfAlbums } = await getAlbums(
    access_token,
    limit,
    false,
    'library_listing_data',
    offset
  );
  console.log(resultingData);

  // syncLoadedAlbumsWithDB(resultingData);

  // console.log(await getAllAlbumsFromDB());
  // eslint-disable-next-line no-unused-vars
  const pages_count = numberOfAlbums / limit;
  const albums = resultingData;

  res.render('pages/albums', {
    albums,
    access_token,
    pages_count,
    limit,
    noAlbums: false,
  });
  // res.send('hello');
};

// eslint-disable-next-line no-unused-vars
exports.syncWithDB = async (req, res) => {};
