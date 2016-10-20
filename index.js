const FtpClient = require('./lib/client');
const FtpServer = require('./lib/server');

exports.connect = function(hostname, port){
  return new FtpClient(hostname, port);
};

exports.createServer = function(callback){
  var server = new FtpServer();
  server.on('connection', callback);
  return server;
};
