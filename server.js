require('dotenv').load();
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');
var search = 'https://www.googleapis.com/customsearch/v1?key='+process.env.API+'&cx='+process.env.ID+'&searchType=image&num=10';

var mongo = require('mongodb').MongoClient;
var db;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function checkRecentSearches(res, find){
  db.collection('search').find({},{_id: 0}).sort({'when': -1}).limit(10)
  .toArray(function(err, documents) {
    if(err) return console.log(err);
    console.log(documents)
    res.render('index', {recent: documents, find: find});
  });
}

app.post("/", function(req, res){
  var fullSearch = search+'&q='+req.body.text_val+'&start='+(1+10*req.body.offset);  
  console.log("fullSearch ", fullSearch);
  request({
    url: fullSearch,
    json: true
  }, function (error, response, body) {
    if(error) return console.log(error);
    console.log("responseeeeeeeeeeee ", response.body.items);
    var doc = {'term': req.body.text_val, 'when': new Date()};
    db.collection('search').insert(doc, function(err, data){
      if(err) return console.log(err);
      console.log("data ", data);
      checkRecentSearches(res, response.body.items);
    });
  })  
});

app.get("/", function (req, res) {
  checkRecentSearches(res, null);
});

// listen for requests
mongo.connect(process.env.MONGO, function(err, data) {
  if(err) return console.log(err);
  db = data;
	var listener = app.listen(process.env.PORT, function () {
	  console.log('Your app is listening on port ' + listener.address().port);
	});
});
