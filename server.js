
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var logger = require("morgan");
var Note = require("./models/Note.js")
var Article = require("./models/Article.js")

// scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

// Connect to the Mongo DB
var databaseUri = 'mongodb://localhost/slashscraper';

    if (process.env.MONGODB_URI) {
        mongoose.connect(process.env.MONGODB_URI);
    } else {
        mongoose.connect(databaseUri);
    }

// initialize app
var app = express();
var PORT = process.env.PORT || 3000;
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static("public"));

 
// GET scraping route 
app.get("/scrape", function (req, res) {
  //request to website
  axios.get("https://slashdot.org/").then(function(response) {
      var $ = cheerio.load(response.data);
      $('.story-title').each(function (i, element) {
          var result = {};
          //what were are scraping
          result.title = $(this).children('a').text();
          result.link = $(this).children('a').attr("href");

          //saving to database
          var entry = new Article(result);
          entry.save(function (err, doc) {
              // Log any errors
              if (err) {
                  console.log(err);
              }
              // Or log the doc
              else {
                  console.log(doc);
              }
          });
      });
  });
  res.redirect("/");
  console.log("Scrape complete!");
});


// index
app.get("/", function (req, res) {
    res.send(index.html);
});


//GET scraped data from database
app.get("/articles", function (req, res) {
    Article.find({})
        .populate("notes")
        .exec(function (error, dbResult) {
            if (error) {
                console.log(error);
            } else {
                res.json(dbResult);
            }
        });
});


// GET any added notes to database
app.get("/notes", function (req, res) {
    Note.find({}, function (error, doc) {
        if (error) {
            res.send(error);
        }
        else {
            res.send(doc);
        }
    });
});


// GET articles by id
app.get("/articles/:id", function (req, res) {
    Article.findOne({
            "_id": req.params.id
        })
        .populate("notes")
        .exec(function (error, doc) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(doc);
                console.log(doc);
            }
        });
});

// POST new note 
app.post("/articles/:id", function (req, res) {
    var newNote = new Note(req.body);

    // Save note to mongoose
    newNote.save(function (error, doc) {
        if (error) {
            res.send(error);
        }
        else {
            // Find note and push to notes array
            Article.findOneAndUpdate({
                "_id": req.params.id
            }, {
                $push: {
                    "notes": doc._id
                }
            }, {
                new: true
            }, function (err, newdoc) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(newdoc);
                }
            });
        }
    });
});
app.listen(PORT, function() {
    console.log("app listening on PORT", PORT);
});

