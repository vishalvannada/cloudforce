/**

 Mighty Gumball, Inc.
 Version 5.0

 - Refactored Previous REST Client Approach to Transaction Based REST API
 - (i.e. instead of the Scaffolded REST API based on Domain Object Annotation)
 - Handlebars Page Templates
 - Client State Validation using HMAC Key-Based Hash

 NodeJS-Enabled Standing Gumball
 Model# M102988
 Serial# 1234998871109

 **/

var get_items = "http://54.183.178.122:3000/items";
var get_deals1 = "http://52.14.86.138:3000/deals";
var get_deals = "http://18.221.14.73:3000/deals";
var deals_counter = 0;
var payments_counter = 0;
var get_order = "http://54.183.178.122:3000/order";
var get_cart = "http://35.165.70.132:3000/cart";
var post_cart = "http://35.165.70.132:3000/storeincart";
var delete_cart_item = "http://35.165.70.132:3000/remove";
var payment = "http://ec2-35-165-120-117.us-west-2.compute.amazonaws.com:3100/payment";
var login = "http://54.201.235.180:3000/login";
var signup = "http://54.201.235.180:3000/signup";

var crypto = require('crypto');
var fs = require('fs');
var Client = require('node-rest-client').Client;
var FormData = require('form-data');


var express = require("express");

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

var app = express();

app.use(express.bodyParser());
app.use("/images", express.static(__dirname + '/images'));
app.use("/public", express.static(__dirname + '/public'));
// handlebars  = require('express3-handlebars');
// hbs = handlebars.create();
// app.engine('handlebars', hbs.engine);
app.set('view engine', 'ejs');


var store = require('store');

var handle_checklogin = function (req, res, next) {
    console.log("inside login");
    var username = req.param("username");
    var password = req.param("password");
    var client = new Client();
    client.post(login + '/' + username + '/' + password,
        function (data, response_raw) {
            console.log("After LOGIN");
            jsdata = JSON.parse(data);

            if (jsdata == null) {
                res.render('login', {error: 'invalid', logged: 'no'})
            }
            localStorage.setItem('user', username);
            console.log(username);
            res.render('home', {logged: 'yes', username: username.toString()})
        });
};

var handle_get = function (req, res, next) {


    var temp = '';
    console.log('user')
    console.log(localStorage.getItem('user'))
    if (localStorage.getItem('user') == undefined) {
        temp = 'no';
    } else
        temp = 'yes';
    res.render('home', {logged: temp});
};

var handle_get_menu = function (req, res, next) {
    console.log("In Get Menu");
    var client = new Client();
    client.get(get_items,
        function (data, response_raw) {
            console.log("In client.Get Menu");
            jsdata = JSON.parse(data);
            console.log(jsdata.length);
            var temp;

            if (localStorage.getItem('user') == undefined) {
                temp = 'no';
            } else
                temp = 'yes';
            res.render('menu', {data: jsdata, logged: temp})
        });
    console.log("In out Get Menu");
};

var handle_login = function (req, res, next) {
    console.log("In Login ");
    res.render('login', {error: 'no', logged: 'no'})
};


var handle_signup = function (req, res, next) {
    console.log("In Signup ");
    res.render('signup');
};


var handle_get_cart = function (req, res, next) {
    var client = new Client();

    if (localStorage.getItem('user') == undefined) {
        res.redirect('/')
    }
    else {
        client.get(get_cart + '/' + localStorage.getItem('user'),
            function (data, response_raw) {
                jsdata = JSON.parse(data)
                var temp;
                temp = 'yes';
                res.render('cart', {data: jsdata, logged: temp})
            });
    }
};


var handle_checksignup = function (req, res, next) {
    var username = req.param("username");
    var password = req.param("password");
    var firstname = req.param("firstname");
    var lastname = req.param("lastname");
    var client = new Client();
    console.log(username);
    console.log(password);
    var temp = '';
    if (localStorage.getItem('user') == undefined) {
        temp = 'no';
    } else
        temp = 'yes';
    client.post(signup + '/' + username + '/' + password + '/' + firstname + '/' + lastname,
        function (data, response_raw) {
            res.render('login', {error: 'no', logged: temp})
        });
};


var handle_get_order = function (req, res, next) {
    console.log("In Get Order");
    var p = req.param("id")
    console.log(p);
    var client = new Client();
    client.get(get_order + '/' + p,
        function (data, response_raw) {
            res.render('order', {data: JSON.parse(data)})

        });


}


