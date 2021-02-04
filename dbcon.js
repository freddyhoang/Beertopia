var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_hoangf',
  password        : 'tBrVhBRzyz6i9R6',
  database        : 'cs340_hoangf'
});

module.exports.pool = pool;