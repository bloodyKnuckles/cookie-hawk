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
      user: 'webdude'
    }
  }
}


// Create HTTP server handler
var handler = function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method && '/login' === requrlarr[0] && undefined === requrlarr[1] ) {
    body(req, res, function (err, postvars) {
      if ( validateUser({uname:postvars.uname, pword:postvars.pword}) ) {

        var header = hawk.client.header('http://localhost:8000/', 'GET', {
          credentials: internals.credentials['dh37fgj492je'] //, ext: 'heyther' 
        })
        var cookieopts = {
          method: 'GET',
          url: '/',
          headers: {
            host: 'localhost:8000',
            authorization: header.field
          }
        }
        cookieAuthRedirect()
      }
      else {
        responseStream('/login')
      }
    })
  }
  else if ( '/js/cookie-auth-redirect.js' === req.url ) {
    responseStream('/js/cookie-auth-redirect.js', 'text/javascript')
  }
  else {
    var reqheaders = req.headers.authorization ||
      cookieObject.getCookieObject(req.headers.cookie, 'token') ||
      {}

    hawk.server.authenticate(reqheaders, credentialsFunc, {}, function (err, credentials, artifacts) {
      var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

      if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf('/login') ) {
        res.setHeader('Set-Cookie', 'redirectto=; expires=' + Date(0) + ';')
        responseStream('/cookielogin.html')
      }
      else if ( err ) {
        res.setHeader('Set-Cookie', 'redirectto=/login;')
        cookieAuthRedirect()
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

  function cookieAuthRedirect() {
    var bb = browserify()
    bb.add('./example/js/cookie-auth-redirect.js')
    res.writeHead(200, {'Content-Type': 'text/html'})
    //res.write(
    //  '<script>localStorage.setItem("credentials", \'' +
    //  JSON.stringify(internals.credentials['dh37fgj492je']) +
    //  '\')</script>'
    //)
    //res.write('<script src="/js/cookie-auth-redirect.js"></script>')
    //res.write('<script>')
    //res.write(fs.readFileSync(__dirname + '/public/js/cookie-auth-redirect.js'))
    //res.write('</script>')
    //res.end()
    combine().
      append('<script>localStorage.setItem("credentials", \'' + 
        JSON.stringify(internals.credentials['dh37fgj492je']) +
        '</script><script>'
      ).
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

  function validateUser(user) {
    return !!('j' === user.uname && '4' === user.pword )
  }

  function credentialsFunc (id, callback) {
    return callback(null, internals.credentials[id])
  }
}

http.createServer(handler).listen(8000, 'localhost')

