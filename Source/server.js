var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic);
server.listen(80);
console.log("started server at default port 80, try 'localhost' in browser");