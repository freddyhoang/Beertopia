// large number of modules required
var express = require('express');
    handlebars = require('express-handlebars').create({defaultLayout:'main'});
    app = express();
    mysql = require('./dbcon.js');
    bodyParser = require("body-parser"); 

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 5550);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.use('/', express.static('public'));



// set of queries to place into the app calls below
// beers Page
var selectBeers = "SELECT b.beer_id, b.beer_name, b.brewery, b.abv, b.ibu, AVG(r.rating_value) AS avg_rating FROM Beers b LEFT JOIN Ratings r ON b.beer_id = r.beer_id GROUP by b.beer_id";
    insertBeer = "INSERT INTO Beers (`beer_name`, `brewery`, `abv`, `ibu`) VALUES (?, ?, ?, ?)";
    selectBeerById = "SELECT * FROM Beers WHERE beer_id=?";
    deleteBeer = "DELETE FROM Beers WHERE beer_id=?";
    updateBeer = "UPDATE Beers SET beer_name=?, brewery=?, abv=?, ibu=? WHERE beer_id=?";
    // Categories page
    selectCategories = "SELECT * FROM Categories";
    insertCategory = "INSERT INTO Categories (`category_name`) VALUES (?)";
    selectCategoryById = "SELECT * FROM Categories WHERE category_id=?";
    deleteCategory = "DELETE FROM Categories WHERE category_id=?";
    updateCategory = "UPDATE Categories SET category_name=? WHERE category_id=?";
    // beer_categories page
    selectBeerCategories = "SELECT b.beer_name, c.category_name, bc.beer_id, bc.category_id FROM BeerCategories bc JOIN Beers b ON b.beer_id = bc.beer_id JOIN Categories c ON c.category_id = bc.category_id";
    insertBeerCategory = "INSERT INTO BeerCategories (`category_id`, `beer_id`) VALUES (?, ?)";
    selectBeerCategoryById = "SELECT * FROM BeerCategories WHERE category_id=? AND beer_id=?";
    deleteBeerCategory = "DELETE FROM BeerCategories WHERE category_id=? AND beer_id=?";
    updateBeerCategory = "UPDATE BeerCategories SET category_name=?, beer_name=? WHERE category_id=? AND beer_id=?";
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

//function that gets a Table
var getTable = (res, query) => {
  // function that obtains all the rows in the database
  mysql.pool.query(query, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    // obtain the table data and keep it as a rows variable
    res.json({rows: rows})
  });
};

// home
app.get('/', (req,res,next) => {
  res.render('home');
});

// add a set to Beers
app.post('/beers',(req,res,next) => {
  // all the values from the post request
  var {beer_name, brewery, abv, ibu} = req.body;
  mysql.pool.query(insertBeer, [beer_name, brewery, abv, ibu], (err, ret) => {
    if(err){
      next(err);
      return;
    }
    getTable(res, selectBeers);
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
        getTable(res, selectBeers);
      });
    }
  });
});

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
});

// get all rows in Categories
app.get('/categories', (req,res,next) => {
  mysql.pool.query(selectCategories, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
      
    res.render('categories');
  });
});

// delete a row for Categories
app.delete('/categories', (req,res,next) => {
  mysql.pool.query(deleteCategory, [req.body.category_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    
    getTable(res, selectCategories);
  });
});

// update one row for Categories
app.put('/categories', (req,res,next) => {
  mysql.pool.query(selectCategoryById, [req.body.category_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query(updateCategory,
        [req.body.category_name || curVals.category_name, req.body.category_id || curVals.category_id],
        (err, result) => {
        if(err){
          next(err);
          return;
        }
        getTable(res, selectCategories);
      });
    }
  });
});

// add a set to beer_categories
app.post('/beer_categories',(req,res,next) => {
  mysql.pool.query(insertBeerCategory, [req.body.category_id, req.body.beer_id], (err, ret) => {
    if(err){
      next(err);
      return;
    }
    getTable(res, selectBeerCategories);
  });
});

// get all rows in beer_categories
app.get('/beer_categories', (req,res,next) => {
  mysql.pool.query(selectBeerCategories, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
      
    res.render('beer_categories');
  });
});

// delete a row for beer_categories
app.delete('/beer_categories', (req,res,next) => {
  mysql.pool.query(deleteBeerCategory, [req.body.category_id, req.body.beer_id], (err, result) => {
    if(err){
      next(err);
      return;
    }
    
    getTable(res, selectBeerCategories);
  });
});


// ------- FUNCTION TO GET ALL USERS -------- //

function getUsers(res, mysql, context, complete){
  mysql.pool.query("SELECT `first_name`, `username`, `user_id` FROM Users", function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.users = results;
      complete();
  });
}

// -------- DISPLAY ALL USERS -------- //

