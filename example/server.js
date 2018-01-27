const fs  = require('fs');
const ftp = require('..');

const server = ftp.createServer();

server.listen(2121);
