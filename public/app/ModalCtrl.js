angular.module('bsApp')
.controller('ModalCtrl', ModalCtrl);

function ModalCtrl ($scope, $http, $state, AuthService) {
    $scope.goToView = function(viewName) {
        viewName = viewName === undefined ? '' : viewName;
        $state.go(viewName);
    };

    $scope.modalShow = false;
    $scope.toggleModal = function($event) {
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
                console.log('oui');
                AuthService.SetCredentials($scope.loginData);
                $state.go('lobby');
            }
            else
                console.log(res.msg);
        });
    };

    $scope.registerData = {};
    $scope.register = function() {
        $http.post('/api/users/add', $scope.registerData)
        .then(function(data) {
            $scope.registerData = {};
            console.log(data);
        },
        function(data) {
            console.log('Error: ' + data);
        });
    };
}