app.get('/users', (req,res,next) => {
  let callbackCount = 0;
  let context = {};
  context.jsscripts = "deleteUser.js";
  getUsers(res, mysql, context, complete);
  //getPlanets(res, mysql, context, complete);
  function complete(){
      callbackCount++;
      if(callbackCount >= 1){
          // console.log(context)
          res.render('users', context);
      }
  }  
});

// -------- ADD A NEW USER -------- //

app.post('/users', function(req, res){
  console.log(req.body)

  let sql = "INSERT INTO Users (`username`, `email`, `gender`, `first_name`, `last_name`, `date_of_birth`, `zipcode`) VALUES (?,?,?,?,?,?,?)";
  let inserts = [req.body.username, req.body.email, req.body.gender, req.body.fname, req.body.lname, req.body.dob, req.body.zip];
  
  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if(error){
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
      }else{
          console.log(results)
          res.redirect('/users');
      }
  });
});

// -------- DELETE A USER -------- //


app.delete('/users/:id', function(req, res){
  var sql = "DELETE FROM Users WHERE user_id = ?";
  var inserts = [req.params.id];
  // console.log("id to delete: " + inserts);
  mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
          console.log(error)
          res.write(JSON.stringify(error));
          res.status(400);
          res.end();
      }else{
          res.status(202).end();
      }
  })
})


// -------- FUNCTION TO GET THE TOP AVERAGE RATINGS FOR BEERS -------- //

function getTopRatings(res, mysql, context, complete){
  let sql = "SELECT b.beer_id, b.beer_name, AVG(r.rating_value) AS average_stars FROM Beers b INNER JOIN Ratings r ON b.beer_id = r.beer_id GROUP by b.beer_id ORDER BY average_stars DESC LIMIT 10";
  mysql.pool.query(sql, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.topratings = results;
      complete();
  });
}

// -------- FUNCTION TO GET ALL BEERS FOR DROPDOWN-------- //

function getBeers(res, mysql, context, complete){
  let sql = "SELECT beer_id, beer_name FROM Beers";
  mysql.pool.query(sql, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.beers = results;
      complete();
  });
}

// -------- FUNCTION TO GET ALL USERS FOR DROPDOWN-------- //

function getUserDropdown(res, mysql, context, complete){
  let sql = "SELECT user_id, username FROM Users";
  mysql.pool.query(sql, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.users = results;
      complete();
  });
}

// -------- FUNCTION TO A SINGLE BEER TO BE RATED -------- //

function getABeer(res, mysql, context, id, complete){
  var inserts = id;
  mysql.pool.query(selectBeerById, inserts, function(error, results, fields){
      if(error){
          res.write(JSON.stringify(error));
          res.end();
      }
      context.abeer = results;
      complete();
  });
}

// -------- DISPLAY THE TOP RATED BEERS & SELECTED BEER -------- //

app.get('/ratings', (req,res,next) => {
  let callbackCount = 0;
  let context = {};
  //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
  //var mysql = req.app.get('mysql');
  getTopRatings(res, mysql, context, complete);
  getBeers(res, mysql, context, complete);
  getUserDropdown(res, mysql, context, complete)
  function complete(){
      callbackCount++;
      if(callbackCount >= 3){
          res.render('ratings', context);
      }
  }
});

// -------- ADD A NEW RATING -------- //

app.post('/ratings', function(req, res){
  console.log(req.body)

  let sql = "INSERT INTO Ratings (`rating_value`, `user_id`, `beer_id`) VALUES (?, ?, ?)";
  let inserts = [req.body.rating2, req.body.user_id, req.body.beer_id];
  
  sql = mysql.pool.query(sql,inserts,function(error, results, fields){
      if(error){
          console.log(JSON.stringify(error))
          res.write(JSON.stringify(error));
          res.end();
      }else{
          console.log(results)
          res.redirect('/ratings');
      }
  });
});

// app.post('/ratings', function(req, res){
//   let callbackCount = 0;
//   let context = {};
//   getABeer(res, mysql, context, req.body.beer_id, complete);
//   getTopRatings(res, mysql, context, complete);
//   getBeers(res, mysql, context, complete);
//   function complete(){
//     callbackCount++;
//     if(callbackCount >= 3){
//         res.render('ratings', context);
//     }
//   }
  //console.log(req.body)
  // let context = {}
  // sql = mysql.pool.query(selectBeerById,req.body.beer_id,function(error, results, fields){
  //     if(error){
  //         console.log(JSON.stringify(error))
  //         res.write(JSON.stringify(error));
  //         res.end();
  //     }else{
  //         //console.log(results)
  //         context.abeer = results;
  //         res.redirect('/ratings');
  //     }
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
  console.log('Express started on http://flip1.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});