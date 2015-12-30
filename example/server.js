var cookieHawk = require('../')()
var http = require('http') // USE HTTPS FOR PRODUCTION!

var fs = require('fs')
var body = require('body/any')

http.createServer(function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method && '/login' === requrlarr[0] ) {
    body(req, res, function (err, postvars) {
      if ( validateUser({uname:postvars.uname, pword:postvars.pword}) ) {
        cookieHawk.clientSendCredentials(res, postvars.uname)
      }
      else {
        responseStream(res, '/login.html')
      }
    })
  }
  else {
    cookieHawk.auth(req, res, function () {
      res.end('success')
    })
  }

}).listen(8000, 'localhost')

function validateUser (user) {
  if ( !!('j' === user.uname && '4' === user.pword ) ) { return true }
  return false
}

function responseStream (res, resource, type) {
  type = type || 'text/html'
  res.writeHead(200, {'Content-Type': type }) 
  fs.createReadStream(__dirname + '/public' + resource).pipe(res)
}

