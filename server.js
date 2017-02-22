const tcp          = require('net');
const util         = require('util');
const EventEmitter = require('events');

const CRLF = '\r\n';

/**
 * [Server description]
 * @docs https://www.ietf.org/rfc/rfc959.txt
 */
function Server(options){
  var self = this;
  this.server = tcp.createServer();
  this.server.on('connection', function(socket){
    var client = new Connection(socket);
    self.emit('connection', client);
  });
};

util.inherits(Server, EventEmitter);

/**
 * [function description]
 * @return {[type]} [description]
 */
Server.prototype.listen = function(){
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
  var self = this;
  var m = line.match(/^(\w+)(\s(.*))?$/);
  var cmd = m[1], arg = m[3];
  console.log('< ', line);
  switch(cmd){
    case 'USER':
      this.emit('user', arg);
      this.reply(331, 'Please specify the password.');
      break;
    case 'PASS':
      this.reply(230, 'Login successful.');
      break;
    case 'SYST':
      this.reply(215, 'Node FTP server')
      break;
    case 'FEAT':
      this.reply('211-Extensions supported');
      this.reply(211, 'End');
      break;
    case 'CWD':
      this.pwd = arg;
      this.reply(250, 'Directory changed to ' + arg);
      break;
    case 'PWD':
      this.reply(257, '"' + this.pwd + '"');
      break;
    case 'TYPE':
      if(arg == 'A') this.mode = 'ascii';
      if(arg == 'I') this.mode = 'binary';
      this.reply(200, 'Type set to ' + arg);
      break;
    case 'PORT':
      var addr = arg.split(',');
      var host = [ addr[0], addr[1], addr[2], addr[3] ].join('.');
      var port = (parseInt(addr[4]) * 256) + parseInt(addr[5]);
      this.reply(200, 'PORT command successful.');
      break;
    case 'PASV':
      this.createServer(function(host, port){
        var i1 = parseInt(port / 256);
        var i2 = parseInt(port % 256);
        host = host.split('.').join(',');
        var address = [ host, i1, i2 ].join(',');
        this.reply(227, 'Entering Passive Mode ('+ address +')');
      });
      break;
    case 'EPSV':
      // Enter extended passive mode. (RFC 2428)
      this.reply(202, 'Not supported');
      break;
    case 'LIST':
      self.psock.end('test', function(){
        self.reply(226, 'Transfer OK');
      });
      break;
    case 'SIZE':
      this.reply(213, 65535);
      break;
    case 'MDTM':
      this.reply(213, '19980615100045.014');
      break;
    case 'MLST':
      self.reply(250, 'k=v');
      // self.psock.end('Media-Type=text', function(){
      //   self.reply(226, 'Transfer OK');
      // });
      break;
    case 'STOR':
      this.psock
      .setEncoding(this.mode)
      .on('error', function(err){
        console.log('perr', err);
      })
      .on('data', function(buf){
        console.log('pdata');
      })
      .on('end', function(){
        console.log('end');
        self.reply(226, 'Closing data connection, recv 65536 bytes');
      });
      break;
    case 'RETR':
      this.psock.end('hello', function(){
        self.reply(226, 'Closing data connection, sent 65536 bytes');
      });
      break;
    case 'RNFR':
      this.reply(350, 'file exists, ready for destination name.');
      break;
    case 'RNTO':
      this.reply(250, 'file renamed successfully');
      break;
    case 'DELE':
      this.reply(250, 'file deleted');
      break;
    case 'QUIT':
      this.client.end();
      break;
    default:
      console.warn('command not supported', line);
      this.reply(202, 'Not supported');
      break;
  };
};

/**
 * [createServer description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Connection.prototype.createServer = function(callback){
  var self = this;
  this.pserver = tcp.createServer(function(psock){
    self.psock = psock;
    self.reply(150, 'Connection Accepted');
  }).listen(function(port){
    var address = this.address();
    callback.call(self, '127.0.0.1', address.port);
  });
};
/**
 * [Connection description]
 * @type {[type]}
 */
Server.Connection = Connection;

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = Server;
