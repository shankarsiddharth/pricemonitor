var util = require('util');
var http = require('http');

var express = require('express');
var bodyParser = require('body-parser');
var socketio = require('socket.io')

var app = express();
var server = http.Server(app);
var io = socketio(server);

var index = 0;
var product_size = 10;
var product_id = [];
var product_name = [];
var current_price = [];
var current_url = [];
var productArray = [];
var app_users = [{"userid" : "root"}];
var subscription = [];
var all_time_low_product_price = [];

var userSockets = new Map();

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.get('/users/:userId', function(req, res){
    //console.log(req.params);
    app_users.push({"userid": req.params.userId});
    res.json({products: productArray});
});

app.post('/subscribe', function(req, res){
    console.log(req.body);
    addSubscription(req.body);
    res.json({message: 'Subscription successful.'});
});

app.post('/unsubscribe', function(req, res){
    console.log(req.body);
    removeSubscription(req.body);
    res.json({message: 'Product Unsubscription successful'});
});

app.post('/priceDataPoint', function(req, res){
    console.log('PriceDataPoint : ' + JSON.stringify(req.body));
    var newProduct = req.body;
    var productIdPresent = false;
    for(var index in productArray){
        if(productArray[index].id == newProduct.product_id){
            var oldPrice = parseFloat(productArray[index].price);
            productIdPresent = true;
            productArray[index].price = newProduct.price;
            productArray[index].url = newProduct.url;
            if(newProduct.price < productArray[index].all_time_low_price){
                productArray[index].all_time_low_price = newProduct.price;
                processSubscription(productArray[index], 'ALL_TIME_LOW');
            }
            if(newProduct.price < oldPrice){
                var minimumPercentageChange = 10.0;
                var actualChange = ((oldPrice - newProduct.price) / 100.0 ) * 100.0;
                if(actualChange > minimumPercentageChange){
                    processSubscription(productArray[index], 'MORE_THAN_10');
                }
            }
            if(newProduct.price != oldPrice){
                processSubscription(productArray[index], 'ALWAYS');
            }
        }
    }
    if(!productIdPresent){
        product_size++;
        productArray.push({id: newProduct.product_id, name: 'Product'+newProduct.product_id.toString(), price: newProduct.price, url: newProduct.url, all_time_low_price: newProduct.price});
    }
    res.json({message: 'Product updated successfully'});
});

app.get('/priceDataPoint', function(req, res){
    res.json({products : productArray});
});

app.get('/subscription', function(req, res){
    res.json({subscription : subscription});
});

var addSubscription = function(currentSubscription){
    var newSubscription = {user_id: currentSubscription.user_id, subscribe: []};
    var subscribe = currentSubscription.subscribe;
    var subscribeMap = new Map();
    for(var subscriptionIndex in subscribe){
        subscribeMap.set(subscribe[subscriptionIndex].product_id, subscribe[subscriptionIndex].when);
    }
    subscribeMap.forEach(function (value, key) {
        newSubscription.subscribe.push({product_id : key, when: value});
    });
    var isUserIdPresent = false;
    for( var userIndex in subscription){
        if(newSubscription.user_id == subscription[userIndex].user_id){
            isUserIdPresent = true;
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
    for(var sIndex in subscription){
        if(subscription[sIndex].subscribe.length <= 0){
            subscription.splice(sIndex, 1);
        }
    }
    console.log('Subscribe : '+JSON.stringify(subscription));
};

var processSubscription = function (updatedProduct, reason) {
    for(var subscriptionIndex in subscription){
        for(var productIndex in subscription[subscriptionIndex].subscribe){
            if(updatedProduct.id == subscription[subscriptionIndex].subscribe[productIndex].product_id){
                if(reason == subscription[subscriptionIndex].subscribe[productIndex].when){
                    var notificationPayload = {productId: updatedProduct.id, url: updatedProduct.url, price: updatedProduct.price, reason: reason};
                    console.log('UserId : ' + subscription[subscriptionIndex].user_id);
                    console.log('PayLoad : ' + JSON.stringify(notificationPayload));
                }
            }
        }
    }
};

var startProductStream = function(){
    for(index = 0; index <  product_size; index++){
        product_id[index] = (index+1).toString();
        product_name[index] = "product"+product_id[index];
        current_price[index] = 0;
        current_url[index] = 'http://www.amazon.com/product/'+(product_id[index]).toString();
        current_price[index] = Math.floor((Math.random() * 1000) + 1);
        all_time_low_product_price[index] = current_price[index];
        productArray.push({id: product_id[index], name: product_name[index], price: current_price[index], url: current_url[index], all_time_low_price: all_time_low_product_price[index]});
    }
    console.log("Product Stream Server Started");
    //console.log(productArray);
};

startProductStream();

io.on('connection', function (socket) {
    socket.on('addUser', function(data){
        userSockets.set(data.userId, socket);
        console.log('User with ID: '+ data.userId +' Connected');
    });
    socket.on("disconnect", function () {
        userSockets.forEach(function (value, key){
            if(value == socket){
                userSockets.delete(key);
                console.log('User with ID:' + key + ' Disconnected');
            }
        });
    });
});

server.listen(3333);
console.log('Server running on http://127.0.0.1:3333/');