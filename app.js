// large number of modules required
var express = require('express');
    handlebars = require('express-handlebars').create({defaultLayout:'main'});
    app = express();
    // mysql = require('./dbcon.js');
    bodyParser = require("body-parser");
;

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);
app.use(express.static('public'));
app.use(bodyParser.json());

// set of strings to place into the app calls below
var selectTableQuery = "SELECT * FROM workout";
    insertRowQuery = "INSERT INTO workout (`exercise`, `reps`, `weight`, `units`, `date`) VALUES (?, ?, ?, ?, ?)";
    selectRowQuery = "SELECT * FROM workout where id=?";
    deleteRowQuery = "DELETE FROM workout WHERE id=?";
    updateRowQuery = "UPDATE workout SET exercise=?, reps=?, weight=?, units=?, date=? WHERE id=?";
;

// function that retrieves the current SQL info
var getItAll = (res) => {
  // function that obtains all the rows in the database
  mysql.pool.query(selectTableQuery, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    // obtain the table data and keep it as a rows variable
    res.json({rows: rows})
  });
};

// add a set to the workout
// app.post('/',(req,res,next) => {
//   // all the values from the post request
//   var { exercise, reps, weight, units, date, id } = req.body;
//   mysql.pool.query(insertRowQuery, 
//     [exercise, reps, weight, units, date, id], 
//     (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     getItAll(res);
//   });
// });

// get all the current rows in SQL
// app.get('/', (req,res,next) => {
//   mysql.pool.query(selectTableQuery, (err, rows, fields) => {
//     if(err){
//       next(err);
//       return;
//     }
//     res.render('home');
//   });
// });

// home
app.get('/beers', (req,res,next) => {
    res.render('beers');
});

app.get('/categories', (req,res,next) => {
  res.render('categories');
});

app.get('/beer_categories', (req,res,next) => {
  res.render('beer_categories');
});



// delete a row in SQL
// app.delete('/', (req,res,next) => {
//   mysql.pool.query(deleteRowQuery, [req.body.rowId], (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     getItAll(res);
//   });
// });

// update one row in the SQL database
// app.put('/', (req,res,next) => {
//   mysql.pool.query(selectRowQuery, [req.body.rowId], (err, result) => {
//     if(err){
//       next(err);
//       return;
//     }
//     if(result.length == 1){
//       var curVals = result[0];
//       mysql.pool.query(updateRowQuery,
//         [req.body.exercise || curVals.exercise, req.body.reps || curVals.reps, req.body.weight || curVals.weight,
//           req.body.units || curVals.units, req.body.date || curVals.date, req.body.id || curVals.id],
//         (err, result) => {
//         if(err){
//           next(err);
//           return;
//         }
//         getItAll(res);
//       });
//     }
//   });
// });

app.use((req,res) => {
  res.status(404);
  res.render('404');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), () => {
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});