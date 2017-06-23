angular.module('bsApp')
.controller('LobbyCtrl', LobbyCtrl);

function LobbyCtrl($scope, $rootScope, $http, socket) {
    // console.log('lobby controller');

    $scope.messages = [];
    $scope.currentUsers = [];

    var init = function() {
        $http.get('/api/messages/lasts')
        .then(function(result) {
            // console.log(result);
            $scope.messages = result.data.concat($scope.messages);
        },
        function(result) {
            console.log('Error: ' + result);
        });
    };

    if ($scope.user)
        if (!$scope.isConnectedToChat)
            socket.emit('logIn', $scope.user.username);
    if ($scope.user === undefined) {
        init();
        socket.emit('visit');
    }

    var messagesContainer = document.getElementById('messagesContainer');
    var usersList = document.getElementById('loggedUsers');

    $scope.sendMessage = function(e) {
        var messageInput = document.getElementById('msgInput');
        e.preventDefault();
        if (messageInput.value.trim().length == 0)
            return;

        var message = {
            sender: $scope.user.username,
            at: new Date().toISOString(),
            text: messageInput.value,
            type: 'message'
        }

        $http.post('/api/messages/add', message)
        .then(function(data) {
            console.log(data);
            socket.emit('sendMsg', message);
            socket.emit('stopWritingMsg', $scope.user.username);
            messageInput.value = '';
            messageInput.focus();
            // console.log('Sending : ', message);
        },
        function(data) {
            console.log('Error: ' + data);
        });
    };

    var timeout;
    $scope.writeMessage = function() {
        socket.emit('writingMsg', $scope.user.username);

        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        timeout = setTimeout(function() {
            // console.log('Stopped writing :', loggedUser);
            socket.emit('stopWritingMsg', $scope.user.username);
        }, 1000);
    };

    socket.on('logInSuccess', function () {
        if ($scope.isConnectedToChat)
            $scope.isConnectedToChat = true;
        // console.log("Successfully logged in as  :", $scope.user.username);
    });

    socket.on('displayMsg', function (message) {
        //console.log("Received :", message);
        if ($scope.user !== undefined && message.type == 'status' && message.sender == $scope.user.username)
            init();
        $scope.messages.push(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    socket.on('displayIsWriting', function (users) {
        // console.log("Message being written by :", user);
        var txt = users + ' is writing...';
        if (users.length == 0)
            var txt = '';
        $scope.isWriting = txt;
    });

    socket.on('usersList', function (currentUsers) {
        $scope.currentUsers = currentUsers;
        // console.log($scope.currentUsers);
    });
}