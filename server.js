var express = require("express");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var logger = require("morgan");
//add body-parsers

//Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

//Require DB all models
var db = require("./models");

//PORT connection
var PORT = 8011;

//Express start
var app = express();

// Database configuration
// var databaseUrl = "NBA";
// var collections = ["NBAdata"];

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/NBA";
 //mongoose.connect(MONGODB_URI);

//Morgan logger request
app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Make static public folder
app.use(express.static("public"));

//Mongo DB connect
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Handlebars set up
app.engine("handlebars", exphbs({ defaultLayout: "main"}));
app.set("view engine", "handlebars");

//Scraping NBA news site
app.get("/scrape", function (req, res) {
    axios.get("http://www.espn.com/nba/").then(function (response) {

        var $ = cheerio.load(response.data);
        // console.log('RESPONSE!!!!!!! ', $)
        $("h1.contentItem__title contentItem__title--video").each(function (i, element) {
            var result = {};

            // console.log('I!!!!!!!!!!!!!! ', i)
            // console.log('ELEMENT!!!!!!!!! ', element)

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            console.log('result:',result);

            db.Article.create(result)
                .then(function (dbArticle) {
                    console.log(dbArticle)
                })
                .catch(function (err) {
                    return res.json(err);
                });
        });
        //Lets us know Scrape was successful
        res.send("Scrape Successfull");
    });
});

//GETS certain Article by id and poplulates it with its note
app.get("/articles", function (req, res) {
    db.Article.find({})
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//GETS certain Article by id and poplulates it with its note
app.get("/article/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })

        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Save Articles notes
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

//Start server and make sure it's listening
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});