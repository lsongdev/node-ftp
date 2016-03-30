const FtpServer = require('./lib/server');

exports.createServer = function(callback){
  var server = new FtpServer();
  server.on('connection', callback);
  return server;
};
