var http = require('http') // USE HTTPS FOR PRODUCTION!
var hawk = require('hawk')

var fs = require('fs')
var body = require('body/any')
var browserify = require('browserify')
var combine = require('combine-streams')
var cookieObject = require('cookie-object')

// Declare internals
var internals = {
  credentials: {
    dh37fgj492je: {
      id: 'dh37fgj492je',
      key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
      algorithm: 'sha256',
      user: 'j'
    }
  }
}

// HTTP server handler
var handler = function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method && '/login' === requrlarr[0] && undefined === requrlarr[1] ) {
    body(req, res, function (err, postvars) {
      var id
      if ( id = validateUser({uname:postvars.uname, pword:postvars.pword}) ) {
        authRedirect({id:id})
      }
      else {
        responseStream('/login.html')
      }
    })
  }
  else {
    var reqheaders = req.headers.authorization ||
      cookieObject.getCookieObject(req.headers.cookie, 'token') ||
      {}

    hawk.server.authenticate(reqheaders, credentialsFunc, {}, function (err, credentials, artifacts) {
      var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

      if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf('/login') ) {
        res.setHeader('Set-Cookie', 'redirectto=; expires=' + Date(0) + ';')
        responseStream('/login.html')
      }
      else if ( err ) { // && artifacts ) {
        res.setHeader('Set-Cookie', 'redirectto=/login;')
        authRedirect()
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

  function authRedirect(setcred) {
    var credentials = setcred && getCredentials(setcred.id)
    var setcredstr = credentials
      ? '<script>localStorage.setItem("credentials", \'' +
        JSON.stringify(credentials) +
        '\')</script>': ''
    var bb = browserify()
    bb.add('./example/js/cookie-auth-redirect.js')
    res.writeHead(200, {'Content-Type': 'text/html'})
    combine().
      append(setcredstr + '<script>').
      append(bb.bundle()).
      append('</script>').
      append(null).
      pipe(res)
  }

  function responseStream (resource, type) {
    type = type || 'text/html'
    res.writeHead(200, {'Content-Type': type }) 
    fs.createReadStream(__dirname + '/public' + resource).pipe(res)
  }

  function validateUser (user) {
    if ( !!('j' === user.uname && '4' === user.pword ) ) {
      return Object.keys(internals.credentials).reduce(function (prev, next) {
        return user.uname === internals.credentials[next].user? next: prev
      }, '')
    }
    return undefined
  }

  function getCredentials (id) {
    return internals.credentials[id || '']
  }

  function credentialsFunc (id, callback) {
    return callback(null, getCredentials(id))
  }
}

http.createServer(handler).listen(8000, 'localhost')

