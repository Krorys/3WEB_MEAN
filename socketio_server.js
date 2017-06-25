module.exports = function(io) {
    var gameIO = io.of('/game');
    gameIO.on('connection', function(socket) {
        console.log('User connected in /game');

        socket.on('disconnect', function() {
            console.log('User disconnected from /game');
        });

        socket.on('userJoin', function(infos) {
            socket.join(infos.game._id);
            if (infos.username !== infos.game.creator)
                socket.emit('closeGame');
        });

        socket.on('gameUpdated', function(game) {
            gameIO.to(game._id).emit('overwriteGame', game);
        });

        /*
        socket.on('', function() {

        });

        socket.on('', function() {

        });

        socket.on('', function() {

        });

        socket.on('', function() {

        });
        */
    });

    var writingUsers = [];
    var currentUsers = [];
    var duplicateUsers = [];

    var chatIO = io.of('/chat');
    chatIO.on('connection', function(socket) {
        console.log('User connected in /chat');
        var loggedUser;
        var duplicatedId;

        socket.on('disconnect', function () {
            console.log('User disconnected from /chat', loggedUser);

            if (loggedUser === undefined && duplicatedId === undefined) // Pas connecté du tout
                return;
            else // Onglet connecté
                if (duplicateUsers[duplicatedId].instance > 1) { //Il reste des onglets co
                    duplicateUsers[duplicatedId].instance--;
                    return;
                }
                else
                    loggedUser = {id: duplicateUsers[duplicatedId].id, name: duplicateUsers[duplicatedId].name};
                
            var index = currentUsers.findIndex((user) => user.name === loggedUser.name);
            currentUsers.splice(index, 1);
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
                duplicatedId = duplicateUsers.findIndex((user) => user.name === username);
                duplicateUsers[duplicatedId].instance++;
                socket.emit('usersList', currentUsers);
                return;
            }
            else 
                duplicatedId = duplicateUsers.push({id: socket.id, name: username, instance: 1}) - 1;

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