var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var databaseUrl = "mongodb://localhost:27017/polls";
app.use(express.static(path.join(__dirname, ''))); // Serve everything from the root.

app.use(bodyParser.json());
//app.use(app.router);


// Serve up the home page.
app.get('/', function(request, response) {
  response.sendFile(path.resolve(__dirname, 'index.html'));
   
});

app.get('/getPolls', function(request, response) {
   MongoClient.connect("mongodb://localhost:27017/polls", function(error, database) {
      if (error) {
         console.log(error);
      }
      database.collection("polls", function(error, collection) {
         collection.find().toArray(function(error, items) {
            if (error) {
               console.log(error);
            }
            response.send(items);
         })

      });
   });
});

app.post('/postVote', function(request, response) {
   MongoClient.connect(databaseUrl, function(error, database) {
      if (error) {
         console.log(error);
      }
      console.log("Vote request received!");
      database.collection('polls', function(error, collection) {
         if (error) {
            console.log(error);
         }
         
         collection.update(
            {"Poll Title": request.body['Poll Title']},
               {
                  $push: {"Voter IPs": request.body['New Voter IP']},
                  $set: {"Poll Options": request.body['Poll Options']}
               }
         ) 
         
         
         collection.find().toArray(function(error, items) {
            if (error) {
               console.log(error);
            }
            //console.log(request.body["Poll Title"]);
            console.log(items);
         })
         
      })
   });
});

app.post('/submitpoll', function(request, response) {
   MongoClient.connect(databaseUrl, function(error, database) {
      if (error) {
         console.log(error);
      }
         
      database.collection('polls', function(error, collection) {
      if (error) {
         console.log(error);
      }

      collection.insert(request.body);

      })
         
      console.log(request.body);
   });
});

app.listen(process.env.PORT || 3000, function() {
   console.log("App running on port 3000");
});