var express = require('express'),
    url = require('url'),
    server = express(),
    bodyParser = require('body-parser'),
    mysql = require('mysql');


var db_options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'user123',
    database: 'test'
    //ssl: 'Amazon RDS'
};

var connectionpool = mysql.createPool(db_options);

function processquery(query, res, next) {
    connectionpool.getConnection(function(err, connection) {
        if (err) {
            console.log(err);
            res.statusCode = 503;
            res.send({error: {code:err.code, message:'Service Unavailable.'}});
            return next(err);
        }

        connection.query(query, function(err, result, fields) {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.send({error: {code:err.code, message:'Error occurred processing this request.'}});
                connection.release();
                return next(err);
            }
            connection.release();
            next(null, result);
        });
    });
}
server.use( bodyParser.json() );       // to support JSON-encoded bodies
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
server.use(express.static(__dirname + '/'));

server.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'x-auth-token,X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

server.post('/saveSeriesData', function(req, res) {
    // console.log(req.body);
    var series = [], jsonObj = [];
    
    /*for(var i in req.body.jsonData) {
        series.push(i);
        jsonObj.push(JSON.stringify(req.body.jsonData[i]))
    }*/
    // console.log(series, jsonObj);
    // var some = JSON.parse(req.body.jsonData);
    var xx = JSON.stringify(req.body.jsonData);
    var query = 'INSERT INTO series_info ( data ) VALUES (\''+xx+'\')';
// ("'+series[0]+'", "'+jsonObj[0]+'" ), ("'+series[1]+'", "'+jsonObj[1]+'" ), ("'+series[2]+'", "'+jsonObj[2]+'" ), ("'+series[3]+'", "'+jsonObj[3]+'" )'
    processquery(query, res, function(err, result){
        if(err) {
            console.log(err);
        }
        console.log(result);
        res.send(result[0]);
    });
});

server.listen(3030);