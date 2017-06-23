// api ---------------------------------------------------------------------
var express = require('express');
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
            return res.send({success: false, msg: 'User already exists.'});

        users.insertOne(req.body);
        console.log('New user added: ', req.body.username);
        res.send({success: true, msg: 'User registered successfully.'});  
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
    res.send({success: true, msg: 'Message registered successfully.'});  
});

module.exports = router;