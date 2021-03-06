var express = require("Express");
var router = express.Router();
var mongoClient = require('mongodb').MongoClient;

/* NodeMailer*/
var nodemailer = require('nodemailer');

/* Used to load the static folder and files */
router.use('/', express.static(__dirname + ''));

/* To set the path of the static html file to be served. */
var path = require('path');
var db;



/* Connecting with Mongo DB */
mongoClient.connect('mongodb://localhost:27017/farmersowndb', (err, database)=>{
    if(err){
        console.log('error occured while retriving');
        return;
    }
    else{
        console.log('Connected to Mongo DB');
    }

    db = database;
});

/* APIs RELATED TO ITEMS*/

// Handling an GET request.
// To retrieve all the items in the DB.
// Collections used - GET_ITEMS.
router.get('/getItems', function(req, res){
    sendMail();
    var itemDetails = db.collection('itemDetails');
    itemDetails.find().toArray(function(err, docs) {
        var itemArray = [];
        for(var i = 0; i< docs.length; i++){
            var itemDetail = docs[i];
            itemArray.push(itemDetail);
        }
        res.send(itemArray);
    })
});


// Handling an POST request.
// To Add or Update new Item in the DB.
// Collections used - UPDATE_ITEMS.
router.post('/updateItems', function(req, res){
    
    var itemDetails = db.collection('itemDetails');
    itemDetails.find({'itemName': req.body.itemName}).toArray(function(err, docs) {
        var itemObject = docs[0];
        if(itemObject){
            itemDetails.update(
                {
                    'itemName': req.body.itemName
                },
                {
                    itemName: req.body.itemName,
                    itemPrice : req.body.itemPrice,
                    itemUnit : req.body.itemUnit,
                    currentStock : req.body.currentStock
                },
                function(err, result) {}
            );

            res.send("Item "+req.body.itemName+" successfully inserted");
        }
        else{
            itemDetails.insertOne( {
                itemName : req.body.itemName,
                itemPrice : req.body.itemPrice,
                itemUnit : req.body.itemUnit,
                currentStock : req.body.currentStock
            }, function(err, result) {
                
            });
            res.send("New Item successfully inserted");
        }
        
    });
});

/* APIs RELATED TO ORDER.*/

// Handling an POST request.
// To place a new order in the DB.
// Collections used - PLACE_ORDER.
router.post('/placeOrder', function(req, res){
    
    var orderDetails = db.collection('orderDetails');
    var currentDate = new Date();
    var currentTime = currentDate.getTime();
    orderDetails.insertOne( {
        username : req.body.username,
        name : req.body.name,
        phone : req.body.phone,
        address : req.body.address,
        itemList : req.body.itemList,
        email : req.body.email,
        deliveryTime : req.body.deliveryTime,
        orderId : currentTime,
        currentStatus : "Undelivered"

    }, function(err, result) {
        
    });
    res.send("your orderId is "+ currentTime);
});

// Handling an GET request.
// To retrieve all the orders from DB.
// Collections used - ORDER_DETAILS.
router.get('/getAllOrders', function(req, res){
    
    var orderDetails = db.collection('orderDetails');
    orderDetails.find().toArray(function(err, docs) {
        var orderArray = [];
        for(var i = 0; i< docs.length; i++){
            var order = docs[i];
            orderArray.push(order);
        }
        res.send(orderArray);
    })
});

// Handling an GET request.
// To retrieve all new order from DB.
// Collections used - ORDER_DETAILS.
router.get('/getNewOrders', function(req, res){
    
    var orderDetails = db.collection('orderDetails');
    orderDetails.find({currentStatus : "Undelivered"}).toArray(function(err, docs) {
        var orderArray = [];
        for(var i = 0; i< docs.length; i++){
            var order = docs[i];
            orderArray.push(order);
        }
        res.send(orderArray);
    })
});


/* APIs RELATED TO DEALERS */ 

// Handling the POST add new Dealer.
// To add new Dealer details.
// Collections used - DEALERS.
router.post('/addNewDealer', function(req, res){
    
    var dealers = db.collection('dealers');
    
    dealers.insertOne( {
        dealerName : req.body.dealerName,
        phone : req.body.phone,
        address : req.body.address,
    }, function(err, result) {
        
    });
    res.send({code:"200"});
});

