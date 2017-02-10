var path = require('path');
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
app.use(express.static(path.join(__dirname, ''))); // Serve everything from the root.


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



app.listen(process.env.PORT || 3000, function() {
   console.log("App running on port 3000");
});