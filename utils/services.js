const fetch = require('node-fetch');

// @desc Utility method/Get certain amount of user's ablums for transfering purposes
// @params
// access_token String - auth spotify token
// limit Int - limit rate for albums request, range from 1 to 50
// isAll Bool - true if we request the whole library, false if not
// Note: you will probably need more than one request in order to get
// full library, because you can get only 50 at one time. 
// So you need library_volume/limit amount of requests
// arrayShapeType String OPTIONAL - specifies how to format resulting array
// Options: transfer_data, library_listing_data, all_data
// offset Int OPTIONAL - The index of the first object to return. 
// Default: 0 (i.e., the first object).
exports.getAlbums = async (access_token, limit, isAll, arrayShapeType='all_data', offset) => {
  let queryString = `https://api.spotify.com/v1/me/albums?limit=${limit}`;

  if (offset || offset === 0) {
    queryString += `&offset=${offset}`;
  }

  console.log(queryString);

  let response = await fetch(queryString, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${access_token}` }
  });

  const albums = await response.json();
  
  const numberOfAlbums = albums.total;
  
  let resultingArray = [];

  //different formating options depending on param
  switch(arrayShapeType) {
    case 'transfer_data': {
      resultingArray = prepareDataForTransfer(albums);
      break;
    }
    case 'library_listing_data': {
      resultingArray = prepareDataForLibraryListing(albums);
      break;
    }
    case 'all_data': {
      resultingArray = albums;
      break;
    }
    default: {
      console.log('unacceptable argument passed');
    }
  }

  if (isAll) {
    let lastResult = albums;
    do {
      response = await fetch(lastResult.next, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      const data = await response.json();

      switch(arrayShapeType) {
        case 'transfer_data': {
          resultingArray = resultingArray.concat(prepareDataForTransfer(data));
          break;
        }
        case 'library_listing_data': {
          resultingArray = resultingArray.concat(prepareDataForLibraryListing(data));
          break;
        }
        case 'all_data': {
          resultingArray = resultingArray.concat(data);
          break;
        }
        default: {
          console.log('unacceptable argument passed');
        }
      }
      lastResult = data;
    } while (lastResult.next !== null)
  }
  return {
    resultingArray,
    numberOfAlbums
  };
}

// rearranging albums array from request in preparation for transfering
const prepareDataForTransfer = (albums) => {
  let transferChunk = []; 
  
  albums.items.forEach(el => {
    const artists = [];
    el.album.artists.forEach(artist => {
      artists.push(artist.name);
    })
    transferChunk.push({ 
      id: el.album.id,
      name: el.album.name,
      artists,
    })
  })

  return transferChunk;
}

const prepareDataForLibraryListing = (albums) => {
  let libraryChunk = [];
  albums.items.forEach(el => {
    let tracks = [];
    el.album.tracks.items.forEach(track => {
      tracks.push({ name: track.name, id: track.id });
    })
    libraryChunk.push({
      artist: el.album.artists[0].name,
      name: el.album.name,
      picture: el.album.images[2].url,
      tracks: tracks,
      link: el.album.external_urls.spotify
    });
  });

  return libraryChunk;
}