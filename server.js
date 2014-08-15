// based on http://webapplog.com/express-js-4-node-js-and-mongodb-rest-api-tutorial/

// move repo to this folder...

var express = require('express'),
    mongoskin = require('mongoskin'),
    bodyParser = require('body-parser'),
    tracking = require('./controllers/trackingController');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

var db = mongoskin.db('mongodb://testuser:JustTesting@kahana.mongohq.com:10079/trekker', { safe: true });

app.param('collectionName', function (req, res, next, collectionName) {
    console.log("collectionName rule match, getting collection: " + collectionName);
    req.collection = db.collection(collectionName);
    return next();
});

app.param('deviceId', function (req, res, next, deviceId) {
    console.log("deviceId rule match, getting device: " + deviceId);
    req.deviceId = deviceId;
    return next();
});

app.get('/', function (req, res) {
    res.send('please select a collection, e.g., /devices/ID (GUID)/locations/');
});

app.get('/devices/:deviceId/:collectionName', function (req, res, next) {
    req.collection.find({ deviceId: req.deviceId }, { limit: 10, sort: [['_id', -1]] }).toArray(function (e, results) {
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/devices/:deviceId/:collectionName', function (req, res, next) {
    var item = {
        location: req.body.currentLocation,
        deviceId: req.deviceId,
        timestamp: new Date(),
    };
    
    req.collection.insert(item, {}, function (e, results) {
        if (e) return next(e);
        res.send(results);
    });
});

app.get('/devices/deviceId/:collectionName/:id', function (req, res, next) {
    //TODO: deviceId is not indexed yet...
    req.collection.findById(req.params.id, function (e, result) {
        if (e) return next(e);
        res.send(result);
    });
});

console.log("Listening...");
var port = process.env.PORT || 1337;
app.listen(port);