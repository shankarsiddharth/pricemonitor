console.log('Price Monitor Server');

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();
var app_users = [{"userid" : "root"}];
app.use(bodyParser.json());
app.get('/', function(req, res) {
    //app_users = [{"userid" : "root"}];
    //res.sendFile(__dirname + '/login.html');
});

app.get('/users/:userId', function(req, res){
    console.log(req.params);
    app_users.push({"userid": req.params.userId});
    user_response = {'users' : app_users};
    user_response.new_user = req.params.userId;
    http.get({
        hostname: '127.0.0.1',
        port: 3333
    }, function(response) {
        // Continuously update stream with data
        var products = '';
        response.on('data', function(d) {
            products += d;
        });
        response.on('end', function() {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(products);
            res.json(parsed);
        });
    });
    console.log(user_response);
});

app.post('/subscribe', function(req, res){
    console.log(req.body);
    res.json(req.body);
});

app.listen(3050);
console.log('Application running on http://127.0.0.1:3050/');