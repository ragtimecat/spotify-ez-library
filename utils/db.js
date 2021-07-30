const { Pool} = require('pg');
const connectionString = process.env.DB_CONNECT;
  const pool = new Pool({
    connectionString
  })

exports.syncLoadedAlbumsWithDB = async (loadedData) => {
  // insertAlbums(loadedData.albums);
  console.log(loadedData.tracks);
  insertTracks(loadedData.tracks);
}

exports.getAllAlbumsFromDB = async () => {
  return await getAllAlbums();
}

exports.dbConnection = async (transferData) => {
  // const res = await getAllAlbums(pool);
  // console.log('albums');
  // console.log(res);
  // await truncateTable('albums');
  // await truncateTable('albums', pool);
  // await insertUserAlbums();
  // pool.end();
}

const getAllAlbums = async () => {
  const res = await pool.query('SELECT * FROM albums');
  return res;
}

const truncateTable = async (tableName) => {
  await pool.query('TRUNCATE albums');
}

const insertUserAlbums = async (albums) => {
  let insertQueryString = 'INSERT INTO albums (album_id, name, artist) VALUES';
  
  let dataPreparedForQuery = [];
  albums.forEach((el, index) => {
    insertQueryString += ` ($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}),`;
    dataPreparedForQuery.push(el.id);
    dataPreparedForQuery.push(el.name);
    dataPreparedForQuery.push(el.artists[0]);
  })
  insertQueryString = insertQueryString.slice(0, -1) + ';';

  pool.query(insertQueryString, dataPreparedForQuery, (err, res) => {
    if(err) {
      console.log(err);
    }
  })  
}

const isnertQueryBuilder = (tableName, rowNames, data) => {
  let insertQueryString = `INSERT INTO ${tableName} (`;
  const preparedArray = [];
  rowNames.forEach(name => {
    insertQueryString += `${name}, `;
  })
  insertQueryString = insertQueryString.slice(0, -2) + ') VALUES (';

  const rowLength = rowNames.length;

  data.forEach((singleItem, index) => {
    let singleItemIndex = 0;
    for (const prop in singleItem) {
      preparedArray.push(singleItem[prop])
      insertQueryString += `$${index * rowLength + singleItemIndex + 1}, `;
      singleItemIndex ++;
    }
    insertQueryString = insertQueryString.slice(0, -2) + '), (';
  })
  insertQueryString = insertQueryString.slice(0, -3) + ';';

  return {
    insertQueryString,
    preparedArray
  };
}

const insertTracks = async (loadedTracks) => {
  const { insertQueryString, preparedArray } = isnertQueryBuilder('tracks', ['album_id', 'name', 'id'], loadedTracks);
  // console.log(insertQueryString);
  // console.log(preparedArray);
  await pool.query(insertQueryString, preparedArray);
}

const insertAlbums = async (loadedAlbums) => {
  const { insertQueryString, preparedArray } = isnertQueryBuilder('albums', 
    ['id', 'artist', 'name', 'big_picture', 'small_picture', 'link'], loadedAlbums);
  await pool.query(insertQueryString, preparedArray);
}