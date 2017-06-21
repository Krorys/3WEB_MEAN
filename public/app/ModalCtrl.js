angular.module('bsApp')
.controller('ModalCtrl', ModalCtrl);

function ModalCtrl ($scope, $http, $state) {
    $scope.goToView = function(viewName) {
        viewName = viewName === undefined ? '' : viewName;
        $state.go(viewName);
    }

    $scope.modalShow = false;
    $scope.toggleModal = function($event) {
        $scope.modalShow = !$scope.modalShow;
    }
    $scope.hideModal = function($event) {
        if ($event.srcElement == document.getElementById('login-modal'))
            $scope.modalShow = !$scope.modalShow;
    }

    $scope.isRegisterForm = false;
    $scope.modalTitle = 'Login';
    $scope.swapButtonTitle = 'Register';
    $scope.swapForms = function() {
        $scope.isRegisterForm = !$scope.isRegisterForm;
        $scope.modalTitle = $scope.isRegisterForm ? 'Register' : 'Login';
        $scope.swapButtonTitle = $scope.isRegisterForm ? 'Login' : 'Register';
    }

    $scope.registerData = {};
    $scope.register = function() {
        $http.post('/api/users/add', $scope.registerData)
            .then(function(data) {
                $scope.registerData = {}; // clear the form so our user is ready to 
                console.log(data);
            },
            function(data) {
                console.log('Error: ' + data);
            });
    };
}