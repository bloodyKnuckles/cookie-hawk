exports.getCookieObject = function (cookie, name) {
  cookie = 'string' === typeof cookie? cookie: ''
  var ret = {}
  cookie.split(/;\s*/).forEach(function (item) {
    var cookiepair = item.split(/=(.+)?/)
    if ( 'string' === typeof name ) {
      if ( name === cookiepair[0] ) {
        ret = cookiepair[1].charAt(0).match(/[{"']/)
          ? JSON.parse(cookiepair[1])
          : cookiepair[1]
      }
    }
    else if (
      (undefined === name && 2 <= cookiepair.length)
      || (Array.isArray(name) && -1 !== name.indexOf(cookiepair[0]))
    ) {
      ret[cookiepair[0]] = cookiepair[1].charAt(0).match(/[{"']/)
        ? JSON.parse(cookiepair[1])
        : cookiepair[1]
    }
  })
  return ret || {}
}

