var Base64 = {
  _keyStr: "ZYX10+/PONM765LKJIAzyTSRQGxwvuHWVFEDUCBtsrqdcba9843ponmlkjihgfe2",
  encode: function(e) {
      var t, i, o, s, a, r, n, l = "", d = 0;
      for (e = Base64._utf8_encode(e); d < e.length; )
          s = (t = e.charCodeAt(d++)) >> 2,
          a = (3 & t) << 4 | (i = e.charCodeAt(d++)) >> 4,
          r = (15 & i) << 2 | (o = e.charCodeAt(d++)) >> 6,
          n = 63 & o,
          isNaN(i) ? r = n = 64 : isNaN(o) && (n = 64),
          l = l + this._keyStr.charAt(s) + this._keyStr.charAt(a) + this._keyStr.charAt(r) + this._keyStr.charAt(n);
      return l
  },
  decode: function(e) {
      var t, i, o, s, a, r, n = "", l = 0;
      for (e = e.replace(/[^A-Za-z0-9+\/=]/g, ""); l < e.length; )
          t = this._keyStr.indexOf(e.charAt(l++)) << 2 | (s = this._keyStr.indexOf(e.charAt(l++))) >> 4,
          i = (15 & s) << 4 | (a = this._keyStr.indexOf(e.charAt(l++))) >> 2,
          o = (3 & a) << 6 | (r = this._keyStr.indexOf(e.charAt(l++))),
          n += String.fromCharCode(t),
          64 != a && (n += String.fromCharCode(i)),
          64 != r && (n += String.fromCharCode(o));
      return n = Base64._utf8_decode(n)
  },
  _utf8_encode: function(e) {
      e = e.replace(/rn/g, "n");
      for (var t = "", i = 0; i < e.length; i++) {
          var o = e.charCodeAt(i);
          o < 128 ? t += String.fromCharCode(o) : o > 127 && o < 2048 ? (t += String.fromCharCode(o >> 6 | 192),
          t += String.fromCharCode(63 & o | 128)) : (t += String.fromCharCode(o >> 12 | 224),
          t += String.fromCharCode(o >> 6 & 63 | 128),
          t += String.fromCharCode(63 & o | 128))
      }
      return t
  },
  _utf8_decode: function(e) {
      for (var t = "", i = 0, o = c1 = c2 = 0; i < e.length; )
          (o = e.charCodeAt(i)) < 128 ? (t += String.fromCharCode(o),
          i++) : o > 191 && o < 224 ? (c2 = e.charCodeAt(i + 1),
          t += String.fromCharCode((31 & o) << 6 | 63 & c2),
          i += 2) : (c2 = e.charCodeAt(i + 1),
          c3 = e.charCodeAt(i + 2),
          t += String.fromCharCode((15 & o) << 12 | (63 & c2) << 6 | 63 & c3),
          i += 3);
      return t
  }
};

module.exports = Base64;
