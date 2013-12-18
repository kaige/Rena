var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic);
server.listen(8080);
console.log("started server at default port 8080, try 'localhost' in browser");