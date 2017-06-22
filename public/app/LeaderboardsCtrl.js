angular.module('bsApp')
.controller('LeaderboardsCtrl', LeaderboardsCtrl);

function LeaderboardsCtrl ($scope, $http) {

    $http.get('/api/users/bests')
    .success(function(data) {
        $scope.bestPlayers = data;
        console.log(data);
    })
    .error(function(data) {
        console.log('Error: ' + data);
    });
}