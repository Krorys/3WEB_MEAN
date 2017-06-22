var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var sassMiddleware = require('node-sass-middleware');
var Buffer = require('buffer');

var index = require('./routes/index');
var api = require('./routes/api');
var db = require('./db')
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var port = 3000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
    /* Options */
    src: __dirname,
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules')));

app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

server.listen(port, function() {
    console.log('Server is listening on : ' + port);
});

var dbURI = 'mongodb://admin:admin@ds123312.mlab.com:23312/battleship';
var dbLocalURI = 'mongodb://127.0.0.1:27017/battleship';
db.connect(dbURI, function(err) {
	if (err)
	    return console.log(err)
})

var writingUsers = [];
var currentUsers = [];

io.on('connection', function(socket){
    console.log('User connected');
    var loggedUser;

    socket.on('disconnect', function(){
        console.log('User disconnected', loggedUser);
        if (loggedUser == null)
            return;
        currentUsers.remove(loggedUser);
        
        io.emit('usersList', currentUsers);
        var message = {
            sender: loggedUser.name,
            at : new Date().toISOString(),
            text : 'has disconnected.', 
            type: 'status'
        };
        socket.broadcast.emit('displayMsg', message);
    });

    socket.on('logIn', function (username) {
        console.log('Logged as :', username);
        loggedUser = {
            id: socket.id,
            name: username
        };
        currentUsers.push(loggedUser);
        
        socket.emit('logInSuccess', loggedUser.name);
        io.emit('usersList', currentUsers);
        
        var message = {
            sender: loggedUser.name,
            at : new Date().toISOString(),
            text : 'has joined.',
            type: 'status'
        };
        io.emit('displayMsg', message);
    });

    socket.on('sendMsg', function (message) {
        console.log('Message sent :', message);
        io.emit('displayMsg', message);
    });

    socket.on('writingMsg', function (user) {
        console.log('Message being written by :', user)
        if (writingUsers.indexOf(user) == -1)
            writingUsers.push(user);
        socket.broadcast.emit('displayIsWriting', writingUsers);
    });

    socket.on('stopWritingMsg', function (user) {
        console.log('Stopped writing :', user);
        writingUsers.splice(writingUsers.indexOf(user), 1);
        io.emit('displayIsWriting', writingUsers);
    });
});

module.exports = app;

