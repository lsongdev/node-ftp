const tcp          = require('net');
const util         = require('util');
const EventEmitter = require('events');

const CRLF = '\r\n';

/**
 * [FTPClient description]
 * @param {[type]} options [description]
 */
function FtpClient(options){
  EventEmitter.call(this);
  var data = '', parts = [], self = this;
  this.socket = tcp.connect({ port: 2121 })
  .on('error', function(){
    console.error('-x fail to connect ');
  })
  .on('connect', this.emit.bind(this,'connect'))
  .on('data', function(chunk){
    data += chunk;
    parts = data.split(CRLF);
    data = parts.pop();
    parts.forEach(self.parse.bind(self));
  });
};

util.inherits(FtpClient, EventEmitter);

/**
 * [parse description]
 * @param  {[type]} line [description]
 * @return {[type]}      [description]
 */
FtpClient.prototype.parse = function(line){
  var m = line.match(/^(\d{3})\s(.*)$/);
  var code = parseInt(m[1], 10), msg = m[2];
  switch (code) {
    case 220:
      this.name = msg;
      this.emit('ready', msg);
      break;
    case 331:
      this.emit('password', msg);
      break;
    case 230:
      this.emit('login');
      break;
    default:
      console.log(line);
  }
};

/**
 * [send description]
 * @param  {[type]} command [description]
 * @param  {[type]} msg     [description]
 * @return {[type]}         [description]
 */
FtpClient.prototype.send = function(command, msg){
  console.log('-> ', command, msg);
  this.socket.write([ command, msg ].join(' ') + CRLF);
};

/**
 * [pwd description]
 * @return {[type]} [description]
 */
FtpClient.prototype.login = function(name){
  this.send('USER', name);
};

FtpClient.prototype.password = function(password){
  this.send('PASS', password);
};

module.exports = FtpClient;
