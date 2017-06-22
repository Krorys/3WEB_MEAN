angular.module('bsApp')
.controller('BaseCtrl', BaseCtrl);

function BaseCtrl ($scope, $http, $state, $transitions, $rootScope, AuthService) {

    $transitions.onStart({}, function(trans) {
        $scope.user = $rootScope.globals.currentUser;
        console.log('logged', $scope.user != null);
        if ($scope.user)
            console.log($scope.user);
    });  

    $scope.goToView = function(viewName) {
        viewName = viewName === undefined ? '' : viewName;
        $state.go(viewName);
    };

    $scope.modalShow = false;
    $scope.toggleModal = function(tab = null) {
        if (tab) {
            $scope.isRegisterForm = tab === 'register' ? false : true;
            $scope.swapForms();
        }
        $scope.modalShow = !$scope.modalShow;
    };
    $scope.hideModal = function($event) {
        if ($event.srcElement == document.getElementById('login-modal'))
            $scope.modalShow = !$scope.modalShow;
    };

    $scope.isRegisterForm = false;
    $scope.modalTitle = 'Login';
    $scope.swapButtonTitle = 'Register';
    $scope.swapForms = function() {
        $scope.isRegisterForm = !$scope.isRegisterForm;
        $scope.modalTitle = $scope.isRegisterForm ? 'Register' : 'Login';
        $scope.swapButtonTitle = $scope.isRegisterForm ? 'Login' : 'Register';
    };
    
    $scope.loginData = {};
    $scope.login = function() {
        AuthService.Login($scope.loginData, function(res) {
            if (res.success) {
                AuthService.SetCredentials($scope.loginData);
                $scope.loginData = {};
                $scope.toggleModal();
                $state.reload();
                // $state.go('lobby', {}, {reload: true});
                // window.location.reload();
            }
            else
                console.log(res.msg);
        });
    };

    $scope.logout = function() {
        AuthService.ClearCredentials(function() {
            $state.reload();
            // window.location.reload();
        });
    }

    $scope.registerData = {};
    $scope.register = function() {
        $http.post('/api/users/add', $scope.registerData)
        .then(function(data) {
            $scope.loginData = $scope.registerData;
            $scope.login();
            $scope.registerData = {};
            console.log(data);
        },
        function(data) {
            console.log('Error: ' + data);
        });
    };
}