angular.module('bsApp')
    .factory('socket', SocketService);

function SocketService ($rootScope) {
    var socket = io.connect();
    return {
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
            console.log(socket.id);
            socket.disconnect();
            socket.connect();
            // console.log(socket.id);
        }
    };
}