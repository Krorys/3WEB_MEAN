angular.module('bsApp', ['ngCookies', 'ui.router'])

.run(function($rootScope, $location, $state, $transitions, $cookies, $http) {
    /*
    $rootScope.$on('$stateChangeStart', 
    function(event, toState, toParams, fromState, fromParams) { 
        console.log('Changed state to: ' + toState);
    });
    */
    
    $rootScope.globals = $cookies.getObject('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }

    $transitions.onStart({to: 'game'}, function(trans) {
        var loggedIn = $rootScope.globals.currentUser;
        if (!loggedIn) {
            console.log('no cookies & unauth state(page)');
            return $state.target('lobby');
        }
    });
        
})
    
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider, $http, $stateParams) {
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider
    .state('home', {
        url : '/home',
        template : "<p>Landing page.</p>"
    })
    
    .state('login', {
        url : '/login',
        template : "<p>blablalogin</p>"
    })
    
    .state('game', {
        url : '/game/:id',
        params: {
            status: null,
            creator: null
        },
        templateUrl : "game.html",
        resolve: {
            isGameValid: function($http, $state, $stateParams) {
                return $http.get('/api/games/' + $stateParams.id)
                .then(function(result) {
                    if (!result.data.success)
                        $state.go('lobby');
                    else
                        return result.data.game;
                },
                function(result) {
                    console.log('Error: ' + result);
                });
            }
        },
        controller : 'GameCtrl'
    })
    
    .state('lobby', {
        url : '/lobby',
        templateUrl : "lobby.html",
        controller : 'LobbyCtrl'
    })
    
    .state('leaderboards', {
        url : '/leaderboards',
        templateUrl : "leaderboards.html",
        controller : 'LeaderboardsCtrl'
    })
    
    .state('about', {
        url : '/about',
        // templateUrl : "about.html",
        template : "<p>About.</p>"
    })
}]);