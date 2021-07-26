const express = require('express');
const {
  transfer,
  addSingleAlbum
} = require('../controllers/LibraryTransfer');

const router = express.Router();

// transfer user's ablums to another acc
router.get('/transfer', transfer);
router.post('/add-single-album', addSingleAlbum);

module.exports = router;