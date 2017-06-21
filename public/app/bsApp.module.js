angular.module('bsApp', ['ngRoute', 'ui.router'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
      .state('login', {
        url : '/login',
        templateUrl : 'login.html',
        controller : 'LoginController'
      })

      .state('home', {
        url : '/home',
        template : "<p>Landing page.</p>",
        controller : 'LobbyCtrl'
      })

      .state('game', {
        url : '/game',
        // templateUrl : "game.html",
        template : "<p>Game.</p>",
        controller : 'LobbyCtrl'
      })

      .state('lobby', {
        url : '/lobby',
        templateUrl : "lobby.html",
        controller : 'LobbyCtrl'
      })

      .state('leaderboards', {
        url : '/leaderboards',
        templateUrl : "leaderboards.html",
        controller : 'LobbyCtrl'
      })

      .state('about', {
        url : '/about',
        // templateUrl : "about.html",
        template : "<p>About.</p>",
        controller : 'LobbyCtrl'
      })
}]);