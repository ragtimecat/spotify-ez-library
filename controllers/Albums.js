const { getAlbums } = require('../utils/services');
// eslint-disable-next-line no-unused-vars
const { syncLoadedAlbumsWithDB, getAllAlbumsFromDB } = require('../utils/db');

// @desc Get User's albums
// @route GET /albums
// @access Private
exports.albums = async (req, res) => {
  const accessToken = req.cookies.token;

  const offset = req.query.offset || 0;
  const limit = 15;

  // Options: transfer_data, library_listing_data, all_data
  const { resultingData, numberOfAlbums } = await getAlbums(
    accessToken,
    limit,
    false,
    'library_listing_data',
    offset
  );
  console.log(resultingData);

  // syncLoadedAlbumsWithDB(resultingData);

  // console.log(await getAllAlbumsFromDB());
  const pagesCount = numberOfAlbums / limit;
  const albums = resultingData;

  // await dbConnection();
  res.render('pages/albums', {
    albums,
    accessToken,
    pagesCount,
    limit,
    noAlbums: false,
  });
  // res.send('hello');
};

// eslint-disable-next-line no-unused-vars
exports.syncWithDB = async (req, res) => {};
