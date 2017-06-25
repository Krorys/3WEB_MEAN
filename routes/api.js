// api ---------------------------------------------------------------------
var express = require('express');
var ObjectId = require('mongodb').ObjectId; 
var router = express.Router();
var db = require('../db')


/////////////// USERS

router.get('/users/list', function(req, res) {
    var users = db.get().collection('users');

    users.find().toArray(function(err, results) {
        // res.render('users', {comments: results})
        // console.log(results);
        res.json(results);
    });
    // console.log(req.headers);
});

router.post('/users/add', function(req, res) {
    var users = db.get().collection('users');
    users.findOne({username: req.body.username})
    .then(function(result) {
        if (result)
            return res.send({success: false, msg: 'Username taken.'});

        users.insertOne(req.body);
        console.log('New user added: ', req.body.username);
        res.send({success: true, msg: 'User successfully registered.'});  
    });
});

router.get('/users/:username', function(req, res) {
    var users = db.get().collection('users');
    users.findOne({username: req.params.username})
    .then(function(result) {
        if (!result)
            return res.send({success: false, msg: 'User doesn\'t exists.'});
        res.send(result);  
    });
});

/////////////// MESSAGES

router.get('/messages/lasts', function(req, res) {
    var messages = db.get().collection('messages');
    messages.find().limit(50).toArray(function(err, results) {
        res.send(results);
    });
});

router.post('/messages/add', function(req, res) {
    var messages = db.get().collection('messages');
    messages.insertOne(req.body);
    // console.log('New message added : ', req.body.text);
    res.send({success: true, msg: 'Message successfully registered.'});  
});

/////////////// GAMES
router.get('/games/list', function(req, res) {
    var games = db.get().collection('games');
    games.find().toArray(function(err, results) {
        res.send(results);
    });
});

router.post('/games/add', function(req, res) {
    var games = db.get().collection('games');
    games.insertOne(req.body, function(err, doc) {
        res.send({success: true, id: doc.insertedId, msg: 'Game successfully registered.'});  
        // console.log('New game created : ', req.body.text);
    });
});

router.get('/games/:gameId', function(req, res) {
    var games = db.get().collection('games');
    games.findOne({_id: ObjectId(req.params.gameId)})
    .then(function(result) {
        // console.log(result);
        if (!result)
            return res.send({success: false, msg: 'Game doesn\'t exists.'});
        res.send({success: true, msg: 'Game successfully retrieved.', game: result});  
    });
});

router.post('/games/:gameId', function(req, res) {
    var games = db.get().collection('games');
    // console.log(req.body);
    games.findOneAndUpdate(
        { "_id": ObjectId(req.params.gameId)}, {$set: req.body }, {returnOriginal: false}, 
        function(err, doc) {
            res.send({success: true, msg: 'Game successfully edited.', game: doc.value});  
        // console.log('Game edited : ', req.body);
        }
    );
});

module.exports = router;