var fs = require('fs')

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

module.exports = {

  getCredentials: function (id) {
    return internals.credentials[id] || internals.credentials
  },

  clientSendCredentials: function (res, setcredentials) {
    var credentials = setcredentials && getCredentials(setcredentials.id)
    var setcredentialsstr = credentials
      ? '<script>localStorage.setItem("credentials", \'' +
        JSON.stringify(credentials) +
        '\')</script>': ''
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.write(setcredentialsstr + '<script>')
    res.write(fs.readFileSync('./lib/browser-min.js'))
    res.write('</script>')
    res.end()
  }

}
