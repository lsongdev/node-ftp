const tcp          = require('net');
const util         = require('util');
const EventEmitter = require('events');

const CRLF = '\r\n';

/**
 * [FtpServer description]
 */
function FtpServer(options){
  var self = this;
  this.server = tcp.createServer();
  this.server.on('connection', function(socket){
    var client = new Connection(socket);
    self.emit('connection', client);
  });
};

util.inherits(FtpServer, EventEmitter);

/**
 * [function description]
 * @return {[type]} [description]
 */
FtpServer.prototype.listen = function(){
  this.server.listen.apply(this.server, arguments);
};

/**
 * [Connection description]
 * @param {[type]} client [description]
 */
function Connection(client){
  EventEmitter.call(this);
  this.client = client;
  var data = '', parts = [], self = this;
  client
  .on('error', function(err){
    console.log(err);
  })
  .on('data', function(chunk){
    data += chunk;
    parts = data.split(CRLF);
    data = parts.pop();
    parts.forEach(self.parse.bind(self));
  });
  
  this.reply(220, 'FTP Server');
};

util.inherits(Connection, EventEmitter);

/**
 * [reply description]
 * @param  {[type]} code [description]
 * @param  {[type]} msg  [description]
 * @return {[type]}      [description]
 */
Connection.prototype.reply = function(code, msg){
  msg = msg || '';
  console.log('> ', code, msg);
  this.client.write([ code, msg ].join(' ') + CRLF);
};

/**
 * [parse description]
 * @return {[type]} [description]
 */
Connection.prototype.parse = function(line){
  var msg = '';
  console.log('< ', line);
  var m = line.match(/^(\w+)\s(.*)$/);
  var cmd = m[1], arg = m[2];
  switch(cmd){
    case 'USER':
      this.emit('user', arg);
      this.reply(331, 'User name ok, need password');
      break;
    case 'PASS':
      this.reply(230, 'User logged in');
      break;
    case 'SYST':
      this.reply(215, 'Node FTP server')
      break;
    case 'FEAT':
      this.reply('211-Extensions supported');
      this.reply(211, 'End');
      break;
    case 'PWD':
      this.reply(257, '"/"');
      break;
    case 'CWD':
      this.reply(250, 'Directory changed to');
      break;
    case 'TYPE':
      this.reply(200);
      break;
    case 'EPSV':
      // Enter extended passive mode. (RFC 2428)
      this.reply(202, 'Not supported');
      break;
    default:
      console.warn('command not supported', line);
      this.reply(202, 'Not supported');
      break;
  };
};
/**
 * [Connection description]
 * @type {[type]}
 */
FtpServer.Connection = Connection;

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = FtpServer;
