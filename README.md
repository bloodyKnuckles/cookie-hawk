# cookie-hawk

A wrapper using cookies to transmit Hawk authentication information when request 
header authentication is not available, such as with page reloads resulting from 
link clicks and form submissions. When using request headers to transmit 
authentication it appears only XHR can be used with Hawk.

[Hawk](https://github.com/hueniverse/hawk)

Under development.

### install
```
git clone https://github.com/bloodyKnuckles/cookie-hawk.git
```

### run example
```
node example/server.js
```
...then load [http://localhost:8000/](http://localhost:8000/)

### license

MIT
