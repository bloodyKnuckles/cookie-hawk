# cookie-object

Use cookies to transmit Javascript objects. 

### examples
```
var cookieObject = require('cookie-object')

// within the server/routes handler, providing a request object
// given a cookie having a serialzed value, such as: mycookie={"one":1,"two":2};

console.log( cookieObject.getCookieObject(req.headers.cookie, 'mycookie') )
// {one:1, two:2}

console.log( cookieObject.getCookieObject(req.headers.cookie, 'mycookie').two )
// 2

// given a cookie having a serialzed value, such as: mycookie={"one":1,"two":2}; yourcookie=hey;

console.log( cookieObject.getCookieObject(req.headers.cookie) )
// {mycookie: {one:1, two:2}, yourcookie: "hey"}

console.log( cookieObject.getCookieObject(req.headers.cookie, ['mycookie', 'yourcookie']) )
// {mycookie: {"one":1, "two":2}, yourcookie: "hey"}
```

### license

MIT
