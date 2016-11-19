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
var subscriptionWithPrice = [];
app.listen(4050);
console.log('Application running on http://127.0.0.1:4050/');

var processChanges = function(productPrice){

};
var addSubscription = function(newSubscription){
    //user_id & subscribe array
    //if user id is present,
        //check for the subscribe array
        //if an item is present update
        //else, add the product item
    //else add the subscription
    var isUserIdPresent = false;
    for( var userIndex in subscription){
        if(newSubscription.user_id == subscription[userIndex].user_id){
            isUserIdPresent = true;
            //console.log('Type of new subscription: ' + JSON.stringify(newSubscription.subscribe[0].product_id));
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
    console.log('Subscribe : '+JSON.stringify(subscription));
};

var removeSubscription = function(newUnSubscription){
    //if user id is present
        //check for the subcribe array
        //if the product is present, delete
    var isUserIdPresent = false;
    for(var userIndex in subscription){
        if(newUnSubscription.user_id == subscription[userIndex].user_id){
            isUserIdPresent = true;
            for(var unsubscribeProductIndex in newUnSubscription.unsubscribe){
                var isProductPresent = false;
                for(var productUnSubscriptionIndex in subscription[userIndex].subscribe){
                    if(newUnSubscription.unsubscribe[unsubscribeProductIndex].product_id == subscription[userIndex].subscribe[productUnSubscriptionIndex].product_id){
                        isProductPresent = true;
                        subscription[userIndex].subscribe.splice(productUnSubscriptionIndex, 1);
                        console.log('Product Subcription Deleted');
                    }
                }
            }
        }
    }
    console.log('Subscribe : '+JSON.stringify(subscription));
}

var pollProductList = function(){
    http.get('http://127.0.0.1:3333/priceDataPoint', function(response) {
        var products = '';
        response.on('data', function(d) {
            products += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(products);
            productPrice = parsed.products;
            console.log(productPrice);
        });
    });
    //processChanges(productPrice);
    var news = {
        "user_id": "1429421",
        "subscribe": [
            {
                "product_id": "123411",
                "when": "ALWAYS"
            },
            {
                "product_id": "1234111",
                "when": "ALWAYS"
            }
            ]
    };
    var rems = {
        "user_id": "1429421",
        "unsubscribe": [
            {
                "product_id": "123411"
            }
        ]
    };
    addSubscription(news);
    removeSubscription(rems);
    setTimeout(pollProductList, 150000);
};
pollProductList();