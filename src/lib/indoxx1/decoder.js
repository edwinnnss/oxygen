const _ = require('lodash');

/* eslint-disable */
function getTS(cookieName, ts2) {
  for (var x = 0, e = ts2, t = cookieName, _ = "", i = 0; i < t.length; i++) {
      var a = t.charCodeAt(i);
      a >= 65 && a < 90 && a++, _ += String.fromCharCode(a)
  }
  t = _;
  for (i = 0; i < t.length; i++) x += t.charCodeAt(i);
  return x = (x + e) % 10, e = e + "" + x, _ + "&t=" + e
}

function crc32(x) {
  for (var e = 0, t = 0, _ = 0, i = x.length; _ < i; _++) _ % 2 == 0 ? e += x.charCodeAt(_) : t += x.charCodeAt(_);
  return e * (e + t) * Math.abs(e - t)
}

const Base64 = {
  decode: function(_keyStr, x) {
      var e, t, _, i, a, o, r = "",
          s = 0;
      for (x = x.replace(/[^A-Za-z0-9+\/=]/g, ""); s < x.length;) e = _keyStr.indexOf(x.charAt(s++)) << 2 | (i = _keyStr.indexOf(x.charAt(s++))) >> 4, t = (15 & i) << 4 | (a = _keyStr.indexOf(x.charAt(s++))) >> 2, _ = (3 & a) << 6 | (o = _keyStr.indexOf(x.charAt(s++))), r += String.fromCharCode(e), 64 != a && (r += String.fromCharCode(t)), 64 != o && (r += String.fromCharCode(_));
      return r = Base64._utf8_decode(r)
  },
  _utf8_decode: function(x) {
    for (var e = "", t = 0, _ = c1 = c2 = 0; t < x.length;)(_ = x.charCodeAt(t)) < 128 ? (e += String.fromCharCode(_), t++) : _ > 191 && _ < 224 ? (c2 = x.charCodeAt(t + 1), e += String.fromCharCode((31 & _) << 6 | 63 & c2), t += 2) : (c2 = x.charCodeAt(t + 1), c3 = x.charCodeAt(t + 2), e += String.fromCharCode((15 & _) << 12 | (63 & c2) << 6 | 63 & c3), t += 3);
    return e
  }
}

function btoa(str) {
  return Buffer.from(str).toString('base64');
}

exports.decode = (_keyStr, e) => {
  const t = (e = Base64.decode(_keyStr, e)).lastIndexOf(']');

  return e.substr(0, t + 1);
};

exports.getTokenUrl = (cookieName, dataTmbd, ts2) => {
  const random = _.random(2);
  const possibleDomain = ['playmv', 'playmv2', 'playmv3'];
  const ts = getTS(cookieName, ts2);
  const t = _.chain(ts)
    .split('=')
    .last()
    .value();

  const k = crc32(btoa(t + dataTmbd) + t + dataTmbd + crc32(dataTmbd + t));

  return `https://${possibleDomain[random]}.akubebas.com/?token=${ts}&k=${k}&v=static7.js`;
};

function calcTime(e) {
  var t = new Date,
      i = t.getTime() + 6e4 * t.getTimezoneOffset();
  return new Date(i + 252e5)
}

const createTs2 = (tsDiv) => {
  const p = calcTime();
  let m = p.getMinutes()
  m %= tsDiv;
  var h = 1e3 * p.getSeconds(),
        g = new Date(p - 6e4 * m - h);

  return Math.floor(g.getTime() / 1e3);
}

const getEpi = (e) => {
  var t = e.indexOf(":");
  return t < 0 && (t = e.indexOf("-")), t < 0 && (t = e.length), "episode" == (e = (e = e.substr(0, t)).toLowerCase()).substr(0, 7) && (e = e.substr(7)), "eps" == e.substr(0, 3) && (e = e.substr(3)), "ep" == e.substr(0, 2) && (e = e.substr(2)), "e" == e.substr(0, 1) && (e = e.substr(1)), "0" == (e = e.trim()).substr(0, 1) && e.length >= 2 && (e = e.substr(1)), e
}

exports.getFilmSeriesTokenUrl = (cookieName, tsDiv, dataTmbd, episode, title, index) => {
  const random = _.random(2);
  const possibleDomain = ['playtv', 'playtv2', 'playtv3'];
  const ts2 = createTs2(tsDiv);
  let f = getTS(cookieName, ts2);
  f = f.substr(0, f.length - 1);
  const b = crc32(btoa(ts2 + dataTmbd) + ts2 + dataTmbd + crc32(dataTmbd + ts2));
  const e = encodeURIComponent(getEpi(title))

  return `https://${possibleDomain[random]}.akubebas.com/?sv=1&ep=${_.trim(episode)}&no=${_.trim(index)}-${_.trim(e)}&token=${_.trim(f)}&k=${_.trim(b)}`;
};