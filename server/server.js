// BASE SETUP
// =============================================================================
const fs = require('fs');
const path = require('path');
var mime = require('mime');
var https = require('https');

const express = require('express'),
	bodyParser = require('body-parser');

const mysite = ('./build/cert/wanchain.org.key'); //key
const mysiteCrt = ('./build/cert/3bb55a3526ededcc.crt'); //
const gd1 = ('./build/cert/gd_bundle-g2-g1.crt');

var app = express();
app.use(bodyParser());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Content-Security-Policy", "upgrade-insecure-requests");
	next();
});

var env = app.get('env') == 'development' ? 'dev' : app.get('env');
var port = process.env.PORT || 3000;


// DOWNLOAD FILE
app.get('/white_paper/:fileName', function(req, res, next){

	// var file = req.params.file

	var fileName = req.params.fileName;
	var filePath ="./server/files/" + fileName;
	var stats = fs.statSync(filePath);
	if(stats.isFile()){
		res.set({
			'Content-Type': 'application/octet-stream',
		});
		fs.createReadStream(filePath).pipe(res);
	} else {
		res.end(404);
	}
});

// ======Router======
var Router = require("./modules/index");

for (var i in Router) {
	// Middleware to use for all requests
	Router[i].use(function(req, res, next) {
		// do logging
		// console.log('Something is happening.');
		next();
	});

// REGISTER OUR ROUTES
// =============================================================================
	app.use('/api', Router);
}


// START THE SERVER
// =============================================================================
https.createServer({
	key: fs.readFileSync(mysite),
	cert: fs.readFileSync(mysiteCrt),
	ca: [fs.readFileSync(gd1)],
	requestCert: false,
	rejectUnauthorized: false
	//ca: [fs.readFileSync(gd1)]
}, app).listen(port);

console.log('Magic happens on port ' + port);
