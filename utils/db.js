const { Pool} = require('pg');
const connectionString = process.env.DB_CONNECT;
  const pool = new Pool({
    connectionString
  })


exports.dbConnection = async (transferData) => {
  // const res = await getAllAlbums(pool);
  // console.log('albums');
  // console.log(res);
  await truncateTable('albums');
  // await truncateTable('albums', pool);
  // await insertUserAlbums();
  
  pool.end();
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