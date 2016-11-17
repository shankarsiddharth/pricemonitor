console.log('Price Monitor Server');

var express = require('express');
var app = express();
var app_users;
app.get('/', function(req, res) {
    app_users = [{"userid" : "root"}];
    res.sendFile(__dirname + '/login.html');
});

app.get('/users/:userId', function(req, res){
    console.log(req.params);
    app_users.push({"userid": req.params.userId});
    user_response = {'users' : app_users};
    user_response.new_user = req.params.userId;
    res.json(user_response);
    console.log(user_response);
});

app.listen(3050);
console.log('Application running on http://127.0.0.1:3050/');