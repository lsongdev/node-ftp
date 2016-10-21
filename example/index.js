
const ftp = require('../');

ftp.connect({ port: 21, host: 'lsong.lan' }, function(err){

  this.on('ready', function(){
    console.log(this.name);
    
    this.user('ftp', function(err, res){
      if(err.code == 331) this.pass('123', done);
    });

  });


  function done(){

    this.list(function(err, res){
      console.log(res);
    });

  }
  
});
