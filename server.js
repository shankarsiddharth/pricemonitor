var util = require('util');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var index = 0;
var product_size = 10;
var product_id = [];
var product_name = [];
var current_price = [];
var current_url = [];
var productArray = [];
var app_users = [{"userid" : "root"}];

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.get('/users/:userId', function(req, res){
    console.log(req.params);
    app_users.push({"userid": req.params.userId});
    res.json({products: productArray});
});

app.post('/priceDataPoint', function(req, res){
    console.log('PriceDataPoint : ' + JSON.stringify(req.body));
    var newProduct = req.body;
    var productIdPresent = false;
    for(var index in productArray){
        if(productArray[index].id == newProduct.product_id){
            productIdPresent = true;
            productArray[index].price = newProduct.price;
            productArray[index].url = newProduct.url;
        }
    }
    if(!productIdPresent){
        product_size++;
        productArray.push({id: newProduct.product_id, name: 'Product'+newProduct.product_id.toString(), price: newProduct.price, url: newProduct.url});
    }
    res.json({message: 'Product updated successfully'});
});

app.get('/priceDataPoint', function(req, res){
    res.json({products : productArray});
});

var startProductStream = function(){
    for(index = 0; index <  product_size; index++){
        product_id[index] = index+1;
        product_name[index] = "product"+product_id[index];
        current_price[index] = 0;
        current_url[index] = 'http://www.amazon.com/product/'+(product_id[index]).toString();
    }
    console.log("Product Stream Server Started");
    for(index = 0; index < product_size; index++){
        current_price[index] = Math.floor((Math.random() * 1000) + 1);
    }
    productArray = [];
    for(index = 0; index < product_size; index++){
        productArray.push({id: product_id[index], name: product_name[index], price: current_price[index], url: current_url[index]});
    }
    console.log(productArray);
};

startProductStream();

app.listen(3333);