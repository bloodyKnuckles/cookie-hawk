var cookieHawk = require('../')
var hawk = require('hawk')
var http = require('http') // USE HTTPS FOR PRODUCTION!

var fs = require('fs')
var body = require('body/any')
var cookieObject = require('cookie-object')

function validateUser (user) {
  if ( !!('j' === user.uname && '4' === user.pword ) ) {
    return Object.keys(cookieHawk.getCredentials()).reduce(function (prev, next) {
      return user.uname === cookieHawk.getCredentials(next).user? next: prev
    }, '')
  }
  return undefined
}

function credentialsFunc (id, callback) {
  return callback(null, cookieHawk.getCredentials(id))
}

// HTTP server handler
var handler = function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method && '/login' === requrlarr[0] && undefined === requrlarr[1] ) {
    body(req, res, function (err, postvars) {
      var id
      if ( id = validateUser({uname:postvars.uname, pword:postvars.pword}) ) {
        cookieHawk.clientSendCredentials(res, {id:id})
      }
      else {
        responseStream('/login.html')
      }
    })
  }
  else {
    var reqheaders = req.headers.authorization ||
      cookieObject.getCookieObject(req.headers.cookie, 'hawkauth') ||
      {}

    hawk.server.authenticate(reqheaders, credentialsFunc, {}, function (err, credentials, artifacts) {
      var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

      if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf('/login') ) {
        res.setHeader('Set-Cookie', 'redirectto=; expires=' + Date(0) + ';')
        responseStream('/login.html')
      }
      else if ( err ) { // && artifacts ) {
        res.setHeader('Set-Cookie', 'redirectto=/login;')
        cookieHawk.clientSendCredentials(res)
      }
      else {
        res.setHeader('Set-Cookie', 'redirectto=; expires=Thu, 01 Jan 1970 00:00:00 GMT;')
        var payload = (!err ? 'Hello ' + credentials.user + ' ' + (artifacts.ext || '') : 'Shoosh!')
        var headers = {
          'Content-Type': 'text/plain',
          'Server-Authorization': hawk.server.header(credentials, artifacts, { payload: payload, contentType: 'text/plain' })
        }
        res.writeHead(!err ? 200 : 401, headers)
        res.end(payload)
      }
    })
  }

  function responseStream (resource, type) {
    type = type || 'text/html'
    res.writeHead(200, {'Content-Type': type }) 
    fs.createReadStream(__dirname + '/public' + resource).pipe(res)
  }
}

http.createServer(handler).listen(8000, 'localhost')