// Handling the POST Request.
// To update new Dealer details.
// Collections used - DEALERS.
router.post('/updateDealer', function(req, res){
    
    var dealers = db.collection('dealers');
    
    dealers.update({'phone' : req.body.oldData.phone}, {
        dealerName : req.body.newData.dealerName,
        phone : req.body.newData.phone,
        address : req.body.newData.address,
    }, function(err, result) {
        if(err){

        }else{
            res.send({code:"200"});
        }
    });
    
});

// Handling the POST Request.
// To DELETE a Dealer details.
// Collections used - DEALERS.
router.post('/deleteDealer', function(req, res){
    
    var dealers = db.collection('dealers');
    
    dealers.remove({'phone' : req.body.phone}, 
        function(err, result) {
            if(err){

            }
            else{
                res.send({code:"200"});
            }
        }
    );
});



// Handling the POST Request.
// To add Dealer's sale record.
// Collections used - DEALERSSALE.
router.post('/addNewDealerSale', function(req, res){
    
    var DealersSale = db.collection('DealersSale');
    
    DealersSale.insertOne( {
        dealerName : req.body.dealerName,
        sellingList : req.body.sellingList,
        date : req.body.date,
        totalSelling : req.body.totalSelling,
    }, function(err, result) {
        
    });
    res.send("New dealer's sale record added.");
});

// Handling an GET request.
// To retrieve all the Dealers in the DB.
// Collections used - DEALERS.
router.get('/getAllDealers', function(req, res){
    
    var dealers = db.collection('dealers');
    dealers.find().toArray(function(err, docs) {
        var dealersArray = [];
        for(var i = 0; i< docs.length; i++){
            var dealerDetails = docs[i];
            dealersArray.push(dealerDetails);
        }
        console.log(dealersArray);
        res.send({"dealersList":dealersArray});
    });
});


// function to update item stock.
function updateItemStock(purchaseList){
    var itemDetails = db.collection('itemDetails');
    for(var i= 0; i<purchaseList.length; i++){
        itemDetails.update(
            {
                'itemName':purchaseList[i].itemName
            },
            {
                    
            }
    )
    }
    itemDetails.find().toArray(function(err, docs) {
        var itemArray = [];
        
        for(var i = 0; i< docs.length; i++){

            var itemDetail = docs[i];
            itemArray.push(itemDetail);
        }
        res.send(itemArray);
    })
}



/* APIs RELATED TO DAILY PURCHASE */ 

// Handling the POST request to add daily purchase details.
// Collections used - PURCHASE.
router.post('/addTodaysPurchase', function(req, res){
    
    var Purchase = db.collection('Purchase');

    Purchase.insertOne( {
        purchaseList : req.body.purchaseList,
        area : req.body.area,
        date : req.body.date,
        totalCost : req.body.totalCost
    }, function(err, result) {
        
    });
    //updateItemStock( req.body.purchaseList);
    res.send("New purchase record added");
});

/* APIs RELATED TO ACCOUNTS */ 

// Handling the POST request to login.
// To check for successful login.
// Collections used - LOGIN.
router.post('/login', function(req, res) {
    console.log(req.body);
    var user = db.collection('login');
    user.find({'username': req.body.username}).toArray(function(err, docs) {
        var userObject = docs[0];
        console.log(docs[0]);
        if(userObject){
            if(userObject.password == req.body.password){
                console.log("Password match");
                res.send({msg:"Login Success"});
            }
            else{
                console.log("Password not match");
                res.send({msg:"Password not match"});
            }
        }
        else{
            console.log("Data Not Found");
            res.send({msg:"Invalid Credential"});
        }
    });
});

// Send Email

function sendMail(){
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "rahul.v.140389@gmail.com", // generated ethereal user
            pass: "Rvd#1407"  // generated ethereal password
        },
        tls:{
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Rahul Verma" <rahul.v.140389@gmail.com>', // sender address
        to: 'rahulverma140389@gmail.com', // list of receivers
        subject: 'Sample test mail', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello Rahul</b>' // html body
    };

     // send mail with defined transport object
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
}


module.exports = router;