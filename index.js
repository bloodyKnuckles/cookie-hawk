var fs = require('fs')

var hawk = require('hawk')
var cookieObject = require('cookie-object')

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

function credentialsFunc (id, callback) {
  return callback(null, getCredentials(id))
}

function getCredentials (id) {
  return internals.credentials[id] || internals.credentials
}

var cookieHawk = {

  auth: function (req, res, callback) {
    var reqheaders = req.headers.authorization ||
      cookieObject.getCookieObject(req.headers.cookie, 'hawkauth') ||
      {}

    hawk.server.authenticate(reqheaders, credentialsFunc, {}, function (err, credentials, artifacts) {
      var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

      if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf('/login') ) {
        deleteCookie(res, 'redirectto')
        responseStream('/login.html')
      }
      else if ( err ) { // && artifacts ) {
        res.setHeader('Set-Cookie', 'redirectto=/login;')
        cookieHawk.clientSendAuth(res)
      }
      else {
        deleteCookie(res, 'redirectto')
        var payload = 'Hello ' + credentials.user + ' ' + (artifacts.ext || '')
        var headers = {
          'Content-Type': 'text/plain',
          'Server-Authorization': hawk.server.header(credentials, artifacts, { payload: payload, contentType: 'text/plain' })
        }
        res.writeHead(200, headers)
        res.end(payload)
      }
    })
  },

  clientSendCredentials: function (res, username) {
    var id = Object.keys(cookieHawk.getCredentials()).reduce(function (prev, next) {
      return username === cookieHawk.getCredentials(next).user? next: prev
    }, '')
    var credentials = id && getCredentials(id)
    var setcredentialsstr = credentials
      ? '<script>localStorage.setItem("credentials", \'' +
        JSON.stringify(credentials) +
        '\')</script>': undefined
    cookieHawk.clientSendAuth(res, id, setcredentialsstr)
  },

  clientSendAuth: function (res, setcredentialsstr) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write((setcredentialsstr || '') + '<script>')
    res.write(fs.readFileSync('./lib/browser-min.js'))
    res.write('</script>')
    res.end()
  }

}

module.exports = cookieHawk

function responseStream (res, resource, type) {
  type = type || 'text/html'
  res.writeHead(200, {'Content-Type': type })
  fs.createReadStream(__dirname + '/public' + resource).pipe(res)
}

function deleteCookie (res, name) {
  res.setHeader('Set-Cookie', name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;')
}

