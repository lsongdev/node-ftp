const fs  = require('fs');
const ftp = require('..');

var server = ftp.createServer({
  username: 'root',
  password: '1234',
  auth: function(username, password){

  },
  put: function(filename, stream){
    return stream.pipe(fs.createWriteStream(filename));
  },
  get: function(filename){
    console.log(filename);
    return fs.createReadStream(filename);
  }
});

server.listen(2121);
