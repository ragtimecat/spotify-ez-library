const express = require('express');
const {
  albums
} = require('../controllers/Albums');

const router = express.Router();

// get user's albums
router.get('/albums', albums);

module.exports = router;