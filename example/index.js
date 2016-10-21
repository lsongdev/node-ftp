
const ftp = require('../');

ftp.connect('ftp://lsong.org', function(err){

  
  this.on('ready', function(){
    console.log(this.name);
    
    
    this.login('ftp');
  });
  
  this.on('password', function(){
    this.password('123');
  });
  
  this.on('login', function(){
    console.log('User logged in, proceed. Logged out if appropriate.');
  });
  
  // this.cwd();
  // this.pwd();
  // this.get();
  // this.put();
  // this.list();
  // this.mkdir();
  // this.rmdir();
  // this.rename();
  // this.delete();
  // this.logout();

});
