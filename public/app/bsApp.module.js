angular.module('bsApp', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        template : "<p>Landing page.</p>"
    })
    .when("/game", {
        templateUrl : "game.html"
    })
    .when("/lobby", {
        templateUrl : "lobby.html"
    })
    .when("/leaderboards", {
        templateUrl : "leaderboards.html"
    })
    .when("/about", {
        templateUrl : "about.html"
    })
    .otherwise({
        templateUrl : "lobby.html"
    });
});