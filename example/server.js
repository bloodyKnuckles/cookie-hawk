var cookieHawk = require('../')()
var http = require('http') // USE HTTPS FOR PRODUCTION!

var fs = require('fs')
var body = require('body/any')

function validateUser (user) {
  if ( !!('j' === user.uname && '4' === user.pword ) ) { return true }
  return false
}

// HTTP server handler
var handler = function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method ) {
    body(req, res, function (err, postvars) {
      if ( '/login' === requrlarr[0] ) {
        if ( validateUser({uname:postvars.uname, pword:postvars.pword}) ) {
          cookieHawk.clientSendCredentials(res, postvars.uname)
        }
        else {
          responseStream('/login.html')
        }
      }
      else {
        cookieHawk.auth(req, res, function () {
        })
      }
    })
  }
  else {
    cookieHawk.auth(req, res, function () {
    })
  }

  function responseStream (resource, type) {
    type = type || 'text/html'
    res.writeHead(200, {'Content-Type': type }) 
    fs.createReadStream(__dirname + '/public' + resource).pipe(res)
  }

}

http.createServer(handler).listen(8000, 'localhost')

