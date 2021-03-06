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
exports.getAlbums = async (
  accessToken,
  limit,
  isAll,
  arrayShapeType = 'all_data',
  offset
) => {
  let queryString = `https://api.spotify.com/v1/me/albums?limit=${limit}`;

  if (offset || offset === 0) {
    queryString += `&offset=${offset}`;
  }

  console.log(queryString);

  let response = await fetch(queryString, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const albums = await response.json();

  const numberOfAlbums = albums.total;

  let resultingData = [];
  if (arrayShapeType === 'library_listing_data') {
    resultingData = {
      albums: [],
      tracks: [],
    };
  }

  // different formating options depending on param
  switch (arrayShapeType) {
    case 'transfer_data': {
      resultingData = prepareDataForTransfer(albums);
      break;
    }
    case 'library_listing_data': {
      resultingData = prepareDataForLibraryListingOld(albums);
      break;
    }
    case 'all_data': {
      resultingData = albums.items;
      break;
    }
    default: {
      console.log('unacceptable argument passed');
    }
  }

  if (isAll) {
    let lastResult = albums;
    do {
      // eslint-disable-next-line no-await-in-loop
      response = await fetch(lastResult.next, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // eslint-disable-next-line no-await-in-loop
      const data = await response.json();

      switch (arrayShapeType) {
        case 'transfer_data': {
          resultingData = resultingData.concat(prepareDataForTransfer(data));
          break;
        }
        case 'library_listing_data': {
          resultingData = resultingData.concat(
            prepareDataForLibraryListingOld(data)
          );
          break;
        }
        case 'all_data': {
          resultingData = resultingData.concat(data.items);
          break;
        }
        default: {
          console.log('unacceptable argument passed');
        }
      }
      lastResult = data;
    } while (lastResult.next !== null);
  }
  return {
    resultingData,
    numberOfAlbums,
  };
};

// @ desc Save individual album to user's library
// @params
// access_token String - oauth spotify token
// albumId String - spotify's id of album to add
exports.addSingleAlbum = async (accessToken, albumId) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/albums`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: [albumId],
      }),
    });
    return response.status;
  } catch (e) {
    console.log(e);
    return e.message;
  }
};

// @ desc Get user's name and id
// @params
// access_token String - oauth spotify token
exports.getUserData = async (accessToken) => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const parsedResponse = await response.json();
  return {
    name: parsedResponse.display_name,
    id: parsedResponse.id,
  };
};

// rearranging albums array from request in preparation for transfering
const prepareDataForTransfer = (albums) => {
  const transferChunk = [];

  albums.items.forEach((el) => {
    const artists = [];
    el.album.artists.forEach((artist) => {
      artists.push(artist.name);
    });
    transferChunk.push({
      id: el.album.id,
      name: el.album.name,
      artists,
    });
  });

  return transferChunk;
};

// New version of function for complete database sync
// eslint-disable-next-line no-unused-vars
const prepareDataForLibraryListing = (albums) => {
  const libraryChunk = [];
  const tracks = [];
  albums.items.forEach((el) => {
    el.album.tracks.items.forEach((track) => {
      tracks.push({ album_id: el.album.id, name: track.name, id: track.id });
    });
    libraryChunk.push({
      id: el.album.id,
      artist: el.album.artists[0].name,
      name: el.album.name,
      big_picture: el.album.images[1].url,
      small_picture: el.album.images[2].url,
      link: el.album.external_urls.spotify,
    });
  });

  return {
    albums: libraryChunk,
    tracks,
  };
};

// Old version of function used just for compatability with ejs template
// Delete it when react frontend is ready
const prepareDataForLibraryListingOld = (albums) => {
  const libraryChunk = [];
  albums.items.forEach((el) => {
    const tracks = [];
    el.album.tracks.items.forEach((track) => {
      tracks.push({ name: track.name, id: track.id });
    });
    libraryChunk.push({
      artist: el.album.artists[0].name,
      name: el.album.name,
      picture: el.album.images[2].url,
      tracks,
      link: el.album.external_urls.spotify,
    });
  });

  return libraryChunk;
};
