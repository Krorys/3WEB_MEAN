angular.module('bsApp')
    .factory('socket', SocketService);

function SocketService ($rootScope) {

    // var socket = io.connect();
    var socket;

    return {
        connect: function(namespace, callback) {
            if (socket)
                socket.disconnect();
            socket = (namespace) ? io.connect(namespace) : io.connect();
        },
        on: function (eventName, callback) {
            socket.on(eventName, function () {  
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
        ,
        disconnect: function() {
            // console.log(socket.id);
            // If user logout from a page without socket (!lobby && !game)
            if (socket) {
                socket.disconnect();
                socket.connect();
            }
        }
    };
}