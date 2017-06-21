// api ---------------------------------------------------------------------
var express = require('express');
var router = express.Router();

var db = require('../db')

router.get('/users/list', function(req, res) {
    var users = db.get().collection('users');

    users.find().toArray(function(err, results) {
        // res.render('users', {comments: results})
        console.log(results);
        res.json(results);
    });
});

router.post('/users/add', function(req, res) {
    var users = db.get().collection('users');
    users.findOne({username: req.body.username})
    .then(function(result) {
        if (result)
            return res.send('User already exists.');

        users.insertOne(req.body);
        console.log('New user added: ', req.body.username);
        res.send('User registered successfully.');  
    });
})

router.get('/users/:username', function(req, res) {
    var users = db.get().collection('users');
    users.findOne({username: req.params.username})
    .then(function(result) {
        if (!result)
            return res.send('User doesn\'t exists.');
        res.send(result);  
    });
})

module.exports = router;