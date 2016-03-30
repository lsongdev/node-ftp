const tcp          = require('net');
const util         = require('util');
const EventEmitter = require('events');
/**
 * [FtpServer description]
 */
function FtpServer(){
  this.server = tcp.createServer();
  this.server.on('connection', this.process.bind(this));
};

util.inherits(FtpServer, EventEmitter);


FtpServer.prototype.process = function(socket){
  socket.write('220\r\n');
  socket.on('error', function(err){

  }).on('data', function(chunk){
    console.log(String(chunk));
    socket.write('220\r\n');
  });
};

/**
 * [function description]
 * @return {[type]} [description]
 */
FtpServer.prototype.listen = function(){
  this.server.listen.apply(this.server, arguments);
};
/**
 * [exports description]
 * @type {[type]}
 */
module.exports = FtpServer;
