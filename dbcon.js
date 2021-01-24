var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_hoangf',
  password        : 'JD2Vz4vMwWSzWoRX',
  database        : 'cs340_hoangf'
});

module.exports.pool = pool;