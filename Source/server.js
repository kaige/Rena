var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/public');
var server = http.createServer(ecstatic);
server.listen(8080);