var handle_deleteCartItem = function (req, res, next) {

    var Id = req.param("Id");
    console.log("In cart delete", Id);
    console.log(Id);
    var client = new Client();

    if (localStorage.getItem('user') == undefined) {
        console.log("No")
    } else {
        client.delete(delete_cart_item + '/' + Id + '/' + localStorage.getItem('user'),
            function (data, response_raw) {
                res.redirect('/cart')
                // client.get(get_cart,
                //     function (data1, response_raw) {
                //         jsdata = JSON.parse(data1)
                //         console.log(jsdata.length);
                //         res.render('cart', {data: jsdata})
                //     });
            });
    }
}


var handle_logout = function (req, res, next) {
    console.log(localStorage.getItem('user'))
    localStorage.removeItem('user');
    localStorage.clear();
    console.log(localStorage.getItem('user'))
    res.redirect('/login')
}


var handle_cartorder = function (req, res, next) {

    var Id = req.param("id");
    var Name = req.param("name");
    var Price = req.param("price");
    var Path = req.param("path");


    console.log("in cart order");
    console.log(Id);
    console.log(Name);
    console.log(Price);
    console.log(Path);



    var client = new Client();
    client.post(post_cart + '/' + Id + '/' + Name + '/' + Price + '/' + Path + '/' + localStorage.getItem('user'),
        function (data, response_raw) {
            res.redirect('/cart')
        });
}

var handle_get_deal = function (req, res, next) {
    var cur_deals;
    deals_counter++;
    console.log("In Deal Menu");
    if (deals_counter % 2 == 0) {
        cur_deals = get_deals1;

    }
    else {
        cur_deals = get_deals;
    }


    console.log(cur_deals, deals_counter);
    var client = new Client();
    client.get(cur_deals,
        function (data, response_raw) {
            console.log("In client.Get Deals");
            jsdata = JSON.parse(data)
            console.log(jsdata.length);
            res.render('deals', {data: jsdata})

        });

    console.log("In out Deals");


}


var handle_payment = function (req, res, next) {
    payments_counter++;
    var db = 0;
    switch (payments_counter % 3) {
        case 0:
            db = 0;
            break;
        case 1:
            db = 1;
            break;
        case 3:
            db = 1;
            break;
        default:
            db = 0;


    }

    var items = req.param("items");
    var price = req.param("price");

    console.log("in cart order");
    console.log(items);
    console.log(price);

    var formData = new FormData();
    formData.append('Items', items);
    formData.append('Price', price);
    formData.append('OrderStatus', "FGHJ");

    formData.Items = items;
    formData.Price = price;
    formData.OrderStatus = 'Placed';

    var args = {
        data: {
            Items: items,
            OrderStatus: 'Placed',
            Price: price,
            UserName: localStorage.getItem('user'),
            Database: db.toString()
        },
        headers: {"Content-Type": "application/json"}
    };


    var client = new Client();
    client.post(payment, args,
        function (data, response_raw) {
            console.log(data)
            jsdata = JSON.parse(data)
            res.render('success', {data: jsdata})
            // client.get(get_cart,
            //     function (data1, response_raw) {
            //         jsdata = JSON.parse(data1)
            //         console.log(jsdata.length);
            //         res.redirect('cart', {data: jsdata})
            //     });

        });


}

/*  Handlebars Test using Home template

app.get('/', function (req, res, next) {
    res.render('home', {
        showTitle: true,
        helpers: {
            foo: function () { return 'foo!'; },
            bar: function () { return 'bar!'; }
        }
    });
});

*/

app.get('/', handle_get);

app.get('/menu', handle_get_menu);

app.get('/order', handle_get_order);

app.get('/cart', handle_get_cart);
app.get('/deals', handle_get_deal);

app.post('/cartorder', handle_cartorder);

app.get('/login', handle_login);

app.post('/checklogin', handle_checklogin);

app.post('/checksignup', handle_checksignup);

app.get('/signup', handle_signup);

app.get('/deleteCartItem', handle_deleteCartItem);

app.get('/logout', handle_logout);

app.post('/payment', handle_payment);

console.log("Server running on Port 8080...");


app.set('port', (process.env.PORT || 8080));
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


/**

 Mighty Gumball, Inc.

 NodeJS-Enabled Standing Gumball
 Model# M102988
 Serial# 1234998871109

 **/