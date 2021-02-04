// large number of modules required
var express = require('express');
    handlebars = require('express-handlebars').create({defaultLayout:'main'});
    app = express();
    mysql = require('./dbcon.js');
    bodyParser = require("body-parser");
;

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9876);
app.use(express.static('public'));
app.use(bodyParser.json());

// set of strings to place into the app calls below
var selectBeers = "SELECT b.beer_id, b.beer_name, b.brewery, b.abv, b.ibu, AVG(r.rating_value) AS avg_rating FROM Beers b LEFT JOIN Ratings r ON b.beer_id = r.beer_id GROUP by b.beer_id";
    insertBeer = "INSERT INTO Beers (`beer_name`, `brewery`, `abv`, `ibu`) VALUES (?, ?, ?, ?)";
    selectBeerById = "SELECT * FROM Beers where beer_id=?";
    deleteBeer = "DELETE FROM Beers WHERE beer_id=?";
    updateBeer = "UPDATE Beers SET beer_name=?, brewery=?, abv=?, ibu=? WHERE beer_id=?";
;

//function that retrieves current Beer info for a specific brewery
var beersBrews = (req, res) => {
  var brewery = req.body.brewery;
  if(brewery === undefined || brewery === 'View All'){
    selectBeersByBrewery =  "SELECT * FROM (SELECT b.beer_id, b.beer_name, b.brewery, b.abv, b.ibu, AVG(r.rating_value) AS avg_rating FROM Beers b LEFT JOIN Ratings r ON b.beer_id = r.beer_id GROUP by b.beer_id) as f WHERE f.brewery IS NOT NULL";
  } else {
    selectBeersByBrewery = "SELECT * FROM (SELECT b.beer_id, b.beer_name, b.brewery, b.abv, b.ibu, AVG(r.rating_value) AS avg_rating FROM Beers b LEFT JOIN Ratings r ON b.beer_id = r.beer_id GROUP by b.beer_id) as f WHERE f.brewery = ?";
    
  }
  // function that obtains all the rows in the database
  mysql.pool.query(selectBeersByBrewery, [brewery], (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    // obtain the table data and keep it as a rows variable
    res.json({rows: rows})
  });
};

//function that retrieves all Beer info
var getAllBeers = (res) => {
  // function that obtains all the rows in the database
  mysql.pool.query(selectBeers, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    // obtain the table data and keep it as a rows variable
    res.json({rows: rows})
  });
};

// add a set to the Beers
app.post('/beers',(req,res,next) => {
  // all the values from the post request
  var {beer_name, brewery, abv, ibu} = req.body;
  mysql.pool.query(insertBeer, [beer_name, brewery, abv, ibu], (err, ret) => {
    if(err){
      next(err);
      return;
    }
    getAllBeers(res);
  });
});

// get all rows in Beers
app.get('/beers', (req,res,next) => {
  mysql.pool.query(selectBeers, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
      
    res.render('beers');
  });
});

// delete a row for Beers
app.delete('/beers', (req,res,next) => {
  mysql.pool.query(deleteBeer, [req.body.beer_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    
    beersBrews(req, res);
  });
});

// update one row for Beers
app.put('/beers', (req,res,next) => {
  mysql.pool.query(selectBeerById, [req.body.beer_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query(updateBeer,
        [req.body.beer_name || curVals.beer_name, req.body.brewery || curVals.brewery, req.body.abv || curVals.abv,
          req.body.ibu || curVals.ibu, req.body.beer_id || curVals.beer_id],
        (err, result) => {
        if(err){
          next(err);
          return;
        }
        getAllBeers(res);
      });
    }
  });
});

<<<<<<< Updated upstream
app.get('/', (req,res,next) => {
  res.render('home');
=======
// add a set to Categories
app.post('/categories',(req,res,next) => {
  // all the values from the post request
  if(req.body.category == ''){
    return;
  }

  mysql.pool.query(insertCategory, [req.body.category], (err, ret) => {
    if(err){
      next(err);
      return;
    }
    getTable(res, selectCategories);
  });
>>>>>>> Stashed changes
});

app.get('/categories', (req,res,next) => {
  res.render('categories');
});

app.get('/beer_categories', (req,res,next) => {
  res.render('beer_categories');
});

app.get('/users', (req,res,next) => {
  res.render('users');
});

app.get('/ratings', (req,res,next) => {
  res.render('ratings');
});

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
  console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});