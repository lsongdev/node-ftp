## node-ftp ![npm](https://badge.fury.io/js/x-ftp.png)

ftp 

### Installation
````
$ [sudo] npm install node-ftp
````


### Example

````javascript
const ftp = require('x-ftp');

ftp.createServer(function(client){

  client.on('put', function(req){
    req.pipe(fs.createWriteStream(req.filename));
  });

  client.on('get', function(filename){
    return fs.createReadStream(filename);
  });

  client.on('list', function(){
    return [
      { name: 'aa', size: 110000, date: new Date },
      { name: 'aa', size: 110000, date: new Date },
      { name: 'aa', size: 110000, date: new Date },
      { name: 'aa', size: 110000, date: new Date },
      { name: 'aa', size: 110000, date: new Date },
    ];
  });
  
}).listen(21, function(err){
  console.log('server is running');
});
````

```js
const ftp = require('x-ftp');

ftp.connect('ftp://lsong.org', function(err, f){
  
  f.cwd();
  f.pwd();
  f.get();
  f.put();
  f.list();
  f.mkdir();
  f.rmdir();
  f.rename();
  f.delete();
  f.logout();

});
```

### API

- node-ftp.createServer()

### Contributing
- Fork this repo
- Clone your repo
- Install dependencies
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Open a pull request, and enjoy <3

### MIT license
Copyright (c) 2016 lsong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---