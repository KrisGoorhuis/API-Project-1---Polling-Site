

(function() {
   var app = angular.module('pollApp', ['ngRoute']);
   var getUrl = 'http://localhost:3000/getPolls';
   
   
   
   
   app.controller("ViewController", function($http, $scope) { // TODO: identically named polls
      var newThis = this;
      newThis.polls = {}; // See performGet(callback) for an explanation of this and the previous line.
      this.pollLimit = 5;
      this.currentView = 1;
      this.inputFields = ["1", "2"]; // Start with two poll options!
      var inputCount = 2; // New poll option count. Lets us add a new number to the new option object with each new option.
      this.selectedOption;   
      newThis.newPollTitle;
      newThis.newPollOptions = {};
      this.selectedPoll = 0; // Governs which poll is shown in big. IS set to most recent during get request.
      newThis.userIp;
      var ip = "unset";
      var resultsShown = false;
      
      $http.get('//freegeoip.net/json/').then(function(data) { // If this returns before users need their IP for a poll click, we'll only do this once. Instead of every time they need their IP.
         var geoipObject = JSON.parse(JSON.stringify(data, null, 2));
         var ip = (geoipObject["data"]["ip"]); 
         newThis.userIp = ip;
      });
      
      this.setView = function(newView) { 
         this.pollLimit = 5;
         this.currentView = newView;
         this.updatePolls();
         this.selectedPoll = 0;
         $('#' + 0).css({"background-color": "rgb(70, 70, 70)", "margin": "5px"}); //TODO: highlight first poll on switching views.
         console.log(this.currentView);
      };
      
      this.checkView = function(matchingView) {
         return this.currentView === matchingView;
      };
      
      function performGet(callback) {
         // Under a $http.get request, "this.polls" refers to a unique instance of  "this.polls". Changing it changes the copy, not the original.
         // For some reason, updating the property ".polls" of a complete copy of "this" (newThis) somehow updates the two-way binding Angular has with the original "this.polls" for use in the HTML. *shrugs*
         $http.get(getUrl).then(function(data) {
            newThis.polls = data["data"].reverse(); // New additions are put at the bottom of our database order. Reversing after retrieval puts the most recent additions on top.
            if (callback) {
              callback(); 
            }
         });
      };
      
      this.updatePolls = function(callback) { 
         performGet(callback);
      };
      
      this.initialPollGet = function() {
         var callback = function() {
            setTimeout(function() { // This was processed too soon. Zero delay timeout moves it to the bottom of the call stack - after, I assume, the polls are listed out.
               newThis.selectPoll(newThis.selectedPoll);
            }, 0);  
         }
         performGet(callback);   
      }
      
      this.selectPoll = function(index) {
         if (index !== newThis.selectedPoll) {
            resultsShown = false;
         }
         
         newThis.selectedPoll = index;
         for (i = 0; i < newThis.polls.length; i++) {
            $('#' + i).css({"background-color": "rgb(50, 50, 50)", "margin": "1px"});   
         }
         
         $('#' + index).css({"background-color": "rgb(70, 70, 70)", "margin": "5px"});
         
         
         var workingPoll = newThis.polls[newThis.selectedPoll];
         
         if (ip === "unset") {
            $http.get('//freegeoip.net/json/').then(function(data) {
               var geoipObject = JSON.parse(JSON.stringify(data, null, 2));
               var ip = (geoipObject["data"]["ip"]); 

               if (workingPoll["Voter IPs"].indexOf(ip) !== -1) {
                  $("#voteButton").html("Vote Cast!");
                  $("#voteButton").css("background-color", "rgb(100, 100, 100)");
                  resultsShown = true;
               } else {
                  $("#voteButton").html("Vote");
                  $("#voteButton").css("background-color", "rgb(50, 50, 50)");
               }
               
         });
         }
         
         else {
            if (workingPoll["Voter IPs"].indexOf(ip) !== -1) {
               $("#voteButton").html("Vote Cast!");
               $("#voteButton").css("background-color", "rgb(100, 100, 100)");
               resultsShown = true;
            } else {
               $("#voteButton").html("Vote");
               $("#voteButton").css("background-color", "rgb(50, 50, 50)");
            } 
         }  
      }
      
      this.showMore = function() {
         this.pollLimit = this.pollLimit + 5;
      }
      
      this.optionClicked = function(index) {
         this.selectedOption = index;
      }
      
      this.vote = function() { 
         var workingPoll = newThis.polls[newThis.selectedPoll]; // The poll we're voting on.
         $http.get('//freegeoip.net/json/').then(function(data) {
            var geoipObject = JSON.parse(JSON.stringify(data, null, 2));
            var ip = (geoipObject["data"]["ip"]); 
            
            // Is the user's IP on the voters' list? Yes? Just tell them.
            if (workingPoll["Voter IPs"].indexOf(ip) !== -1) {
                alert("Your IP has cast a vote on this poll already!");
             }
            
            // Is the user's IP on the voters' list? No? Increment tally and push their IP. Then update database.
            if (workingPoll["Voter IPs"].indexOf(ip) === -1) { 
               workingPoll["Poll Options"][newThis.selectedOption]["Votes"] ++;
               workingPoll["Voter IPs"].push(ip);
               $("#voteButton").html("Vote Cast!");
               $("#voteButton").css("background-color", "rgb(100, 100, 100)");
                          
               var requestObject = {
                  "Poll Title": workingPoll["Poll Title"],
                  "New Voter IP": ip,
                  "Poll Options": workingPoll["Poll Options"]
               };
               
               $http.post("http://localhost:3000/postVote", requestObject);
               resultsShown = true;
             } 
         });
      }
      
      this.viewResults = function() {
         resultsShown = true;
      }
      
      this.areResultsShown = function() {
         return resultsShown;
      }
      
      this.addPollOption = function() {  
         inputCount++;
         this.inputFields.push(inputCount); // Adds just a key. ng-model adds the value as it's typed in to the input field.
      };

      
      this.transferPoll = function(selectedPoll) { // In selectedPoll.html. Could probably move this to HTML for a net simplification... but the HTML would be messier.
         var pollOptions = this.polls[selectedPoll]["Poll Options"];
         return pollOptions;
      };
    
      this.submitPoll = function() {
         $http.get('//freegeoip.net/json/').then(function(data) {
            var geoipObject = JSON.parse(JSON.stringify(data, null, 2));
            var ip = (geoipObject["data"]["ip"]); 
            
            //console.log(newThis.newPollOptions);
            
            newThis.newPollOptionsArray = [];
            var newOpsLength = Object.keys(newThis.newPollOptions).length;
            
            for (i = 1; i <= newOpsLength; i++) {
               newThis.newPollOptionsArray.push(
                  {
                     "Text": newThis.newPollOptions[i],
                     "Votes": 0
                  }
               )
            }
            
            //console.log(newThis.newPollOptionsArray);
            
            newThis.newPollObject = {
               "Author IP": ip,
               "Poll Title": newThis.newPollTitle,
               "Poll Options": newThis.newPollOptionsArray,
               "Voter IPs": []
            }
            
            //Use .unshift instead of .push to put things on the front.
            
            $http.post('http://localhost:3000/submitPoll', newThis.newPollObject);
            var callback = function() {
               newThis.selectedPoll = 0;
            }
            performGet(callback);
            newThis.setView(1); // Back to home! Should see their poll front and center now.
            newThis.newPollTitle = "";
            newThis.newPollOptions = {};
         });  
        
      };
      
   });

   app.directive('welcome', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/welcome.html'
      }
   }); 
   
   app.directive('myPolls', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/myPolls.html'
      }
   });

   app.directive('createPoll', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/createPoll.html'
      }
   });
   
   app.directive('selectedPoll', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/selectedPoll.html'
      }  
   });
   
   
})();

