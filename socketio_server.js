module.exports = function(io) {
    Array.prototype.remove = function() {
        var what, a = arguments, L = a.length, ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    var gameIO = io.of('/game');
    gameIO.on('connection', function(socket) {
        console.log('User connected in /game');

        socket.on('disconnect', function() {
            console.log('User disconnected from /game');
        });
    });

    var writingUsers = [];
    var currentUsers = [];

    var chatIO = io.of('/chat');
    chatIO.on('connection', function(socket) {
        console.log('User connected in /chat');
        var loggedUser;

        socket.on('disconnect', function () {
            console.log('User disconnected from /chat', loggedUser);

            if (loggedUser === undefined || currentUsers.find((user) => user.name === loggedUser.name))
                return;

            currentUsers.remove(loggedUser);
            chatIO.emit('usersList', currentUsers);

            var message = {
                sender: loggedUser.name,
                at : new Date().toISOString(),
                text : 'has disconnected.', 
                type: 'status'
            };
            socket.broadcast.emit('displayMsg', message);
        });

        socket.on('logIn', function (username) {
            // console.log('Logged as :', username);
            var alreadyLogged = currentUsers.find((user) => user.name === username);

            socket.emit('logInSuccess');
            if (alreadyLogged) {
                socket.emit('usersList', currentUsers);
                return;
            }

            loggedUser = {
                id: socket.id,
                name: username
            };
            currentUsers.push(loggedUser);
            
            chatIO.emit('usersList', currentUsers);
            
            var message = {
                sender: loggedUser.name,
                at : new Date().toISOString(),
                text : 'has joined.',
                type: 'status'
            };
            chatIO.emit('displayMsg', message);
        });

        socket.on('visit', function() {
            socket.emit('usersList', currentUsers);
        });

        socket.on('sendMsg', function (message) {
            // console.log('Message sent :', message);
            chatIO.emit('displayMsg', message);
        });

        socket.on('writingMsg', function (user) {
            // console.log('Message being written by :', user)
            if (writingUsers.indexOf(user) == -1)
                writingUsers.push(user);
            socket.broadcast.emit('displayIsWriting', writingUsers);
        });

        socket.on('stopWritingMsg', function (user) {
            // console.log('Stopped writing :', user);
            writingUsers.splice(writingUsers.indexOf(user), 1);
            chatIO.emit('displayIsWriting', writingUsers);
        });
    });
}