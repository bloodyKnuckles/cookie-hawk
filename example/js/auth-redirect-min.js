!function t(e,r,n){function i(o,s){if(!r[o]){if(!e[o]){var c="function"==typeof require&&require;if(!s&&c)return c(o,!0);if(a)return a(o,!0);var h=new Error("Cannot find module '"+o+"'");throw h.code="MODULE_NOT_FOUND",h}var u=r[o]={exports:{}};e[o][0].call(u.exports,function(t){var r=e[o][1][t];return i(r?r:t)},u,u.exports,t,e,r,n)}return r[o].exports}for(var a="function"==typeof require&&require,o=0;o<n.length;o++)i(n[o]);return i}({1:[function(t,e,r){"use strict";e.exports=t("./dist/browser")},{"./dist/browser":2}],2:[function(t,r,n){"use strict";function i(t){return t&&"undefined"!=typeof Symbol&&t.constructor===Symbol?"symbol":typeof t}var a={internals:{}};a.client={header:function s(t,e,r){var n={field:"",artifacts:{}};if(!t||"string"!=typeof t&&"object"!==("undefined"==typeof t?"undefined":i(t))||!e||"string"!=typeof e||!r||"object"!==("undefined"==typeof r?"undefined":i(r)))return n.err="Invalid argument type",n;var o=r.timestamp||a.utils.now(r.localtimeOffsetMsec),c=r.credentials;if(!(c&&c.id&&c.key&&c.algorithm))return n.err="Invalid credentials object",n;if(-1===a.crypto.algorithms.indexOf(c.algorithm))return n.err="Unknown algorithm",n;"string"==typeof t&&(t=a.utils.parseUri(t));var h={ts:o,nonce:r.nonce||a.utils.randomString(6),method:e,resource:t.resource,host:t.host,port:t.port,hash:r.hash,ext:r.ext,app:r.app,dlg:r.dlg};n.artifacts=h,h.hash||!r.payload&&""!==r.payload||(h.hash=a.crypto.calculatePayloadHash(r.payload,c.algorithm,r.contentType));var u=a.crypto.calculateMac("header",c,h),l=null!==h.ext&&void 0!==h.ext&&""!==h.ext,s='Hawk id="'+c.id+'", ts="'+h.ts+'", nonce="'+h.nonce+(h.hash?'", hash="'+h.hash:"")+(l?'", ext="'+a.utils.escapeHeaderAttribute(h.ext):"")+'", mac="'+u+'"';return h.app&&(s+=', app="'+h.app+(h.dlg?'", dlg="'+h.dlg:"")+'"'),n.field=s,n},bewit:function c(t,e){if(!t||"string"!=typeof t||!e||"object"!==("undefined"==typeof e?"undefined":i(e))||!e.ttlSec)return"";e.ext=null===e.ext||void 0===e.ext?"":e.ext;var r=a.utils.now(e.localtimeOffsetMsec),n=e.credentials;if(!(n&&n.id&&n.key&&n.algorithm))return"";if(-1===a.crypto.algorithms.indexOf(n.algorithm))return"";t=a.utils.parseUri(t);var o=r+e.ttlSec,s=a.crypto.calculateMac("bewit",n,{ts:o,nonce:"",method:"GET",resource:t.resource,host:t.host,port:t.port,ext:e.ext}),c=n.id+"\\"+o+"\\"+s+"\\"+e.ext;return a.utils.base64urlEncode(c)},authenticate:function(t,e,r,n){n=n||{};var i=function(e){return t.getResponseHeader?t.getResponseHeader(e):t.getHeader(e)},o=i("www-authenticate");if(o){var s=a.utils.parseAuthorizationHeader(o,["ts","tsm","error"]);if(!s)return!1;if(s.ts){var c=a.crypto.calculateTsMac(s.ts,e);if(c!==s.tsm)return!1;a.utils.setNtpOffset(s.ts-Math.floor((new Date).getTime()/1e3))}}var h=i("server-authorization");if(!h&&!n.required)return!0;var u=a.utils.parseAuthorizationHeader(h,["mac","ext","hash"]);if(!u)return!1;var l={ts:r.ts,nonce:r.nonce,method:r.method,resource:r.resource,host:r.host,port:r.port,hash:u.hash,ext:u.ext,app:r.app,dlg:r.dlg},f=a.crypto.calculateMac("response",e,l);if(f!==u.mac)return!1;if(!n.payload&&""!==n.payload)return!0;if(!u.hash)return!1;var p=a.crypto.calculatePayloadHash(n.payload,e.algorithm,i("content-type"));return p===u.hash},message:function(t,e,r,n){if(!t||"string"!=typeof t||!e||"number"!=typeof e||null===r||void 0===r||"string"!=typeof r||!n||"object"!==("undefined"==typeof n?"undefined":i(n)))return null;var o=n.timestamp||a.utils.now(n.localtimeOffsetMsec),s=n.credentials;if(!(s&&s.id&&s.key&&s.algorithm))return null;if(-1===a.crypto.algorithms.indexOf(s.algorithm))return null;var c={ts:o,nonce:n.nonce||a.utils.randomString(6),host:t,port:e,hash:a.crypto.calculatePayloadHash(r,s.algorithm)},h={id:s.id,ts:c.ts,nonce:c.nonce,hash:c.hash,mac:a.crypto.calculateMac("message",s,c)};return h},authenticateTimestamp:function(t,e,r){var n=a.crypto.calculateTsMac(t.ts,e);return n!==t.tsm?!1:(r!==!1&&a.utils.setNtpOffset(t.ts-Math.floor((new Date).getTime()/1e3)),!0)}},a.crypto={headerVersion:"1",algorithms:["sha1","sha256"],calculateMac:function(t,e,r){var n=a.crypto.generateNormalizedString(t,r),i=o["Hmac"+e.algorithm.toUpperCase()](n,e.key);return i.toString(o.enc.Base64)},generateNormalizedString:function(t,e){var r="hawk."+a.crypto.headerVersion+"."+t+"\n"+e.ts+"\n"+e.nonce+"\n"+(e.method||"").toUpperCase()+"\n"+(e.resource||"")+"\n"+e.host.toLowerCase()+"\n"+e.port+"\n"+(e.hash||"")+"\n";return e.ext&&(r+=e.ext.replace("\\","\\\\").replace("\n","\\n")),r+="\n",e.app&&(r+=e.app+"\n"+(e.dlg||"")+"\n"),r},calculatePayloadHash:function(t,e,r){var n=o.algo[e.toUpperCase()].create();return n.update("hawk."+a.crypto.headerVersion+".payload\n"),n.update(a.utils.parseContentType(r)+"\n"),n.update(t),n.update("\n"),n.finalize().toString(o.enc.Base64)},calculateTsMac:function(t,e){var r=o["Hmac"+e.algorithm.toUpperCase()]("hawk."+a.crypto.headerVersion+".ts\n"+t+"\n",e.key);return r.toString(o.enc.Base64)}},a.internals.LocalStorage=function(){this._cache={},this.length=0,this.getItem=function(t){return this._cache.hasOwnProperty(t)?String(this._cache[t]):null},this.setItem=function(t,e){this._cache[t]=String(e),this.length=Object.keys(this._cache).length},this.removeItem=function(t){delete this._cache[t],this.length=Object.keys(this._cache).length},this.clear=function(){this._cache={},this.length=0},this.key=function(t){return Object.keys(this._cache)[t||0]}},a.utils={storage:new a.internals.LocalStorage,setStorage:function(t){var e=a.utils.storage.getItem("hawk_ntp_offset");a.utils.storage=t,e&&a.utils.setNtpOffset(e)},setNtpOffset:function(t){try{a.utils.storage.setItem("hawk_ntp_offset",t)}catch(e){console.error("[hawk] could not write to storage."),console.error(e)}},getNtpOffset:function(){var t=a.utils.storage.getItem("hawk_ntp_offset");return t?parseInt(t,10):0},now:function(t){return Math.floor(((new Date).getTime()+(t||0))/1e3)+a.utils.getNtpOffset()},escapeHeaderAttribute:function(t){return t.replace(/\\/g,"\\\\").replace(/\"/g,'\\"')},parseContentType:function(t){return t?t.split(";")[0].replace(/^\s+|\s+$/g,"").toLowerCase():""},parseAuthorizationHeader:function(t,e){if(!t)return null;var r=t.match(/^(\w+)(?:\s+(.*))?$/);if(!r)return null;var n=r[1];if("hawk"!==n.toLowerCase())return null;var i=r[2];if(!i)return null;var a={},o=i.replace(/(\w+)="([^"\\]*)"\s*(?:,\s*|$)/g,function(t,r,n){return-1===e.indexOf(r)||null===n.match(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~]+$/)||a.hasOwnProperty(r)?void 0:(a[r]=n,"")});return""!==o?null:a},randomString:function(t){for(var e="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",r=e.length,n=[],i=0;t>i;++i)n[i]=e[Math.floor(Math.random()*r)];return n.join("")},uriRegex:/^([^:]+)\:\/\/(?:[^@]*@)?([^\/:]+)(?:\:(\d+))?([^#]*)(?:#.*)?$/,parseUri:function(t){var e=t.match(a.utils.uriRegex);if(!e)return{host:"",port:"",resource:""};var r=e[1].toLowerCase(),n={host:e[2],port:e[3]||("http"===r?"80":"https"===r?"443":""),resource:e[4]};return n},base64urlEncode:function(t){var e=o.enc.Utf8.parse(t),r=o.enc.Base64.stringify(e);return r.replace(/\+/g,"-").replace(/\//g,"_").replace(/\=/g,"")}};var o=o||function(t,r){var n={},i=n.lib={},a=function(){},o=i.Base={extend:function(t){a.prototype=this;var e=new a;return t&&e.mixIn(t),e.hasOwnProperty("init")||(e.init=function(){e.$super.init.apply(this,arguments)}),e.init.prototype=e,e.$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},s=i.WordArray=o.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=e!=r?e:4*t.length},toString:function(t){return(t||h).stringify(this)},concat:function(t){var r=this.words,n=t.words,i=this.sigBytes;if(t=t.sigBytes,this.clamp(),i%4)for(var a=0;t>a;a++)r[i+a>>>2]|=(n[a>>>2]>>>24-8*(a%4)&255)<<24-8*((i+a)%4);else if(65535<n.length)for(e=0;e<t;e+=4)r[i+e>>>2]=n[e>>>2];else r.push.apply(r,n);return this.sigBytes+=t,this},clamp:function(){var e=this.words,r=this.sigBytes;e[r>>>2]&=4294967295<<32-8*(r%4),e.length=t.ceil(r/4)},clone:function(){var t=o.clone.call(this);return t.words=this.words.slice(0),t},random:function(e){for(var r=[],n=0;e>n;n+=4)r.push(4294967296*t.random()|0);return new s.init(b,e)}}),c=n.enc={},h=c.Hex={stringify:function(t){var e=t.words;t=t.sigBytes;for(var r=[],n=0;t>n;n++){var i=e[n>>>2]>>>24-8*(n%4)&255;r.push((i>>>4).toString(16)),r.push((15&i).toString(16))}return r.join("")},parse:function(t){for(var e=t.length,r=[],n=0;e>n;n+=2)r[n>>>3]|=parseInt(t.substr(n,2),16)<<24-4*(n%8);return new s.init(r,e/2)}},u=c.Latin1={stringify:function(t){var e=t.words;t=t.sigBytes;for(var r=[],n=0;t>n;n++)r.push(String.fromCharCode(e[n>>>2]>>>24-8*(n%4)&255));return r.join("")},parse:function(t){for(var e=t.length,r=[],n=0;e>n;n++)r[n>>>2]|=(255&t.charCodeAt(n))<<24-8*(n%4);return new s.init(r,e)}},l=c.Utf8={stringify:function(t){try{return decodeURIComponent(escape(u.stringify(t)))}catch(e){throw Error("Malformed UTF-8 data")}},parse:function(t){return u.parse(unescape(encodeURIComponent(t)))}},f=i.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new s.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=l.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(e){var r=this._data,n=r.words,i=r.sigBytes,a=this.blockSize,o=i/(4*a),o=e?t.ceil(o):t.max((0|o)-this._minBufferSize,0);if(e=o*a,i=t.min(4*e,i),e){for(var c=0;e>c;c+=a)this._doProcessBlock(n,c);c=n.splice(0,e),r.sigBytes-=i}return new s.init(c,i)},clone:function(){var t=o.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0});i.Hasher=f.extend({cfg:o.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){f.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(t){return function(e,r){return new t.init(r).finalize(e)}},_createHmacHelper:function(t){return function(e,r){return new p.HMAC.init(t,r).finalize(e)}}});var p=n.algo={};return n}(Math);!function(){var t=o,e=t.lib,r=e.WordArray,n=e.Hasher,i=[],e=t.algo.SHA1=n.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,n=r[0],a=r[1],o=r[2],s=r[3],c=r[4],h=0;80>h;h++){if(16>h)i[h]=0|t[e+h];else{var u=i[h-3]^i[h-8]^i[h-14]^i[h-16];i[h]=u<<1|u>>>31}u=(n<<5|n>>>27)+c+i[h],u=20>h?u+((a&o|~a&s)+1518500249):40>h?u+((a^o^s)+1859775393):60>h?u+((a&o|a&s|o&s)-1894007588):u+((a^o^s)-899497514),c=s,s=o,o=a<<30|a>>>2,a=n,n=u}r[0]=r[0]+n|0,r[1]=r[1]+a|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+c|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,n=8*t.sigBytes;return e[n>>>5]|=128<<24-n%32,e[(n+64>>>9<<4)+14]=Math.floor(r/4294967296),e[(n+64>>>9<<4)+15]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=n.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA1=n._createHelper(e),t.HmacSHA1=n._createHmacHelper(e)}(),function(t){for(var e=o,r=e.lib,n=r.WordArray,i=r.Hasher,r=e.algo,a=[],s=[],c=function(t){return 4294967296*(t-(0|t))|0},h=2,u=0;64>u;){var l;t:{l=h;for(var f=t.sqrt(l),p=2;f>=p;p++)if(!(l%p)){l=!1;break t}l=!0}l&&(8>u&&(a[u]=c(t.pow(h,.5))),s[u]=c(t.pow(h,1/3)),u++),h++}var d=[],r=r.SHA256=i.extend({_doReset:function(){this._hash=new n.init(a.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,n=r[0],i=r[1],a=r[2],o=r[3],c=r[4],h=r[5],u=r[6],l=r[7],f=0;64>f;f++){if(16>f)d[f]=0|t[e+f];else{var p=d[f-15],g=d[f-2];d[f]=((p<<25|p>>>7)^(p<<14|p>>>18)^p>>>3)+d[f-7]+((g<<15|g>>>17)^(g<<13|g>>>19)^g>>>10)+d[f-16]}p=l+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&h^~c&u)+s[f]+d[f],g=((n<<30|n>>>2)^(n<<19|n>>>13)^(n<<10|n>>>22))+(n&i^n&a^i&a),l=u,u=h,h=c,c=o+p|0,o=a,a=i,i=n,n=p+g|0}r[0]=r[0]+n|0,r[1]=r[1]+i|0,r[2]=r[2]+a|0,r[3]=r[3]+o|0,r[4]=r[4]+c|0,r[5]=r[5]+h|0,r[6]=r[6]+u|0,r[7]=r[7]+l|0},_doFinalize:function(){var e=this._data,r=e.words,n=8*this._nDataBytes,i=8*e.sigBytes;return r[i>>>5]|=128<<24-i%32,r[(i+64>>>9<<4)+14]=t.floor(n/4294967296),r[(i+64>>>9<<4)+15]=n,e.sigBytes=4*r.length,this._process(),this._hash},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});e.SHA256=i._createHelper(r),e.HmacSHA256=i._createHmacHelper(r)}(Math),function(){var t=o,e=t.enc.Utf8;t.algo.HMAC=t.lib.Base.extend({init:function(t,r){t=this._hasher=new t.init,"string"==typeof r&&(r=e.parse(r));var n=t.blockSize,i=4*n;r.sigBytes>i&&(r=t.finalize(r)),r.clamp();for(var a=this._oKey=r.clone(),o=this._iKey=r.clone(),s=a.words,c=o.words,h=0;n>h;h++)s[h]^=1549556828,c[h]^=909522486;a.sigBytes=o.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher;return t=e.finalize(t),e.reset(),e.finalize(this._oKey.clone().concat(t))}})}(),function(){var t=o,e=t.lib.WordArray;t.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,n=this._map;t.clamp(),t=[];for(var i=0;r>i;i+=3)for(var a=(e[i>>>2]>>>24-8*(i%4)&255)<<16|(e[i+1>>>2]>>>24-8*((i+1)%4)&255)<<8|e[i+2>>>2]>>>24-8*((i+2)%4)&255,o=0;4>o&&r>i+.75*o;o++)t.push(n.charAt(a>>>6*(3-o)&63));if(e=n.charAt(64))for(;t.length%4;)t.push(e);return t.join("")},parse:function(t){var r=t.length,n=this._map,i=n.charAt(64);i&&(i=t.indexOf(i),-1!=i&&(r=i));for(var i=[],a=0,o=0;r>o;o++)if(o%4){var s=n.indexOf(t.charAt(o-1))<<2*(o%4),c=n.indexOf(t.charAt(o))>>>6-2*(o%4);i[a>>>2]|=(s|c)<<24-8*(a%4),a++}return e.create(i,a)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="}}(),a.crypto.internals=o,"undefined"!=typeof r&&r.exports&&(r.exports=a)},{}],3:[function(t,e,r){var n=t("hawk/client"),i=decodeURI(location.search.slice(1))||(0!==location.pathname.indexOf("/tryagain")?location.pathname:!1)||"/",a=n.client.header(location.origin+i,"GET",{credentials:JSON.parse(localStorage.getItem("credentials"))}),o={method:"GET",url:i,headers:{host:location.hostname+(location.port?":"+location.port:""),authorization:a.field}},s=new Date;s.setDate(s.getDate()+14),document.cookie="hawkauth="+JSON.stringify(o)+"; expires="+s.toUTCString()+"; path=/;",window.location.href=i},{"hawk/client":1}]},{},[3]);
