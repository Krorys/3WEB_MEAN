angular.module('bsApp', ['ngCookies', 'ui.router'])

.run(function($rootScope, $location, $state, AuthService, $transitions, $cookies, $http) {
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

    $transitions.onStart({}, function(trans) {
        var auth = trans.injector().get('AuthService');
        var restrictedPage = !$state.includes('login');
        var loggedIn = $rootScope.globals.currentUser;
        if (restrictedPage && !loggedIn) {
            console.log('no cookies & unauth state(page)');
            // $state.go('login');
        }
        if (!auth.getIsAuthenticated())
            console.log('not auth');
    });
        
})
    
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
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
        url : '/game',
        templateUrl : "game.html",
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