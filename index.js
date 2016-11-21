'use strict';
const Server = require('./server');
const tcp          = require('net');
const util         = require('util');
const EventEmitter = require('events');

const CRLF = '\r\n';

/**
 * [FTPClient description]
 * @param {[type]} options [description]
 */
function FTP(options){
  EventEmitter.call(this);
  this.queue = [];
  var data = '', parts = [], self = this;
  this.socket = tcp.connect(options)
  .on('error', function(){
    console.error('-x fail to connect ');
  })
  .on('connect', this.emit.bind(this,'connect'))
  .on('data', function(chunk){
    data += chunk;
    // console.log(data);
    parts = data.split(CRLF);
    data = parts.pop();
    parts.forEach(self.parse.bind(self));
  });
};

/**
 * [connect description]
 * @param  {[type]}   connection [description]
 * @param  {Function} callback   [description]
 * @return {[type]}              [description]
 */
FTP.connect = function(connection, callback){
  var client = new FTP(connection);
  client.on('connect', callback);
  return client;
};

util.inherits(FTP, EventEmitter);

/**
 * [parse description]
 * @param  {[type]} line [description]
 * @return {[type]}      [description]
 */
FTP.prototype.parse = function(line){
  var m = line.match(/^(\d{3})\s(.*)$/);
  var code = parseInt(m[1], 10), msg = m[2];

  switch (code) {
    case 220:
      this.name = msg;
      this.emit('ready', msg);
      break;
    case 425:
      // PORT, PASV
      if(true){
        this.createSocket();
      }else{
        this.send('PASV');
      }
      break;
    case 227:
      this.createSocket('host', 'port');
      break;
    default:
      console.log('-?', line);
      var fn = this.req[1]
      this.req = null;
      fn.call(this, null, { code: code, msg: msg });
      break;
  }
};

/**
 * [send description]
 * @param  {[type]}   command  [description]
 * @param  {[type]}   arg      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.prototype.send = function(command, arg, callback){
  var self = this;
  if(typeof arg == 'function'){
    callback = arg;
  }else if(arg){
    command += ' ' + arg;
  }
  if(!callback) callback = function(){};
  this.queue.push([ command, callback ]);
  if(this.socket.readable && !this.req){
    this.req = this.queue.shift();
    if(this.req){
      this.socket.write(this.req[0] + CRLF, function(){
        console.log('->', self.req[0]);
      });
    }
  }
};

/**
 * [user description]
 * @param  {[type]}   name     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.prototype.user = function(name, callback){
  this.send('USER', name, function(err, res){
    if(res && res.code == 331){
      err = new Error(res.msg);
      err.code = res.code;
    }
    callback.call(this, err, res);
  });
};

/**
 * [pass description]
 * @param  {[type]}   pass     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.prototype.pass = function(pass, callback){
  this.send('PASS', pass, callback);
};

/**
 * [get description]
 * @param  {[type]}   filename [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.prototype.get = function(filename, callback){
  this.send('RETR', filename, callback);
};

/**
 * [put description]
 * @param  {[type]}   local    [description]
 * @param  {[type]}   remote   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.prototype.put = function(local, remote, callback){
  this.send('STOR');
};

FTP.prototype.cwd = function(dir, callback){
  this.send('CWD', dir, callback);
};

FTP.prototype.pwd = function(callback){
  this.send('PWD', callback);
};

FTP.prototype.list = function(){
  this.send('LIST');
};

FTP.prototype.rename = function(from, to){
  this.send('RNFR', from);
  this.send('RNTO', to);
};

FTP.prototype.delete = function(filename){
  this.send('DELE', filename);
};

FTP.prototype.rmdir = function(dir){
  this.send('RMD', dir);
};

FTP.prototype.mkdir = function(dir){
  this.send('MKD', dir);
};

FTP.prototype.logout = function(){
  this.send('LOGOUT');
};

/**
 * [Client description]
 * @type {[type]}
 */
FTP.Client = FTP;
FTP.Server = Server;

/**
 * [createServer description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
FTP.createServer = function(callback){
  var server = new FTP.Server();
  server.on('connection', callback);
  return server;
};

module.exports = FTP;
