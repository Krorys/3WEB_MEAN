angular.module('bsApp', ['ngRoute'])

.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        template : "<p>Landing page.</p>"
    })
    .otherwise({
        templateUrl : "chat.html"
    });
})

.controller('BaseCtrl', BaseCtrl);

function BaseCtrl ($scope, $route, $routeParams, $location) {
    $scope.goToView = function(viewName) {
        viewName = viewName === undefined ? '' : viewName;
        $location.path('/' + viewName);
    }
}