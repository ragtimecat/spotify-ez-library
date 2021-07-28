const { response } = require('express');
const fetch = require('node-fetch');
const {
  getAlbums,
  addSingleAlbum,
  getUserData
} = require('../utils/services');
const {
  dbConnection
} = require('../utils/db');


let transferAlbumsDataSave = [];

// @desc Transfer user's albums
// @route GET /transfer
// @access Private
exports.transfer = async (req, res) => {
  const access_token = req.cookies.token;
  const limit = 5;

  // Options: transfer_data, library_listing_data, all_data
  const { resultingArray: transferData, numberOfAlbums } = await getAlbums(access_token, limit, false, 'transfer_data');

  transferAlbumsDataSave = transferData;

  const userData = await getUserData(access_token);
  // dbConnection(transferData);
  res.render('pages/transfer', { transferData, userData, numberOfAlbums });
}

exports.transferAlbumsToRecipient = async (req, res) => {
  const recipientAccessToken = req.body.access_token; 

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

// @desc Save single album by id
// @route POST /save-single-album
// @access Private
exports.saveSingleAlbum = async (req, res) => {
  // if access_token not present, then it defaults to host/donor token 
  const { albumId, access_token = req.cookies.token } = req.body;
  
  const responseStatus = await addSingleAlbum(access_token, albumId);
  if (responseStatus === 200) {
    res.status(200).json({
      succes: true,
      data: {}
    })
  } else {
    res.status(500).json({
      succes: false,
      data: { message: 'something went wrong' }
    })
  }
}

// @desc Get Recipient User's Albums
// @route GET /recipient-albums
// @access Private
exports.recipientsAlbums = async (req, res) => {
  const access_token = req.body.token;
  console.log(access_token);
  // idle for now
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

