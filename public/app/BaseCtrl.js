angular.module('bsApp')
.controller('BaseCtrl', BaseCtrl);

function BaseCtrl ($scope, $http, $state, $transitions, $rootScope, AuthService, socket) {

    $transitions.onStart({}, function(trans) {
        $scope.user = $rootScope.globals.currentUser;
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
            // document.querySelector('.modalForm input').focus();
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
                $scope.errorMsg = '';
                $scope.loginData = {};
                $scope.toggleModal();
                $state.go('lobby', {}, {reload: true});
            }
            else
                $scope.errorMsg = res.msg;
        });
    };

    $scope.logout = function() {
        AuthService.ClearCredentials(function() {
            socket.disconnect();
            $state.reload();
        });
    }

    $scope.registerData = {};
    $scope.register = function() {
        $http.post('/api/users/add', $scope.registerData)
        .then(function(res) {
            if (!res.data.success)
                $scope.errorMsg = res.data.msg;
            else {
                $scope.errorMsg = '';
                $scope.loginData = $scope.registerData;
                $scope.login();
                $scope.registerData = {};
                // console.log(res);
            }
        },
        function(res) {
            console.log('Error: ' + res);
        });
    };
}