var cookieObject = require('../')
var test = require('tape')

test('cookie string to object', function (tt) {
    tt.plan(5)

    var cookiestring = 'mycookie={"one":1,"two":2,"three":3}; yourcookie=hey;'
    var resultmycookie = {one: 1, two: 2, three: 3}
    var result = {mycookie: {"one": 1, "two": 2, "three": 3}, yourcookie: 'hey'}

    tt.deepEqual(cookieObject.getCookieObject(cookiestring, 'mycookie'), resultmycookie)
    tt.deepEqual(cookieObject.getCookieObject(cookiestring), result)
    tt.deepEqual(cookieObject.getCookieObject(cookiestring, ['mycookie', 'yourcookie']), result)
    tt.deepEqual(cookieObject.getCookieObject(''), {})
    tt.equal(cookieObject.getCookieObject(cookiestring, 'mycookie').two, 2)
})

