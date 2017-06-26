angular.module('bsApp')
.controller('LobbyCtrl', LobbyCtrl);

function LobbyCtrl($scope, $rootScope, $timeout, $http, $state, socket) {
    // console.log('lobby controller');
    socket.connect('/chat');

    // Used for ng-repeat in view
    $scope.messages = [];
    $scope.currentUsers = [];

    if ($scope.user)
        socket.emit('logIn', $scope.user.username);
    if ($scope.user === undefined) {
        getLastMessages();
        socket.emit('visit');
    }

    // Used to scroll
    var messagesContainer = document.getElementById('messagesContainer');

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
        };

        $http.post('/api/messages/add', message)
        .then(function(data) {
            // console.log(data);
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

    $scope.createGame = function() {
        var newGame = {
            creator: {username: $scope.user.username},
            status: 'open'
        };

        $http.post('/api/games/add', newGame)
        .then(function(result) {
            console.log(result);
            $state.go('game', {id: result.data.id});
        },
        function(result) {
            console.log('Error: ' + result);
        });
    };

    function getLastMessages() {
        $http.get('/api/messages/lasts')
        .then(function(result) {
            // console.log(result);
            $scope.messages = result.data.concat($scope.messages);
            $timeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight);
        },
        function(result) {
            console.log('Error: ' + result);
        });
    }

    // SOCKETS RECEIVED

    socket.on('logInSuccess', function () {
        getLastMessages();
        // console.log("Successfully logged in as  :", $scope.user.username);
    });

    socket.on('displayMsg', function (message) {
        // console.log("Received :", message);

        $scope.messages.push(message);
        // Using $timeout to wait for DOM to be rendered
        $timeout(() => messagesContainer.scrollTop = messagesContainer.scrollHeight);
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