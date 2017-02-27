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
  var defaults = {
    username: this.username,
    password: this.password,
    auth    : this.auth,
    list    : this.list,
    get     : this.get,
    put     : this.put,
    cwd     : this.cwd,
    pwd     : this.pwd,
  };
  for(var key in options)
    defaults[ key ] = options[ key ];
  this.options = defaults;
  this.server = tcp.createServer();
  this.server.on('connection', function(socket){
    var connection = new Connection(self, socket);
    self.emit('connection', connection);
  });
  return this;
};

util.inherits(Server, EventEmitter);

/**
 * [function description]
 * @return {[type]} [description]
 */
Server.prototype.listen = function(){
  this.server.listen.apply(this.server, arguments);
  return this;
};

/**
 * [Connection description]
 * @param {[type]} client [description]
 */
function Connection(server, socket){
  EventEmitter.call(this);
  this.socket  = socket;
  this.options = server.options;
  var data = '', parts = [], self = this;
  socket.on('data', function(chunk){
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
  this.socket.write([ code, msg ].join(' ') + CRLF);
};

/**
 * [parse description]
 * @return {[type]} [description]
 */
Connection.prototype.parse = function(line){
  var self = this;
  console.log('< ', line);
  var m = line.match(/^(\w+)(\s(.*))?$/);
  var cmd = m[1], arg = m[3];
  switch(cmd){
    case 'USER':
      this.username = arg;
      this.reply(331, 'Please specify the password.');
      break;
    case 'PASS':
      this.password = arg;
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
      this.currentDirectory = arg;
      this.reply(250, 'Directory changed to ' + arg);
      break;
    case 'PWD':
      this.reply(257, '"' + this.currentDirectory + '"');
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
      this.transfer = tcp.connect(port, host, function(err){
        self.reply(200, 'PORT command successful.');
      });
      break;
    case 'PASV':
      return tcp.createServer(function(sock){
        self.transfer = sock;
        self.reply(150, 'Connection Accepted');
      }.bind(this)).listen(function(err){
        var address = this.address();
        var host = '127.0.0.1';
        var port = address.port;
        var i1 = parseInt(port / 256);
        var i2 = parseInt(port % 256);
        var address = host.split('.').concat([ i1, i2 ]).join(',');
        self.reply(227, 'Entering Passive Mode ('+ address +')');
      });
      break;
    case 'EPSV':
      // Enter extended passive mode. (RFC 2428)
      this.reply(202, 'Not supported');
      break;
    case 'LIST':
      this.transfer.end('test', function(){
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
      this.transfer.setEncoding(this.mode);
      this.options.put(arg, this.transfer);
      self.transfer.once('end', function(){
        self.passiveServer.close();
        self.reply(226, 'Transfer OK');
      });
      break;
    case 'RETR':
      this.options.get(arg).pipe(this.transfer);
      self.transfer.once('end', function(){
        self.passiveServer.close();
        self.reply(226, 'Transfer OK');
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
      this.transfer.end();
      this.socket.end('bye!');
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
Server.Connection = Connection;

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = Server;
