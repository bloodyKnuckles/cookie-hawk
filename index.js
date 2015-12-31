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

module.exports = function (opts) {

  opts = opts || {}
  opts.login = opts.login || { urlpath: '/login', filepath: '/login.html' }
  opts.noAuthResponse = opts.noAuthResponse || function (req, res) {
    responseStream(res, opts.login.filepath)
  }
  opts.credValidateRespond = opts.credValidateRespond || function (id, callback) {
    return callback(null, getCredentials(id))
  }

  var cookieHawk = {

    opts: opts,

    auth: function (req, res, payload, successCB) {
      successCB = successCB || payload
      var reqheaders = req.headers.authorization ||
        cookieObject.getCookieObject(req.headers.cookie, 'hawkauth') ||
        {}

      hawk.server.authenticate(reqheaders, opts.credValidateRespond, {}, function (err, credentials, artifacts) {
        var redirectto = cookieObject.getCookieObject(req.headers.cookie, 'redirectto')

        if ( err && 'string' === typeof redirectto && 0 === redirectto.indexOf(opts.login.urlpath) ) {
          deleteCookie(res, 'redirectto')
          opts.noAuthResponse(req, res)
        }
        else if ( err ) { // && artifacts ) {
          setCookie(res, 'redirectto', opts.login.urlpath, 5) // minutes
          cookieHawk.clientSendAuth(res)
        }
        else {
          deleteCookie(res, 'redirectto')
          var serverauthobj = {}
          if ( 'function' !== typeof payload ) { serverauthobj.payload = payload }
          var headers = {
            'Server-Authorization': hawk.server.header(credentials, artifacts, serverauthobj)
          }
          res.writeHead(200, headers)
          successCB()
        }
      })
    },

    clientSendCredentials: function (res, username) {
      var id = Object.keys(getCredentials()).reduce(function (prev, next) {
        return username === getCredentials(next).user? next: prev
      }, '')
      var credentials = id && getCredentials(id)
      var setcredentialsstr = credentials
        ? '<script>localStorage.setItem("credentials", \'' +
          JSON.stringify(credentials) +
          '\')</script>': undefined
      cookieHawk.clientSendAuth(res, setcredentialsstr)
    },

    clientSendAuth: function (res, setcredentialsstr) {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.write((setcredentialsstr || '') + '<script>')
      res.write(fs.readFileSync('./lib/browser-min.js'))
      res.write('</script>')
      res.end()
    }

  } // end cookieHawk object
  return cookieHawk
}

function getCredentials (id) {
  return internals.credentials[id] || internals.credentials
}

function setCookie (res, name, value, minutesexpires, path) {
  path = path? 'path=' + path + '; ': ''
  var expires = ''
  if ( undefined !== minutesexpires ) {
    var date = new Date()
    date.setTime(date.getTime() + (minutesexpires*1000*60))
    expires = 'expires=' + date.toGMTString() + '; '
  }
  res.setHeader('Set-Cookie', name + '=' + value + '; ' + expires + path)
}

function deleteCookie (res, name) {
  res.setHeader('Set-Cookie', name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT;')
}

function responseStream (res, resource, type) {
  type = type || 'text/html'
  res.writeHead(200, {'Content-Type': type })
  fs.createReadStream(__dirname + '/example/public' + resource).pipe(res)
}

