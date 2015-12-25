'use strict';

// Load modules

const Http = require('http');
const Hawk = require('../lib');

const body = require('body/any')
const fs = require('fs')
const cookieObject = require('cookie-object')

// Declare internals
const internals = {
    credentials: {
        dh37fgj492je: {
            id: 'dh37fgj492je',                                             // Required by Hawk.client.header
            key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
            algorithm: 'sha256',
            user: 'webdude'
        }
    }
};

// Credentials lookup function
const credentialsFunc = function (id, callback) {
  return callback(null, internals.credentials[id]);
};


// Create HTTP server
const handler = function (req, res) {
  var requrlarr = req.url.split('?')
  if ( 'POST' === req.method && '/login' === requrlarr[0] && undefined === requrlarr[1] ) {
    body(req, res, function (err, postvars) {
      if ( validateUser({uname:postvars.uname, pword:postvars.pword}) ) {

        const header = Hawk.client.header('http://localhost:8000/', 'GET', {
          credentials: internals.credentials['dh37fgj492je'] //, ext: 'heyther' 
        });
        var cookieopts = {
          method: 'GET',
          url: '/',
          headers: {
            host: 'localhost:8000',
            authorization: header.field
          }
        }

        res.writeHead(200, {'Content-Type': 'text/html'})
        res.write('<script src="/js/set-credentials.js"></script>')
        res.write('<script>setCredentials(\'' + JSON.stringify(internals.credentials['dh37fgj492je']) + '\')</script>')
        res.write('<script src="/js/cookie-auth-redirect.js"></script>')
        res.end('okay')
      }
      else {
        responseStream(res, '/login')
      }
    })
  }
//  else if ( '/login' === requrlarr[0] && ('GET' === req.method || undefined !== requrlarr[1]) ) {
//    res.writeHead(200, {'Content-Type': 'text/html'})
//    fs.createReadStream(__dirname + '/cookielogin.html').pipe(res)
//  }
  else if ( '/tryagain' === requrlarr[0] ) {
    responseStream(res, '/tryagain.html')
  }
  else if ( '/js/cookie-auth-redirect.js' === req.url ) {
    responseStream(res, '/js/cookie-auth-redirect.js', 'text/javascript')
  }
  else if ( '/js/set-credentials.js' === req.url ) {
    responseStream(res, '/js/set-credentials.js', 'text/javascript')
  }
  else if ( '/js/main.js' === req.url ) {
    responseStream(res, '/js/main.js')
  }
  else if ( '/favicon.ico' === req.url ) {
    res.end()
  }
  else {
    var reqheaders = req.headers.authorization ||
      cookieObject.getCookieObject(req.headers.cookie, 'token') ||
      {}

    Hawk.server.authenticate(reqheaders, credentialsFunc, {}, (err, credentials, artifacts) => {
      var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

      if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf('/login') ) {
        res.setHeader('Set-Cookie', 'redirectto=; expires=' + Date(0) + ';')
        responseStream(res, '/cookielogin.html')
      }
      else if ( err ) {
        res.setHeader('Set-Cookie', 'redirectto=/login;')
        redirect(res, '/tryagain?' + encodeURI(req.url))
      }
      else {
        res.setHeader('Set-Cookie', 'redirectto=; expires=Thu, 01 Jan 1970 00:00:00 GMT;')
        const payload = (!err ? 'Hello ' + credentials.user + ' ' + (artifacts.ext || '') : 'Shoosh!');
        const headers = {
          'Content-Type': 'text/plain',
          'Server-Authorization': Hawk.server.header(credentials, artifacts, { payload: payload, contentType: 'text/plain' })
        };
        res.writeHead(!err ? 200 : 401, headers);
        res.end(payload);
      }
    });
  }
};

Http.createServer(handler).listen(8000, '127.0.0.1');

function validateUser(user) {
  return !!('jay' === user.uname && '4' === user.pword )
}

function redirect (res, where) {
  res.writeHead(307, {'Location': where})
  res.end()
}

function responseStream (res, resource, type) {
  type = type || 'text/html'
  res.writeHead(200, {'Content-Type': type }) 
  fs.createReadStream(__dirname + resource).pipe(res)
}

