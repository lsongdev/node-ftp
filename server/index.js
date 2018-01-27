const tcp          = require('net');
const EventEmitter = require('events');
const Connection   = require('./connection');

/**
 * [Server description]
 * @docs https://www.ietf.org/rfc/rfc959.txt
 */
class FtpServer extends tcp.Server {
  constructor(options){
    super();
    Object.assign(this, options);
    this.on('connection', socket => {
      const connection = new Connection(socket, this);
      // this.emit('connection', connection);
    });
    return this;
  }
}
/**
 * Connection
 */
FtpServer.Connection = Connection;

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = FtpServer;
