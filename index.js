const FtpClient = require('./lib/client');
const FtpServer = require('./lib/server');

/**
 * [Client description]
 * @type {[type]}
 */
exports.Client = FtpClient;
exports.Server = FtpServer;

/**
 * [connect description]
 * @param  {[type]}   connection [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
exports.connect = function(connection, callback){
  var client = new FtpClient(connection);
  client.on('connect', callback);
  return client;
};
/**
 * [createServer description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
exports.createServer = function(callback){
  var server = new FtpServer();
  server.on('connection', callback);
  return server;
};
