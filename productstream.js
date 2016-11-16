var util = require('util');
var http = require('http');

var index = 0;
var product_size = 10;
var product_id = new Array(product_size);
var product_name = new Array(product_size);
var current_price = new Array(product_size);
var productArray = [];
for(index = 0; index <  product_size; index++){
    product_id[index] = index+1;
    product_name[index] = "product"+product_id[index];
    current_price[index] = 0;
}

http.createServer(function (req, res) {
    productArray = [];
    for(index = 0; index < product_size; index++){
        productArray.push({id: product_id[index], name: product_name[index], price: current_price[index]});
    }
    res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin':'*'});
    res.write(JSON.stringify({products : productArray}));
    res.end();

}).listen(3333);

var randomPriceGenerator = function(){
    console.log("randomPriceGenerator is called every five minutes.");
    for(index = 0; index < product_size; index++){
        current_price[index] = Math.floor((Math.random() * 1000) + 1);
    }
    productArray = [];
    for(index = 0; index < product_size; index++){
        //console.log("Current Price of the product with id : "+product_id[index]+" and name : "+product_name[index] +" price is : "+ current_price[index]);
        productArray.push({id: product_id[index], name: product_name[index], price: current_price[index]});
    }
    console.log(productArray);
    setTimeout(randomPriceGenerator, 300000);
};
randomPriceGenerator();