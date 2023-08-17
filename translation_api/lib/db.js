const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '1225',
    database: 'translations_db',
  });

console.log('Connected to DB');
module.exports = connection;