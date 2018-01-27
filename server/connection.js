const util = require('util');
const EventEmitter = require('events');
const debug = util.debuglog('xftp');

const CRLF = '\r\n';

class Connection extends EventEmitter {
  constructor(client, server){
    super();
    this.client = client;
    this.server = server;
    let data = '', parts = [];
    this.client.on('data', chunk => {
      data += chunk;
      parts = data.split(CRLF);
      data = parts.pop();
      parts.forEach(line => {
        const { cmd, arg } = this.parse(line);
        this.emit('command', cmd, arg);
      });
    });
    this.on('command', (cmd, arg) => {
      this.emit(cmd, arg);
      // this.process(cmd, arg);
    });
    this.reply(220, 'FTP Server');
    return this;
  }
  parse(line){
    debug('>', line);
    const m = line.match(/^(\w+)(\s(.*))?$/);
    return { cmd: m[1], arg: m[3] };
  }
  reply(code, msg = ''){
    debug('<', code, msg);
    this.client.write(`${code} ${msg}${CRLF}`);
    return this;
  }
  process(cmd, arg){
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
  }
}

module.exports = Connection;
