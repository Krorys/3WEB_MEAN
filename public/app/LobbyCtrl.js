angular.module('bsApp')
.controller('LobbyCtrl', LobbyCtrl);

function LobbyCtrl($scope, $rootScope, socket) {
    // console.log('lobby controller');
    
    var messageInput = document.getElementById('msgInput');
    $scope.sendMessage = function(e) {
        e.preventDefault();
        if (messageInput.value.trim().length == 0)
            return;

        var message = {
            sender: $scope.user.username,
            at: new Date().toISOString(),
            text: messageInput.value,
            type: 'message'
        }
        socket.emit('sendMsg', message);
        socket.emit('stopWritingMsg', $scope.user.username);
        console.log('Sending : ', message);
        messageInput.value = '';
        messageInput.focus();
    }
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
    }
}