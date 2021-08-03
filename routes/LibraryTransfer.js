const express = require('express');
const {
  transfer,
  saveSingleAlbum,
  // recipientsAlbums,
  getUserData,
  transferAlbumsToRecipient,
} = require('../controllers/LibraryTransfer');

const router = express.Router();

// transfer user's ablums to another acc
router.get('/transfer', transfer);
router.post('/save-single-album', saveSingleAlbum);
// router.post('/recipient-albums', recipientsAlbums);
router.post('/get-user-data', getUserData);
router.post('/transfer-albums-to-recipient', transferAlbumsToRecipient);

module.exports = router;
