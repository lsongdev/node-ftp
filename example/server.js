const fs  = require('fs');
const ftp = require('..');

const server = ftp.createServer();

server.on("error", err => {
  console.log(err);
});

server.listen(2121);
