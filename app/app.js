

(function() {
   var app = angular.module('pollApp', ['ngRoute']);
   var getUrl = 'http://localhost:3000/getPolls';
   
   app.controller("ViewController", function($http, $scope) {
      var newThis = this;
      newThis.polls = {}; // See performGet() for an explanation of this and the previous line.
      this.currentView = 1;
      this.showingNameField = false;
      this.inputFields = ["1", "2"]; // Start with two poll options!
      var inputCount = 2; // Let us add a new number with each new option.
      this.selectedOption;
      
      this.newPollTitle;
      this.newPollOptions = {
         // This is populated by the ng-model in creatPoll.html. Takes
      }
      this.selectedPoll = 3; // Governs which poll is shown in big.
      
      this.setView = function(newView) {       
         this.currentView = newView;
         this.updatePolls();
         this.selectedPoll = 0;
      };
      
      this.checkView = function(matchingView) {
         return this.currentView === matchingView;
      };
      
      function performGet(callback) {
         // Under a $http.get request, "this.polls" refers to a unique instance of  "this.polls". Changing it changes the copy, not the original.
         // For some reason, updating the property ".polls" of a complete copy of "this" somehow updates the two-way binding Angular has with the original "this.polls" for use in the HTML. *shrugs*
         $http.get(getUrl).then(function(data) {
            newThis.polls = data["data"];
         });
      };
      
      this.updatePolls = function() { 
         performGet();
      };
      
      this.selectPoll = function(index) {
         console.log(index);
      }
      
      
      this.optionClicked = function(index) {
         this.selectedOption = index;
      }
      
      this.vote = function() {
         console.log(this.selectedOption);
         this.polls[this.selectedPoll]["Poll Options"][this.selectedOption]["Votes"] ++;
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
         $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
            var geoipObject = JSON.parse(JSON.stringify(data, null, 2));
            var ip = (geoipObject["ip"]); 
            
            // Again: just "this." refers to the get request's versions.
            newThis.newPoll = {
               "authorIP": ip,
               "Poll Title": "newThis.newPollTitle",
               "Poll Options": newThis.newPollOptions,
               "Voter IPs": {}
            }
               console.log(newThis.newPoll);
            // .put(I think) request goes here. Use .unshift instead of .push to put things on the front.
            newThis.setView(1);
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

