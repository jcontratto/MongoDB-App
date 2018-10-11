
//Dependencies 
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// var PORT = 3024;
var PORT = process.env.PORT || 3024;

// Initialize Express
var app = express();

/* TIM - Moved these down lower after express configuration */

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nprMusic";
// Connect to the Mongo DB
// mongoose.connect("MONGODB_URI", { useNewUrlParser: true });
//Logging requests through morgan
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));



//Handlebars set up
  app.engine("handlebars", exphbs({ defaultLayout: "main"}));
	app.set("view engine", "handlebars");
	
/* TIM - Use a variable so your application can run both locally and when deployed */

	var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/nprMusic";

/* TIM - Pass variable into mongoose's connect method */

	// Connect to the Mongo DB
mongoose.connect(MONGODB_URI);

// A GET route for scraping the npr musite page
app.get("/scrape", function(req, res) {
  
  axios.get("https://www.npr.org/music/").then(function(response) {
    var $ = cheerio.load(response.data);

    //Get every h3.title within an article tag
    $("h3.title").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // Send error if one occurs when trying to add
          return res.json(err);
        });
    });

    // Lets us know the scrape was successful
    res.send("Scrape Successful");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      //Shows found Articles on client side
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Send error if one occurs when trying to add
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`.
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // Send error if one occurs when trying to add note
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});