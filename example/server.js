const ftp = require('../');

var server = ftp.createServer(function(client){

  client.on('user', function(name){
    console.log('user: ', name);
  });
  
});

server.listen(2121);
