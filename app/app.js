

(function() {
   var app = angular.module('pollApp', ['ngRoute']);
   var getUrl = 'http://localhost:3000/getPolls';
   
   app.controller("ViewController", function($http, $scope) {
      var newThis = this;
      newThis.polls = {}; // See performGet(callback) for an explanation of this and the previous line.
      this.currentView = 1;
      this.inputFields = ["1", "2"]; // Start with two poll options!
      var inputCount = 2; // New poll option count. Lets us add a new number to the new option object with each new option.
      this.selectedOption;   
      newThis.newPollTitle;
      newThis.newPollOptions = {};
      this.selectedPoll; // Governs which poll is shown in big. IS set to most recent during get request.
      
      this.setView = function(newView) {       
         this.currentView = newView;
         this.updatePolls();
         newThis.selectedPoll = newThis.polls.length-1;
      };
      
      this.checkView = function(matchingView) {
         return this.currentView === matchingView;
      };
      
      function performGet(callback) {
         // Under a $http.get request, "this.polls" refers to a unique instance of  "this.polls". Changing it changes the copy, not the original.
         // For some reason, updating the property ".polls" of a complete copy of "this" somehow updates the two-way binding Angular has with the original "this.polls" for use in the HTML. *shrugs*
         $http.get(getUrl).then(function(data) {
            newThis.polls = data["data"].reverse(); // Reverse puts most recent additions on top.
            if (callback) {
               callback();
            }
            console.log(newThis.polls);
         });
      };
      
      this.updatePolls = function(callback) { 
         performGet(callback);
      };
      
      this.initialPollGet = function() {
         var callback = function() {
            newThis.selectedPoll = newThis.polls.length-1;
         }
         performGet(callback);
      }
      
      this.isThisPollSelected = function(iteratedPollIndex) {
         
         if (iteratedPollIndex === this.selectedPoll) {
            return true;
         }
         
         
         if (iteratedPollIndex !== this.selectedPoll) {
            return false;
         }
      }
      
      this.selectPoll = function(index) {
         this.selectedPoll = index;
         console.log(this.polls[this.selectedPoll]);
         console.log(this.polls);
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
                alert("You cast your vote on this poll already!");
             }
            
            // Is the user's IP on the voters' list? No? Increment tally and push their IP. Then update database.
            if (workingPoll["Voter IPs"].indexOf(ip) === -1) { // ******** Make ===
               workingPoll["Poll Options"][newThis.selectedOption]["Votes"] ++;
               workingPoll["Voter IPs"].push(ip);
               $("#voteButton").html("Vote Cast!");
               $("#voteButton").css("background-color", "rgb(100, 100, 100)");
                          
               var requestObject = {
                  "Poll Title": workingPoll["Poll Title"],
                  "New Voter IP": ip,
                  "Poll Options": workingPoll["Poll Options"]
               };
               
               $http.post("http://localhost:3000/postVote", requestObject)
                  .then(function(data, status, headers, config) {    
                     //console.log(data);
                  })
             } 
         });
      }
      
      this.viewResults = function() {
         
      }
      
      this.addPollOption = function() {  
         inputCount++;
         this.inputFields.push(inputCount); // Adds just a key. ng-model adds the value as it's typed in to the input field.
      };

      
      this.transferPoll = function(selectedPoll) {
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
               newThis.selectedPoll = newThis.polls.length-1;
            }
            performGet(callback);
            newThis.setView(1); // Back to home! Should see their poll front and center now.
            newThis.newPollTitle = {};
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

