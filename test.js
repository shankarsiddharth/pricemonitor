console.log('Price Monitor Server');

var express = require('express');
var http = require('http');
//var bodyParser = require('body-parser');
var app = express();
var app_users = [{"userid" : "root"}];
var productPrice = [];
var subscription = [{
    "user_id": "142942",
    "subscribe": [
        {
            "product_id": "1234",
            "when": "ALWAYS"
        },
        {
            "product_id": "4324",
            "when": "ALL_TIME_LOW"
        },
        {
            "product_id": "1132",
            "when": "MORE_THAN_10"
        }
    ]
}];
/*app.use(bodyParser.json());
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

app.post('/unsubscribe', function(req, res){
    console.log(req.body);
    res.json(req.body);
});

app.post('/priceDataPoint', function(req, res){
    console.log(req.body);
    res.json(req.body);
});
*/
app.listen(4050);
console.log('Application running on http://127.0.0.1:4050/');

var processChanges = function(productPrice){

};
var addSubscription = function(newSubscription){
    //user_id & subscribe array
    //if user id is present,
        //check for the subscribe array
        //if an item is present update
        //else, add
    //else add the subscription
    var isUserIdPresent = false;
    for( var userIndex in subscription){
        if(newSubscription.user_id == subscription[userIndex].user_id){
            isUserIdPresent = true;
            console.log('Type of new subscription: ' + JSON.stringify(newSubscription.subscribe[0].product_id));
            for(var newProductSubscriptionIndex in newSubscription.subscribe){
                var isProductPresent = false;
                for(var productSubscriptionIndex in subscription[userIndex].subscribe){
                    if(newSubscription.subscribe[newProductSubscriptionIndex].product_id == subscription[userIndex].subscribe[productSubscriptionIndex].product_id){
                        isProductPresent = true;
                        subscription[userIndex].subscribe[productSubscriptionIndex].when = newSubscription.subscribe[newProductSubscriptionIndex].when;
                        console.log('Product Subscription Changed.');
                    }
                }
                if(!isProductPresent){
                    subscription[userIndex].subscribe.push(newSubscription.subscribe[newProductSubscriptionIndex]);
                    console.log('New Product added');
                }
            }
        }
    }
    if(!isUserIdPresent){
        subscription.push(newSubscription);
        console.log('User added');
    }
    subscription.forEach(function(item) {

    });
};
var pollProductList = function(){
    http.get({
        hostname: '127.0.0.1',
        port: 3333
    }, function(response) {
        var products = '';
        response.on('data', function(d) {
            products += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(products);
            productPrice = parsed.products;
        });
    });
    //processChanges(productPrice);
    var news = {
        "user_id": "142942",
        "subscribe": [
            {
                "product_id": "12341",
                "when": "ALWAYS"
            },
            {
                "product_id": "4324",
                "when": "ALL_TIME_LOW"
            }
            ]
    };
    addSubscription(news);
    setTimeout(pollProductList, 150000);
};
pollProductList();