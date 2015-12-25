var hawk = require('hawk/client'),
    redirectto = decodeURI(location.search.slice(1)) || '/'

var header = hawk.client.header(location.origin + redirectto, 'GET', {
  credentials: JSON.parse(localStorage.getItem('credentials')) //, ext: 'hey'
})

var cookieopts = {
  method: 'GET',
  url: redirectto,
  headers: {
    host: location.hostname + (location.port ? ':' + location.port: ''),
    authorization: header.field
  }
}

var dd = new Date()
dd.setDate(dd.getDate() + 14)
document.cookie = 'token=' + JSON.stringify(cookieopts) +
  '; expires=' + dd.toUTCString() +
  '; path=/;'

window.location.href = redirectto

