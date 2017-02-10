

(function() {
   var app = angular.module('pollApp', ['ngRoute']);
   var getUrl = 'http://localhost:3000/getPolls';
   
   app.controller("ViewController", function($http, $scope, $q) {
      var newThis = this;
      newThis.polls = {};
      this.currentPolls = {};
      this.testVariable = {"number": 3};
      this.currentView = 1;
      
      this.setView = function(newView) {       
         this.currentView = newView;
         this.updatePolls();
      };
      
      this.checkView = function(matchingView) {
         return this.currentView === matchingView;
      };
      
      function performGet(callback) {
         $http.get(getUrl).then(function(data) {
            newThis.polls = data["data"];
         });
      };
      
      this.updatePolls = function() { 
         performGet();
      };
      
      
      
   });

   app.directive('welcome', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/welcome.html'
      }
   }); 

   app.directive('browse', function() {
      return {
         restrict: 'E',
         templateUrl: '/assets/html/browse.html'
      }
   });
})();

