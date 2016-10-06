(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};

require.register("bs-platform/lib/js/array.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("/bs-platform/lib/js/caml_builtin_exceptions");
var Caml_exceptions         = require("/bs-platform/lib/js/caml_exceptions");
var Curry                   = require("/bs-platform/lib/js/curry");
var Caml_array              = require("/bs-platform/lib/js/caml_array");

function init(l, f) {
  if (l) {
    if (l < 0) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "Array.init"
          ];
    }
    else {
      var res = Caml_array.caml_make_vect(l, Curry._1(f, 0));
      for(var i = 1 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
        res[i] = Curry._1(f, i);
      }
      return res;
    }
  }
  else {
    return /* array */[];
  }
}

function make_matrix(sx, sy, init) {
  var res = Caml_array.caml_make_vect(sx, /* array */[]);
  for(var x = 0 ,x_finish = sx - 1 | 0; x <= x_finish; ++x){
    res[x] = Caml_array.caml_make_vect(sy, init);
  }
  return res;
}

function copy(a) {
  var l = a.length;
  if (l) {
    return Caml_array.caml_array_sub(a, 0, l);
  }
  else {
    return /* array */[];
  }
}

function append(a1, a2) {
  var l1 = a1.length;
  if (l1) {
    if (a2.length) {
      return a1.concat(a2);
    }
    else {
      return Caml_array.caml_array_sub(a1, 0, l1);
    }
  }
  else {
    return copy(a2);
  }
}

function sub(a, ofs, len) {
  if (len < 0 || ofs > (a.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Array.sub"
        ];
  }
  else {
    return Caml_array.caml_array_sub(a, ofs, len);
  }
}

function fill(a, ofs, len, v) {
  if (ofs < 0 || len < 0 || ofs > (a.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Array.fill"
        ];
  }
  else {
    for(var i = ofs ,i_finish = (ofs + len | 0) - 1 | 0; i <= i_finish; ++i){
      a[i] = v;
    }
    return /* () */0;
  }
}

function blit(a1, ofs1, a2, ofs2, len) {
  if (len < 0 || ofs1 < 0 || ofs1 > (a1.length - len | 0) || ofs2 < 0 || ofs2 > (a2.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Array.blit"
        ];
  }
  else {
    return Caml_array.caml_array_blit(a1, ofs1, a2, ofs2, len);
  }
}

function iter(f, a) {
  for(var i = 0 ,i_finish = a.length - 1 | 0; i <= i_finish; ++i){
    Curry._1(f, a[i]);
  }
  return /* () */0;
}

function map(f, a) {
  var l = a.length;
  if (l) {
    var r = Caml_array.caml_make_vect(l, Curry._1(f, a[0]));
    for(var i = 1 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
      r[i] = Curry._1(f, a[i]);
    }
    return r;
  }
  else {
    return /* array */[];
  }
}

function iteri(f, a) {
  for(var i = 0 ,i_finish = a.length - 1 | 0; i <= i_finish; ++i){
    Curry._2(f, i, a[i]);
  }
  return /* () */0;
}

function mapi(f, a) {
  var l = a.length;
  if (l) {
    var r = Caml_array.caml_make_vect(l, Curry._2(f, 0, a[0]));
    for(var i = 1 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
      r[i] = Curry._2(f, i, a[i]);
    }
    return r;
  }
  else {
    return /* array */[];
  }
}

function to_list(a) {
  var _i = a.length - 1 | 0;
  var _res = /* [] */0;
  while(true) {
    var res = _res;
    var i = _i;
    if (i < 0) {
      return res;
    }
    else {
      _res = /* :: */[
        a[i],
        res
      ];
      _i = i - 1 | 0;
      continue ;
      
    }
  };
}

function list_length(_accu, _param) {
  while(true) {
    var param = _param;
    var accu = _accu;
    if (param) {
      _param = param[1];
      _accu = accu + 1 | 0;
      continue ;
      
    }
    else {
      return accu;
    }
  };
}

function of_list(l) {
  if (l) {
    var a = Caml_array.caml_make_vect(list_length(0, l), l[0]);
    var _i = 1;
    var _param = l[1];
    while(true) {
      var param = _param;
      var i = _i;
      if (param) {
        a[i] = param[0];
        _param = param[1];
        _i = i + 1 | 0;
        continue ;
        
      }
      else {
        return a;
      }
    };
  }
  else {
    return /* array */[];
  }
}

function fold_left(f, x, a) {
  var r = x;
  for(var i = 0 ,i_finish = a.length - 1 | 0; i <= i_finish; ++i){
    r = Curry._2(f, r, a[i]);
  }
  return r;
}

function fold_right(f, a, x) {
  var r = x;
  for(var i = a.length - 1 | 0; i >= 0; --i){
    r = Curry._2(f, a[i], r);
  }
  return r;
}

var Bottom = Caml_exceptions.create("Array.Bottom");

function sort(cmp, a) {
  var maxson = function (l, i) {
    var i31 = ((i + i | 0) + i | 0) + 1 | 0;
    var x = i31;
    if ((i31 + 2 | 0) < l) {
      if (Curry._2(cmp, a[i31], a[i31 + 1 | 0]) < 0) {
        x = i31 + 1 | 0;
      }
      if (Curry._2(cmp, a[x], a[i31 + 2 | 0]) < 0) {
        x = i31 + 2 | 0;
      }
      return x;
    }
    else if ((i31 + 1 | 0) < l && Curry._2(cmp, a[i31], a[i31 + 1 | 0]) < 0) {
      return i31 + 1 | 0;
    }
    else if (i31 < l) {
      return i31;
    }
    else {
      throw [
            Bottom,
            i
          ];
    }
  };
  var trickle = function (l, i, e) {
    try {
      var l$1 = l;
      var _i = i;
      var e$1 = e;
      while(true) {
        var i$1 = _i;
        var j = maxson(l$1, i$1);
        if (Curry._2(cmp, a[j], e$1) > 0) {
          a[i$1] = a[j];
          _i = j;
          continue ;
          
        }
        else {
          a[i$1] = e$1;
          return /* () */0;
        }
      };
    }
    catch (exn){
      if (exn[0] === Bottom) {
        a[exn[1]] = e;
        return /* () */0;
      }
      else {
        throw exn;
      }
    }
  };
  var bubble = function (l, i) {
    try {
      var l$1 = l;
      var _i = i;
      while(true) {
        var i$1 = _i;
        var j = maxson(l$1, i$1);
        a[i$1] = a[j];
        _i = j;
        continue ;
        
      };
    }
    catch (exn){
      if (exn[0] === Bottom) {
        return exn[1];
      }
      else {
        throw exn;
      }
    }
  };
  var trickleup = function (_i, e) {
    while(true) {
      var i = _i;
      var father = (i - 1 | 0) / 3 | 0;
      if (i === father) {
        throw [
              Caml_builtin_exceptions.assert_failure,
              [
                "array.ml",
                168,
                4
              ]
            ];
      }
      if (Curry._2(cmp, a[father], e) < 0) {
        a[i] = a[father];
        if (father > 0) {
          _i = father;
          continue ;
          
        }
        else {
          a[0] = e;
          return /* () */0;
        }
      }
      else {
        a[i] = e;
        return /* () */0;
      }
    };
  };
  var l = a.length;
  for(var i = ((l + 1 | 0) / 3 | 0) - 1 | 0; i >= 0; --i){
    trickle(l, i, a[i]);
  }
  for(var i$1 = l - 1 | 0; i$1 >= 2; --i$1){
    var e = a[i$1];
    a[i$1] = a[0];
    trickleup(bubble(i$1, 0), e);
  }
  if (l > 1) {
    var e$1 = a[1];
    a[1] = a[0];
    a[0] = e$1;
    return /* () */0;
  }
  else {
    return 0;
  }
}

function stable_sort(cmp, a) {
  var merge = function (src1ofs, src1len, src2, src2ofs, src2len, dst, dstofs) {
    var src1r = src1ofs + src1len | 0;
    var src2r = src2ofs + src2len | 0;
    var _i1 = src1ofs;
    var _s1 = a[src1ofs];
    var _i2 = src2ofs;
    var _s2 = src2[src2ofs];
    var _d = dstofs;
    while(true) {
      var d = _d;
      var s2 = _s2;
      var i2 = _i2;
      var s1 = _s1;
      var i1 = _i1;
      if (Curry._2(cmp, s1, s2) <= 0) {
        dst[d] = s1;
        var i1$1 = i1 + 1 | 0;
        if (i1$1 < src1r) {
          _d = d + 1 | 0;
          _s1 = a[i1$1];
          _i1 = i1$1;
          continue ;
          
        }
        else {
          return blit(src2, i2, dst, d + 1 | 0, src2r - i2 | 0);
        }
      }
      else {
        dst[d] = s2;
        var i2$1 = i2 + 1 | 0;
        if (i2$1 < src2r) {
          _d = d + 1 | 0;
          _s2 = src2[i2$1];
          _i2 = i2$1;
          continue ;
          
        }
        else {
          return blit(a, i1, dst, d + 1 | 0, src1r - i1 | 0);
        }
      }
    };
  };
  var isortto = function (srcofs, dst, dstofs, len) {
    for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
      var e = a[srcofs + i | 0];
      var j = (dstofs + i | 0) - 1 | 0;
      while(j >= dstofs && Curry._2(cmp, dst[j], e) > 0) {
        dst[j + 1 | 0] = dst[j];
        j = j - 1 | 0;
      };
      dst[j + 1 | 0] = e;
    }
    return /* () */0;
  };
  var sortto = function (srcofs, dst, dstofs, len) {
    if (len <= 5) {
      return isortto(srcofs, dst, dstofs, len);
    }
    else {
      var l1 = len / 2 | 0;
      var l2 = len - l1 | 0;
      sortto(srcofs + l1 | 0, dst, dstofs + l1 | 0, l2);
      sortto(srcofs, a, srcofs + l2 | 0, l1);
      return merge(srcofs + l2 | 0, l1, dst, dstofs + l1 | 0, l2, dst, dstofs);
    }
  };
  var l = a.length;
  if (l <= 5) {
    return isortto(0, a, 0, l);
  }
  else {
    var l1 = l / 2 | 0;
    var l2 = l - l1 | 0;
    var t = Caml_array.caml_make_vect(l2, a[0]);
    sortto(l1, t, 0, l2);
    sortto(0, a, l2, l1);
    return merge(l2, l1, t, 0, l2, a, 0);
  }
}

var create_matrix = make_matrix;

var concat = Caml_array.caml_array_concat

var fast_sort = stable_sort;

exports.init          = init;
exports.make_matrix   = make_matrix;
exports.create_matrix = create_matrix;
exports.append        = append;
exports.concat        = concat;
exports.sub           = sub;
exports.copy          = copy;
exports.fill          = fill;
exports.blit          = blit;
exports.to_list       = to_list;
exports.of_list       = of_list;
exports.iter          = iter;
exports.map           = map;
exports.iteri         = iteri;
exports.mapi          = mapi;
exports.fold_left     = fold_left;
exports.fold_right    = fold_right;
exports.sort          = sort;
exports.stable_sort   = stable_sort;
exports.fast_sort     = fast_sort;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/block.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


function __(tag, block) {
  block.tag = tag;
  return block;
}

exports.__ = __;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/bytes.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Pervasives              = require("bs-platform/lib/js/pervasives");
var Caml_int32              = require("bs-platform/lib/js/caml_int32");
var Char                    = require("bs-platform/lib/js/char");
var Curry                   = require("bs-platform/lib/js/curry");
var Caml_string             = require("bs-platform/lib/js/caml_string");
var List                    = require("bs-platform/lib/js/list");

function make(n, c) {
  var s = Caml_string.caml_create_string(n);
  Caml_string.caml_fill_string(s, 0, n, c);
  return s;
}

function init(n, f) {
  var s = Caml_string.caml_create_string(n);
  for(var i = 0 ,i_finish = n - 1 | 0; i <= i_finish; ++i){
    s[i] = Curry._1(f, i);
  }
  return s;
}

var empty = [];

function copy(s) {
  var len = s.length;
  var r = Caml_string.caml_create_string(len);
  Caml_string.caml_blit_bytes(s, 0, r, 0, len);
  return r;
}

function to_string(b) {
  return Caml_string.bytes_to_string(copy(b));
}

function of_string(s) {
  return copy(Caml_string.bytes_of_string(s));
}

function sub(s, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.sub / Bytes.sub"
        ];
  }
  else {
    var r = Caml_string.caml_create_string(len);
    Caml_string.caml_blit_bytes(s, ofs, r, 0, len);
    return r;
  }
}

function sub_string(b, ofs, len) {
  return Caml_string.bytes_to_string(sub(b, ofs, len));
}

function extend(s, left, right) {
  var len = (s.length + left | 0) + right | 0;
  var r = Caml_string.caml_create_string(len);
  var match = left < 0 ? /* tuple */[
      -left,
      0
    ] : /* tuple */[
      0,
      left
    ];
  var dstoff = match[1];
  var srcoff = match[0];
  var cpylen = Pervasives.min(s.length - srcoff | 0, len - dstoff | 0);
  if (cpylen > 0) {
    Caml_string.caml_blit_bytes(s, srcoff, r, dstoff, cpylen);
  }
  return r;
}

function fill(s, ofs, len, c) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.fill / Bytes.fill"
        ];
  }
  else {
    return Caml_string.caml_fill_string(s, ofs, len, c);
  }
}

function blit(s1, ofs1, s2, ofs2, len) {
  if (len < 0 || ofs1 < 0 || ofs1 > (s1.length - len | 0) || ofs2 < 0 || ofs2 > (s2.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Bytes.blit"
        ];
  }
  else {
    return Caml_string.caml_blit_bytes(s1, ofs1, s2, ofs2, len);
  }
}

function blit_string(s1, ofs1, s2, ofs2, len) {
  if (len < 0 || ofs1 < 0 || ofs1 > (s1.length - len | 0) || ofs2 < 0 || ofs2 > (s2.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.blit / Bytes.blit_string"
        ];
  }
  else {
    return Caml_string.caml_blit_string(s1, ofs1, s2, ofs2, len);
  }
}

function iter(f, a) {
  for(var i = 0 ,i_finish = a.length - 1 | 0; i <= i_finish; ++i){
    Curry._1(f, a[i]);
  }
  return /* () */0;
}

function iteri(f, a) {
  for(var i = 0 ,i_finish = a.length - 1 | 0; i <= i_finish; ++i){
    Curry._2(f, i, a[i]);
  }
  return /* () */0;
}

function concat(sep, l) {
  if (l) {
    var hd = l[0];
    var num = [0];
    var len = [0];
    List.iter(function (s) {
          num[0] = num[0] + 1 | 0;
          len[0] = len[0] + s.length | 0;
          return /* () */0;
        }, l);
    var r = Caml_string.caml_create_string(len[0] + Caml_int32.imul(sep.length, num[0] - 1 | 0) | 0);
    Caml_string.caml_blit_bytes(hd, 0, r, 0, hd.length);
    var pos = [hd.length];
    List.iter(function (s) {
          Caml_string.caml_blit_bytes(sep, 0, r, pos[0], sep.length);
          pos[0] = pos[0] + sep.length | 0;
          Caml_string.caml_blit_bytes(s, 0, r, pos[0], s.length);
          pos[0] = pos[0] + s.length | 0;
          return /* () */0;
        }, l[1]);
    return r;
  }
  else {
    return empty;
  }
}

function cat(a, b) {
  return a.concat(b);
}

function is_space(param) {
  var switcher = param - 9 | 0;
  if (switcher > 4 || switcher < 0) {
    if (switcher !== 23) {
      return /* false */0;
    }
    else {
      return /* true */1;
    }
  }
  else if (switcher !== 2) {
    return /* true */1;
  }
  else {
    return /* false */0;
  }
}

function trim(s) {
  var len = s.length;
  var i = 0;
  while(i < len && is_space(s[i])) {
    i = i + 1 | 0;
  };
  var j = len - 1 | 0;
  while(j >= i && is_space(s[j])) {
    j = j - 1 | 0;
  };
  if (j >= i) {
    return sub(s, i, (j - i | 0) + 1 | 0);
  }
  else {
    return empty;
  }
}

function escaped(s) {
  var n = 0;
  for(var i = 0 ,i_finish = s.length - 1 | 0; i <= i_finish; ++i){
    var match = s[i];
    var $js;
    if (match >= 32) {
      var switcher = match - 34 | 0;
      $js = switcher > 58 || switcher < 0 ? (
          switcher >= 93 ? 4 : 1
        ) : (
          switcher > 57 || switcher < 1 ? 2 : 1
        );
    }
    else {
      $js = match >= 11 ? (
          match !== 13 ? 4 : 2
        ) : (
          match >= 8 ? 2 : 4
        );
    }
    n = n + $js | 0;
  }
  if (n === s.length) {
    return copy(s);
  }
  else {
    var s$prime = Caml_string.caml_create_string(n);
    n = 0;
    for(var i$1 = 0 ,i_finish$1 = s.length - 1 | 0; i$1 <= i_finish$1; ++i$1){
      var c = s[i$1];
      var exit = 0;
      if (c >= 35) {
        if (c !== 92) {
          if (c >= 127) {
            exit = 1;
          }
          else {
            s$prime[n] = c;
          }
        }
        else {
          exit = 2;
        }
      }
      else if (c >= 32) {
        if (c >= 34) {
          exit = 2;
        }
        else {
          s$prime[n] = c;
        }
      }
      else if (c >= 14) {
        exit = 1;
      }
      else {
        switch (c) {
          case 8 :
              s$prime[n] = /* "\\" */92;
              n = n + 1 | 0;
              s$prime[n] = /* "b" */98;
              break;
          case 9 :
              s$prime[n] = /* "\\" */92;
              n = n + 1 | 0;
              s$prime[n] = /* "t" */116;
              break;
          case 10 :
              s$prime[n] = /* "\\" */92;
              n = n + 1 | 0;
              s$prime[n] = /* "n" */110;
              break;
          case 0 :
          case 1 :
          case 2 :
          case 3 :
          case 4 :
          case 5 :
          case 6 :
          case 7 :
          case 11 :
          case 12 :
              exit = 1;
              break;
          case 13 :
              s$prime[n] = /* "\\" */92;
              n = n + 1 | 0;
              s$prime[n] = /* "r" */114;
              break;

        }
      }
      switch (exit) {
        case 1 :
            s$prime[n] = /* "\\" */92;
            n = n + 1 | 0;
            s$prime[n] = 48 + (c / 100 | 0) | 0;
            n = n + 1 | 0;
            s$prime[n] = 48 + (c / 10 | 0) % 10 | 0;
            n = n + 1 | 0;
            s$prime[n] = 48 + c % 10 | 0;
            break;
        case 2 :
            s$prime[n] = /* "\\" */92;
            n = n + 1 | 0;
            s$prime[n] = c;
            break;

      }
      n = n + 1 | 0;
    }
    return s$prime;
  }
}

function map(f, s) {
  var l = s.length;
  if (l) {
    var r = Caml_string.caml_create_string(l);
    for(var i = 0 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
      r[i] = Curry._1(f, s[i]);
    }
    return r;
  }
  else {
    return s;
  }
}

function mapi(f, s) {
  var l = s.length;
  if (l) {
    var r = Caml_string.caml_create_string(l);
    for(var i = 0 ,i_finish = l - 1 | 0; i <= i_finish; ++i){
      r[i] = Curry._2(f, i, s[i]);
    }
    return r;
  }
  else {
    return s;
  }
}

function uppercase(s) {
  return map(Char.uppercase, s);
}

function lowercase(s) {
  return map(Char.lowercase, s);
}

function apply1(f, s) {
  if (s.length) {
    var r = copy(s);
    r[0] = Curry._1(f, s[0]);
    return r;
  }
  else {
    return s;
  }
}

function capitalize(s) {
  return apply1(Char.uppercase, s);
}

function uncapitalize(s) {
  return apply1(Char.lowercase, s);
}

function index_rec(s, lim, _i, c) {
  while(true) {
    var i = _i;
    if (i >= lim) {
      throw Caml_builtin_exceptions.not_found;
    }
    else if (s[i] === c) {
      return i;
    }
    else {
      _i = i + 1 | 0;
      continue ;

    }
  };
}

function index(s, c) {
  return index_rec(s, s.length, 0, c);
}

function index_from(s, i, c) {
  var l = s.length;
  if (i < 0 || i > l) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.index_from / Bytes.index_from"
        ];
  }
  else {
    return index_rec(s, l, i, c);
  }
}

function rindex_rec(s, _i, c) {
  while(true) {
    var i = _i;
    if (i < 0) {
      throw Caml_builtin_exceptions.not_found;
    }
    else if (s[i] === c) {
      return i;
    }
    else {
      _i = i - 1 | 0;
      continue ;

    }
  };
}

function rindex(s, c) {
  return rindex_rec(s, s.length - 1 | 0, c);
}

function rindex_from(s, i, c) {
  if (i < -1 || i >= s.length) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.rindex_from / Bytes.rindex_from"
        ];
  }
  else {
    return rindex_rec(s, i, c);
  }
}

function contains_from(s, i, c) {
  var l = s.length;
  if (i < 0 || i > l) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.contains_from / Bytes.contains_from"
        ];
  }
  else {
    try {
      index_rec(s, l, i, c);
      return /* true */1;
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.not_found) {
        return /* false */0;
      }
      else {
        throw exn;
      }
    }
  }
}

function contains(s, c) {
  return contains_from(s, 0, c);
}

function rcontains_from(s, i, c) {
  if (i < 0 || i >= s.length) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.rcontains_from / Bytes.rcontains_from"
        ];
  }
  else {
    try {
      rindex_rec(s, i, c);
      return /* true */1;
    }
    catch (exn){
      if (exn === Caml_builtin_exceptions.not_found) {
        return /* false */0;
      }
      else {
        throw exn;
      }
    }
  }
}

var compare = Caml_obj.caml_compare

var unsafe_to_string = Caml_string.bytes_to_string

var unsafe_of_string = Caml_string.bytes_of_string

exports.make             = make;
exports.init             = init;
exports.empty            = empty;
exports.copy             = copy;
exports.of_string        = of_string;
exports.to_string        = to_string;
exports.sub              = sub;
exports.sub_string       = sub_string;
exports.extend           = extend;
exports.fill             = fill;
exports.blit             = blit;
exports.blit_string      = blit_string;
exports.concat           = concat;
exports.cat              = cat;
exports.iter             = iter;
exports.iteri            = iteri;
exports.map              = map;
exports.mapi             = mapi;
exports.trim             = trim;
exports.escaped          = escaped;
exports.index            = index;
exports.rindex           = rindex;
exports.index_from       = index_from;
exports.rindex_from      = rindex_from;
exports.contains         = contains;
exports.contains_from    = contains_from;
exports.rcontains_from   = rcontains_from;
exports.uppercase        = uppercase;
exports.lowercase        = lowercase;
exports.capitalize       = capitalize;
exports.uncapitalize     = uncapitalize;
exports.compare          = compare;
exports.unsafe_to_string = unsafe_to_string;
exports.unsafe_of_string = unsafe_of_string;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_array.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


function caml_array_sub(x, offset, len) {
  var result = new Array(len);
  var j = 0;
  var i = offset;
  while(j < len) {
    result[j] = x[i];
    j = j + 1 | 0;
    i = i + 1 | 0;
  };
  return result;
}

function len(_acc, _l) {
  while(true) {
    var l = _l;
    var acc = _acc;
    if (l) {
      _l = l[1];
      _acc = l[0].length + acc | 0;
      continue ;
      
    }
    else {
      return acc;
    }
  };
}

function fill(arr, _i, _l) {
  while(true) {
    var l = _l;
    var i = _i;
    if (l) {
      var x = l[0];
      var l$1 = x.length;
      var k = i;
      var j = 0;
      while(j < l$1) {
        arr[k] = x[j];
        k = k + 1 | 0;
        j = j + 1 | 0;
      };
      _l = l[1];
      _i = k;
      continue ;
      
    }
    else {
      return /* () */0;
    }
  };
}

function caml_array_concat(l) {
  var v = len(0, l);
  var result = new Array(v);
  fill(result, 0, l);
  return result;
}

function caml_make_vect(len, init) {
  var b = new Array(len);
  for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
    b[i] = init;
  }
  return b;
}

function caml_array_blit(a1, i1, a2, i2, len) {
  if (i2 <= i1) {
    for(var j = 0 ,j_finish = len - 1 | 0; j <= j_finish; ++j){
      a2[j + i2 | 0] = a1[j + i1 | 0];
    }
    return /* () */0;
  }
  else {
    for(var j$1 = len - 1 | 0; j$1 >= 0; --j$1){
      a2[j$1 + i2 | 0] = a1[j$1 + i1 | 0];
    }
    return /* () */0;
  }
}

exports.caml_array_sub    = caml_array_sub;
exports.caml_array_concat = caml_array_concat;
exports.caml_make_vect    = caml_make_vect;
exports.caml_array_blit   = caml_array_blit;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_builtin_exceptions.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


var out_of_memory = /* tuple */[
  "Out_of_memory",
  0
];

var sys_error = /* tuple */[
  "Sys_error",
  -1
];

var failure = /* tuple */[
  "Failure",
  -2
];

var invalid_argument = /* tuple */[
  "Invalid_argument",
  -3
];

var end_of_file = /* tuple */[
  "End_of_file",
  -4
];

var division_by_zero = /* tuple */[
  "Division_by_zero",
  -5
];

var not_found = /* tuple */[
  "Not_found",
  -6
];

var match_failure = /* tuple */[
  "Match_failure",
  -7
];

var stack_overflow = /* tuple */[
  "Stack_overflow",
  -8
];

var sys_blocked_io = /* tuple */[
  "Sys_blocked_io",
  -9
];

var assert_failure = /* tuple */[
  "Assert_failure",
  -10
];

var undefined_recursive_module = /* tuple */[
  "Undefined_recursive_module",
  -11
];

exports.out_of_memory              = out_of_memory;
exports.sys_error                  = sys_error;
exports.failure                    = failure;
exports.invalid_argument           = invalid_argument;
exports.end_of_file                = end_of_file;
exports.division_by_zero           = division_by_zero;
exports.not_found                  = not_found;
exports.match_failure              = match_failure;
exports.stack_overflow             = stack_overflow;
exports.sys_blocked_io             = sys_blocked_io;
exports.assert_failure             = assert_failure;
exports.undefined_recursive_module = undefined_recursive_module;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_exceptions.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


var id = [0];

function caml_set_oo_id(b) {
  b[1] = id[0];
  id[0] += 1;
  return b;
}

function get_id() {
  id[0] += 1;
  return id[0];
}

function create(str) {
  var v_001 = get_id(/* () */0);
  var v = /* tuple */[
    str,
    v_001
  ];
  v.tag = 248;
  return v;
}

exports.caml_set_oo_id = caml_set_oo_id;
exports.get_id         = get_id;
exports.create         = create;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_format.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_int64              = require("bs-platform/lib/js/caml_int64");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_int32              = require("bs-platform/lib/js/caml_int32");
var Curry                   = require("bs-platform/lib/js/curry");
var Caml_utils              = require("bs-platform/lib/js/caml_utils");
var Caml_string             = require("bs-platform/lib/js/caml_string");

function caml_failwith(s) {
  throw [
        Caml_builtin_exceptions.failure,
        s
      ];
}

function parse_digit(c) {
  if (c >= 65) {
    if (c >= 97) {
      if (c >= 123) {
        return -1;
      }
      else {
        return c - 87 | 0;
      }
    }
    else if (c >= 91) {
      return -1;
    }
    else {
      return c - 55 | 0;
    }
  }
  else if (c > 57 || c < 48) {
    return -1;
  }
  else {
    return c - /* "0" */48 | 0;
  }
}

function int_of_string_base(param) {
  switch (param) {
    case 0 :
        return 8;
    case 1 :
        return 16;
    case 2 :
        return 10;
    case 3 :
        return 2;

  }
}

function parse_sign_and_base(s) {
  var sign = 1;
  var base = /* Dec */2;
  var i = 0;
  if (s[i] === "-") {
    sign = -1;
    i = i + 1 | 0;
  }
  var match = s.charCodeAt(i);
  var match$1 = s.charCodeAt(i + 1 | 0);
  if (match === 48) {
    if (match$1 >= 89) {
      if (match$1 !== 98) {
        if (match$1 !== 111) {
          if (match$1 === 120) {
            base = /* Hex */1;
            i = i + 2 | 0;
          }

        }
        else {
          base = /* Oct */0;
          i = i + 2 | 0;
        }
      }
      else {
        base = /* Bin */3;
        i = i + 2 | 0;
      }
    }
    else if (match$1 !== 66) {
      if (match$1 !== 79) {
        if (match$1 >= 88) {
          base = /* Hex */1;
          i = i + 2 | 0;
        }

      }
      else {
        base = /* Oct */0;
        i = i + 2 | 0;
      }
    }
    else {
      base = /* Bin */3;
      i = i + 2 | 0;
    }
  }
  return /* tuple */[
          i,
          sign,
          base
        ];
}

function caml_int_of_string(s) {
  var match = parse_sign_and_base(s);
  var i = match[0];
  var base = int_of_string_base(match[2]);
  var threshold = 4294967295;
  var len = s.length;
  var c = i < len ? s.charCodeAt(i) : /* "\000" */0;
  var d = parse_digit(c);
  if (d < 0 || d >= base) {
    throw [
          Caml_builtin_exceptions.failure,
          "int_of_string"
        ];
  }
  var aux = function (_acc, _k) {
    while(true) {
      var k = _k;
      var acc = _acc;
      if (k === len) {
        return acc;
      }
      else {
        var a = s.charCodeAt(k);
        if (a === /* "_" */95) {
          _k = k + 1 | 0;
          continue ;

        }
        else {
          var v = parse_digit(a);
          if (v < 0 || v >= base) {
            throw [
                  Caml_builtin_exceptions.failure,
                  "int_of_string"
                ];
          }
          else {
            var acc$1 = base * acc + v;
            if (acc$1 > threshold) {
              throw [
                    Caml_builtin_exceptions.failure,
                    "int_of_string"
                  ];
            }
            else {
              _k = k + 1 | 0;
              _acc = acc$1;
              continue ;

            }
          }
        }
      }
    };
  };
  var res = match[1] * aux(d, i + 1 | 0);
  var or_res = res | 0;
  if (base === 10 && res !== or_res) {
    throw [
          Caml_builtin_exceptions.failure,
          "int_of_string"
        ];
  }
  return or_res;
}

function caml_int64_of_string(s) {
  var match = parse_sign_and_base(s);
  var hbase = match[2];
  var i = match[0];
  var base = Caml_int64.of_int32(int_of_string_base(hbase));
  var sign = Caml_int64.of_int32(match[1]);
  var threshold;
  switch (hbase) {
    case 0 :
        threshold = /* int64 */[
          /* hi */536870911,
          /* lo */4294967295
        ];
        break;
    case 1 :
        threshold = /* int64 */[
          /* hi */268435455,
          /* lo */4294967295
        ];
        break;
    case 2 :
        threshold = /* int64 */[
          /* hi */429496729,
          /* lo */2576980377
        ];
        break;
    case 3 :
        threshold = /* int64 */[
          /* hi */2147483647,
          /* lo */4294967295
        ];
        break;

  }
  var len = s.length;
  var c = i < len ? s.charCodeAt(i) : /* "\000" */0;
  var d = Caml_int64.of_int32(parse_digit(c));
  if (Caml_int64.lt(d, /* int64 */[
          /* hi */0,
          /* lo */0
        ]) || Caml_int64.ge(d, base)) {
    throw [
          Caml_builtin_exceptions.failure,
          "int64_of_string"
        ];
  }
  var aux = function (_acc, _k) {
    while(true) {
      var k = _k;
      var acc = _acc;
      if (k === len) {
        return acc;
      }
      else {
        var a = s.charCodeAt(k);
        if (a === /* "_" */95) {
          _k = k + 1 | 0;
          continue ;

        }
        else {
          var v = Caml_int64.of_int32(parse_digit(a));
          if (Caml_int64.lt(v, /* int64 */[
                  /* hi */0,
                  /* lo */0
                ]) || Caml_int64.ge(v, base)) {
            throw [
                  Caml_builtin_exceptions.failure,
                  "int64_of_string"
                ];
          }
          else {
            var acc$1 = Caml_int64.add(Caml_int64.mul(base, acc), v);
            if (Caml_int64.gt(acc$1, threshold)) {
              throw [
                    Caml_builtin_exceptions.failure,
                    "int64_of_string"
                  ];
            }
            else {
              _k = k + 1 | 0;
              _acc = acc$1;
              continue ;

            }
          }
        }
      }
    };
  };
  var res = Caml_int64.mul(sign, aux(d, i + 1 | 0));
  var or_res_000 = /* hi */res[0] | /* hi */0;
  var or_res_001 = /* lo */(res[1] >>> 0);
  var or_res = /* int64 */[
    or_res_000,
    or_res_001
  ];
  if (Caml_int64.eq(base, /* int64 */[
          /* hi */0,
          /* lo */10
        ]) && Caml_int64.neq(res, or_res)) {
    throw [
          Caml_builtin_exceptions.failure,
          "int64_of_string"
        ];
  }
  return or_res;
}

function int_of_base(param) {
  switch (param) {
    case 0 :
        return 8;
    case 1 :
        return 16;
    case 2 :
        return 10;

  }
}

function lowercase(c) {
  if (c >= /* "A" */65 && c <= /* "Z" */90 || c >= /* "\192" */192 && c <= /* "\214" */214 || c >= /* "\216" */216 && c <= /* "\222" */222) {
    return c + 32 | 0;
  }
  else {
    return c;
  }
}

function parse_format(fmt) {
  var len = fmt.length;
  if (len > 31) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "format_int: format too long"
        ];
  }
  var f = /* record */[
    /* justify */"+",
    /* signstyle */"-",
    /* filter */" ",
    /* alternate : false */0,
    /* base : Dec */2,
    /* signedconv : false */0,
    /* width */0,
    /* uppercase : false */0,
    /* sign */1,
    /* prec */-1,
    /* conv */"f"
  ];
  var _i = 0;
  while(true) {
    var i = _i;
    if (i >= len) {
      return f;
    }
    else {
      var c = fmt.charCodeAt(i);
      var exit = 0;
      if (c >= 69) {
        if (c >= 88) {
          if (c >= 121) {
            exit = 1;
          }
          else {
            switch (c - 88 | 0) {
              case 0 :
                  f[/* base */4] = /* Hex */1;
                  f[/* uppercase */7] = /* true */1;
                  _i = i + 1 | 0;
                  continue ;
                  case 13 :
              case 14 :
              case 15 :
                  exit = 5;
                  break;
              case 12 :
              case 17 :
                  exit = 4;
                  break;
              case 23 :
                  f[/* base */4] = /* Oct */0;
                  _i = i + 1 | 0;
                  continue ;
                  case 29 :
                  f[/* base */4] = /* Dec */2;
                  _i = i + 1 | 0;
                  continue ;
                  case 1 :
              case 2 :
              case 3 :
              case 4 :
              case 5 :
              case 6 :
              case 7 :
              case 8 :
              case 9 :
              case 10 :
              case 11 :
              case 16 :
              case 18 :
              case 19 :
              case 20 :
              case 21 :
              case 22 :
              case 24 :
              case 25 :
              case 26 :
              case 27 :
              case 28 :
              case 30 :
              case 31 :
                  exit = 1;
                  break;
              case 32 :
                  f[/* base */4] = /* Hex */1;
                  _i = i + 1 | 0;
                  continue ;

            }
          }
        }
        else if (c >= 72) {
          exit = 1;
        }
        else {
          f[/* signedconv */5] = /* true */1;
          f[/* uppercase */7] = /* true */1;
          f[/* conv */10] = String.fromCharCode(lowercase(c));
          _i = i + 1 | 0;
          continue ;

        }
      }
      else {
        var switcher = c - 32 | 0;
        if (switcher > 25 || switcher < 0) {
          exit = 1;
        }
        else {
          switch (switcher) {
            case 3 :
                f[/* alternate */3] = /* true */1;
                _i = i + 1 | 0;
                continue ;
                case 0 :
            case 11 :
                exit = 2;
                break;
            case 13 :
                f[/* justify */0] = "-";
                _i = i + 1 | 0;
                continue ;
                case 14 :
                f[/* prec */9] = 0;
                var j = i + 1 | 0;
                while((function(j){
                    return function () {
                      var w = fmt.charCodeAt(j) - /* "0" */48 | 0;
                      return +(w >= 0 && w <= 9);
                    }
                    }(j))()) {
                  f[/* prec */9] = (Caml_int32.imul(f[/* prec */9], 10) + fmt.charCodeAt(j) | 0) - /* "0" */48 | 0;
                  j = j + 1 | 0;
                };
                _i = j;
                continue ;
                case 1 :
            case 2 :
            case 4 :
            case 5 :
            case 6 :
            case 7 :
            case 8 :
            case 9 :
            case 10 :
            case 12 :
            case 15 :
                exit = 1;
                break;
            case 16 :
                f[/* filter */2] = "0";
                _i = i + 1 | 0;
                continue ;
                case 17 :
            case 18 :
            case 19 :
            case 20 :
            case 21 :
            case 22 :
            case 23 :
            case 24 :
            case 25 :
                exit = 3;
                break;

          }
        }
      }
      switch (exit) {
        case 1 :
            _i = i + 1 | 0;
            continue ;
            case 2 :
            f[/* signstyle */1] = String.fromCharCode(c);
            _i = i + 1 | 0;
            continue ;
            case 3 :
            f[/* width */6] = 0;
            var j$1 = i;
            while((function(j$1){
                return function () {
                  var w = fmt.charCodeAt(j$1) - /* "0" */48 | 0;
                  return +(w >= 0 && w <= 9);
                }
                }(j$1))()) {
              f[/* width */6] = (Caml_int32.imul(f[/* width */6], 10) + fmt.charCodeAt(j$1) | 0) - /* "0" */48 | 0;
              j$1 = j$1 + 1 | 0;
            };
            _i = j$1;
            continue ;
            case 4 :
            f[/* signedconv */5] = /* true */1;
            f[/* base */4] = /* Dec */2;
            _i = i + 1 | 0;
            continue ;
            case 5 :
            f[/* signedconv */5] = /* true */1;
            f[/* conv */10] = String.fromCharCode(c);
            _i = i + 1 | 0;
            continue ;

      }
    }
  };
}

function finish_formatting(param, rawbuffer) {
  var justify = param[/* justify */0];
  var signstyle = param[/* signstyle */1];
  var filter = param[/* filter */2];
  var alternate = param[/* alternate */3];
  var base = param[/* base */4];
  var signedconv = param[/* signedconv */5];
  var width = param[/* width */6];
  var uppercase = param[/* uppercase */7];
  var sign = param[/* sign */8];
  var len = rawbuffer.length;
  if (signedconv && (sign < 0 || signstyle !== "-")) {
    len = len + 1 | 0;
  }
  if (alternate) {
    if (base) {
      if (base === /* Hex */1) {
        len = len + 2 | 0;
      }

    }
    else {
      len = len + 1 | 0;
    }
  }
  var buffer = "";
  if (justify === "+" && filter === " ") {
    for(var i = len ,i_finish = width - 1 | 0; i <= i_finish; ++i){
      buffer = buffer + filter;
    }
  }
  if (signedconv) {
    if (sign < 0) {
      buffer = buffer + "-";
    }
    else if (signstyle !== "-") {
      buffer = buffer + signstyle;
    }

  }
  if (alternate && base === /* Oct */0) {
    buffer = buffer + "0";
  }
  if (alternate && base === /* Hex */1) {
    buffer = buffer + "0x";
  }
  if (justify === "+" && filter === "0") {
    for(var i$1 = len ,i_finish$1 = width - 1 | 0; i$1 <= i_finish$1; ++i$1){
      buffer = buffer + filter;
    }
  }
  buffer = uppercase ? buffer + rawbuffer.toUpperCase() : buffer + rawbuffer;
  if (justify === "-") {
    for(var i$2 = len ,i_finish$2 = width - 1 | 0; i$2 <= i_finish$2; ++i$2){
      buffer = buffer + " ";
    }
  }
  return buffer;
}

function caml_format_int(fmt, i) {
  if (fmt === "%d") {
    return "" + i;
  }
  else {
    var f = parse_format(fmt);
    var f$1 = f;
    var i$1 = i;
    var i$2 = i$1 < 0 ? (
        f$1[/* signedconv */5] ? (f$1[/* sign */8] = -1, -i$1) : (i$1 >>> 0)
      ) : i$1;
    var s = i$2.toString(int_of_base(f$1[/* base */4]));
    if (f$1[/* prec */9] >= 0) {
      f$1[/* filter */2] = " ";
      var n = f$1[/* prec */9] - s.length | 0;
      if (n > 0) {
        s = Caml_utils.repeat(n, "0") + s;
      }

    }
    return finish_formatting(f$1, s);
  }
}

function caml_int64_format(fmt, x) {
  var f = parse_format(fmt);
  var x$1 = f[/* signedconv */5] && Caml_int64.lt(x, /* int64 */[
        /* hi */0,
        /* lo */0
      ]) ? (f[/* sign */8] = -1, Caml_int64.neg(x)) : x;
  var s = "";
  var match = f[/* base */4];
  switch (match) {
    case 0 :
        var wbase = /* int64 */[
          /* hi */0,
          /* lo */8
        ];
        var cvtbl = "01234567";
        if (Caml_int64.lt(x$1, /* int64 */[
                /* hi */0,
                /* lo */0
              ])) {
          var y = Caml_int64.discard_sign(x$1);
          var match$1 = Caml_int64.div_mod(y, wbase);
          var quotient = Caml_int64.add(/* int64 */[
                /* hi */268435456,
                /* lo */0
              ], match$1[0]);
          var modulus = match$1[1];
          s = Caml_string.js_string_of_char(cvtbl.charCodeAt(modulus[1] | 0)) + s;
          while(Caml_int64.neq(quotient, /* int64 */[
                  /* hi */0,
                  /* lo */0
                ])) {
            var match$2 = Caml_int64.div_mod(quotient, wbase);
            quotient = match$2[0];
            modulus = match$2[1];
            s = Caml_string.js_string_of_char(cvtbl.charCodeAt(modulus[1] | 0)) + s;
          };
        }
        else {
          var match$3 = Caml_int64.div_mod(x$1, wbase);
          var quotient$1 = match$3[0];
          var modulus$1 = match$3[1];
          s = Caml_string.js_string_of_char(cvtbl.charCodeAt(modulus$1[1] | 0)) + s;
          while(Caml_int64.neq(quotient$1, /* int64 */[
                  /* hi */0,
                  /* lo */0
                ])) {
            var match$4 = Caml_int64.div_mod(quotient$1, wbase);
            quotient$1 = match$4[0];
            modulus$1 = match$4[1];
            s = Caml_string.js_string_of_char(cvtbl.charCodeAt(modulus$1[1] | 0)) + s;
          };
        }
        break;
    case 1 :
        s = Caml_int64.to_hex(x$1) + s;
        break;
    case 2 :
        var wbase$1 = /* int64 */[
          /* hi */0,
          /* lo */10
        ];
        var cvtbl$1 = "0123456789";
        if (Caml_int64.lt(x$1, /* int64 */[
                /* hi */0,
                /* lo */0
              ])) {
          var y$1 = Caml_int64.discard_sign(x$1);
          var match$5 = Caml_int64.div_mod(y$1, wbase$1);
          var match$6 = Caml_int64.div_mod(Caml_int64.add(/* int64 */[
                    /* hi */0,
                    /* lo */8
                  ], match$5[1]), wbase$1);
          var quotient$2 = Caml_int64.add(Caml_int64.add(/* int64 */[
                    /* hi */214748364,
                    /* lo */3435973836
                  ], match$5[0]), match$6[0]);
          var modulus$2 = match$6[1];
          s = Caml_string.js_string_of_char(cvtbl$1.charCodeAt(modulus$2[1] | 0)) + s;
          while(Caml_int64.neq(quotient$2, /* int64 */[
                  /* hi */0,
                  /* lo */0
                ])) {
            var match$7 = Caml_int64.div_mod(quotient$2, wbase$1);
            quotient$2 = match$7[0];
            modulus$2 = match$7[1];
            s = Caml_string.js_string_of_char(cvtbl$1.charCodeAt(modulus$2[1] | 0)) + s;
          };
        }
        else {
          var match$8 = Caml_int64.div_mod(x$1, wbase$1);
          var quotient$3 = match$8[0];
          var modulus$3 = match$8[1];
          s = Caml_string.js_string_of_char(cvtbl$1.charCodeAt(modulus$3[1] | 0)) + s;
          while(Caml_int64.neq(quotient$3, /* int64 */[
                  /* hi */0,
                  /* lo */0
                ])) {
            var match$9 = Caml_int64.div_mod(quotient$3, wbase$1);
            quotient$3 = match$9[0];
            modulus$3 = match$9[1];
            s = Caml_string.js_string_of_char(cvtbl$1.charCodeAt(modulus$3[1] | 0)) + s;
          };
        }
        break;

  }
  if (f[/* prec */9] >= 0) {
    f[/* filter */2] = " ";
    var n = f[/* prec */9] - s.length | 0;
    if (n > 0) {
      s = Caml_utils.repeat(n, "0") + s;
    }

  }
  return finish_formatting(f, s);
}

function caml_format_float(fmt, x) {
  var f = parse_format(fmt);
  var prec = f[/* prec */9] < 0 ? 6 : f[/* prec */9];
  var x$1 = x < 0 ? (f[/* sign */8] = -1, -x) : x;
  var s = "";
  if (isNaN(x$1)) {
    s = "nan";
    f[/* filter */2] = " ";
  }
  else if (isFinite(x$1)) {
    var match = f[/* conv */10];
    switch (match) {
      case "e" :
          s = x$1.toExponential(prec);
          var i = s.length;
          if (s[i - 3 | 0] === "e") {
            s = s.slice(0, i - 1 | 0) + ("0" + s.slice(i - 1 | 0));
          }
          break;
      case "f" :
          s = x$1.toFixed(prec);
          break;
      case "g" :
          var prec$1 = prec !== 0 ? prec : 1;
          s = x$1.toExponential(prec$1 - 1 | 0);
          var j = s.indexOf("e");
          var exp = +s.slice(j + 1 | 0);
          if (exp < -4 || x$1 >= 1e21 || x$1.toFixed(0).length > prec$1) {
            var i$1 = j - 1 | 0;
            while(s[i$1] === "0") {
              i$1 = i$1 - 1 | 0;
            };
            if (s[i$1] === ".") {
              i$1 = i$1 - 1 | 0;
            }
            s = s.slice(0, i$1 + 1 | 0) + s.slice(j);
            var i$2 = s.length;
            if (s[i$2 - 3 | 0] === "e") {
              s = s.slice(0, i$2 - 1 | 0) + ("0" + s.slice(i$2 - 1 | 0));
            }

          }
          else {
            var p = prec$1;
            if (exp < 0) {
              p = p - (exp + 1 | 0) | 0;
              s = x$1.toFixed(p);
            }
            else {
              while(function () {
                    s = x$1.toFixed(p);
                    return +(s.length > (prec$1 + 1 | 0));
                  }()) {
                p = p - 1 | 0;
              };
            }
            if (p !== 0) {
              var k = s.length - 1 | 0;
              while(s[k] === "0") {
                k = k - 1 | 0;
              };
              if (s[k] === ".") {
                k = k - 1 | 0;
              }
              s = s.slice(0, k + 1 | 0);
            }

          }
          break;
      default:

    }
  }
  else {
    s = "inf";
    f[/* filter */2] = " ";
  }
  return finish_formatting(f, s);
}

var float_of_string = (
  function (s, caml_failwith) {
    var res = +s;
    if ((s.length > 0) && (res === res))
        return res;
    s = s.replace(/_/g, "");
    res = +s;
    if (((s.length > 0) && (res === res)) || /^[+-]?nan$/i.test(s)) {
        return res;
    }
    ;
    if (/^ *0x[0-9a-f_]+p[+-]?[0-9_]+/i.test(s)) {
        var pidx = s.indexOf('p');
        pidx = (pidx == -1) ? s.indexOf('P') : pidx;
        var exp = +s.substring(pidx + 1);
        res = +s.substring(0, pidx);
        return res * Math.pow(2, exp);
    }
    if (/^\+?inf(inity)?$/i.test(s))
        return Infinity;
    if (/^-inf(inity)?$/i.test(s))
        return -Infinity;
    caml_failwith("float_of_string");
}

);

function caml_float_of_string(s) {
  return Curry._2(float_of_string, s, caml_failwith);
}

var caml_nativeint_format = caml_format_int;

var caml_int32_format = caml_format_int;

var caml_int32_of_string = caml_int_of_string;

var caml_nativeint_of_string = caml_int_of_string;

exports.caml_format_float        = caml_format_float;
exports.caml_format_int          = caml_format_int;
exports.caml_nativeint_format    = caml_nativeint_format;
exports.caml_int32_format        = caml_int32_format;
exports.caml_float_of_string     = caml_float_of_string;
exports.caml_int64_format        = caml_int64_format;
exports.caml_int_of_string       = caml_int_of_string;
exports.caml_int32_of_string     = caml_int32_of_string;
exports.caml_int64_of_string     = caml_int64_of_string;
exports.caml_nativeint_of_string = caml_nativeint_of_string;
/* float_of_string Not a pure module */
  })();
});

require.register("bs-platform/lib/js/caml_int32.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");

function div(x, y) {
  if (y === 0) {
    throw Caml_builtin_exceptions.division_by_zero;
  }
  else {
    return x / y | 0;
  }
}

function mod_(x, y) {
  if (y === 0) {
    throw Caml_builtin_exceptions.division_by_zero;
  }
  else {
    return x % y;
  }
}

function caml_bswap16(x) {
  return ((x & 255) << 8) | ((x & 65280) >>> 8);
}

function caml_int32_bswap(x) {
  return ((x & 255) << 24) | ((x & 65280) << 8) | ((x & 16711680) >>> 8) | ((x & 4278190080) >>> 24);
}

var imul = ( Math.imul || function (x,y) {
  y |= 0; return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
);

var caml_nativeint_bswap = caml_int32_bswap;

exports.div                  = div;
exports.mod_                 = mod_;
exports.caml_bswap16         = caml_bswap16;
exports.caml_int32_bswap     = caml_int32_bswap;
exports.caml_nativeint_bswap = caml_nativeint_bswap;
exports.imul                 = imul;
/* imul Not a pure module */
  })();
});

require.register("bs-platform/lib/js/caml_int64.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Caml_int32              = require("bs-platform/lib/js/caml_int32");
var Caml_utils              = require("bs-platform/lib/js/caml_utils");

var min_int = /* record */[
  /* hi */-2147483648,
  /* lo */0
];

var max_int = /* record */[
  /* hi */134217727,
  /* lo */1
];

var one = /* record */[
  /* hi */0,
  /* lo */1
];

var zero = /* record */[
  /* hi */0,
  /* lo */0
];

var neg_one = /* record */[
  /* hi */-1,
  /* lo */4294967295
];

function neg_signed(x) {
  return +((x & 2147483648) !== 0);
}

function add(param, param$1) {
  var other_low_ = param$1[/* lo */1];
  var this_low_ = param[/* lo */1];
  var lo = this_low_ + other_low_ & 4294967295;
  var overflow = neg_signed(this_low_) && (neg_signed(other_low_) || !neg_signed(lo)) || neg_signed(other_low_) && !neg_signed(lo) ? 1 : 0;
  var hi = param[/* hi */0] + param$1[/* hi */0] + overflow & 4294967295;
  return /* record */[
          /* hi */hi,
          /* lo */(lo >>> 0)
        ];
}

function not(param) {
  var hi = param[/* hi */0] ^ -1;
  var lo = param[/* lo */1] ^ -1;
  return /* record */[
          /* hi */hi,
          /* lo */(lo >>> 0)
        ];
}

function eq(x, y) {
  if (x[/* hi */0] === y[/* hi */0]) {
    return +(x[/* lo */1] === y[/* lo */1]);
  }
  else {
    return /* false */0;
  }
}

function neg(x) {
  if (eq(x, min_int)) {
    return min_int;
  }
  else {
    return add(not(x), one);
  }
}

function sub(x, y) {
  return add(x, neg(y));
}

function lsl_(x, numBits) {
  var lo = x[/* lo */1];
  if (numBits) {
    if (numBits >= 32) {
      return /* record */[
              /* hi */(lo << (numBits - 32 | 0)),
              /* lo */0
            ];
    }
    else {
      var hi = (lo >>> (32 - numBits | 0)) | (x[/* hi */0] << numBits);
      return /* record */[
              /* hi */hi,
              /* lo */((lo << numBits) >>> 0)
            ];
    }
  }
  else {
    return x;
  }
}

function lsr_(x, numBits) {
  var hi = x[/* hi */0];
  if (numBits) {
    var offset = numBits - 32 | 0;
    if (offset) {
      if (offset > 0) {
        var lo = (hi >>> offset);
        return /* record */[
                /* hi */0,
                /* lo */(lo >>> 0)
              ];
      }
      else {
        var hi$1 = (hi >>> numBits);
        var lo$1 = (hi << -offset) | (x[/* lo */1] >>> numBits);
        return /* record */[
                /* hi */hi$1,
                /* lo */(lo$1 >>> 0)
              ];
      }
    }
    else {
      return /* record */[
              /* hi */0,
              /* lo */(hi >>> 0)
            ];
    }
  }
  else {
    return x;
  }
}

function asr_(x, numBits) {
  var hi = x[/* hi */0];
  if (numBits) {
    if (numBits < 32) {
      var hi$1 = (hi >> numBits);
      var lo = (hi << (32 - numBits | 0)) | (x[/* lo */1] >>> numBits);
      return /* record */[
              /* hi */hi$1,
              /* lo */(lo >>> 0)
            ];
    }
    else {
      var lo$1 = (hi >> (numBits - 32 | 0));
      return /* record */[
              /* hi */hi >= 0 ? 0 : -1,
              /* lo */(lo$1 >>> 0)
            ];
    }
  }
  else {
    return x;
  }
}

function is_zero(param) {
  if (param[/* hi */0] !== 0 || param[/* lo */1] !== 0) {
    return /* false */0;
  }
  else {
    return /* true */1;
  }
}

function mul(_this, _other) {
  while(true) {
    var other = _other;
    var $$this = _this;
    var exit = 0;
    var lo;
    var this_hi = $$this[/* hi */0];
    var exit$1 = 0;
    var exit$2 = 0;
    var exit$3 = 0;
    if (this_hi !== 0) {
      exit$3 = 4;
    }
    else if ($$this[/* lo */1] !== 0) {
      exit$3 = 4;
    }
    else {
      return zero;
    }
    if (exit$3 === 4) {
      if (other[/* hi */0] !== 0) {
        exit$2 = 3;
      }
      else if (other[/* lo */1] !== 0) {
        exit$2 = 3;
      }
      else {
        return zero;
      }
    }
    if (exit$2 === 3) {
      if (this_hi !== -2147483648) {
        exit$1 = 2;
      }
      else if ($$this[/* lo */1] !== 0) {
        exit$1 = 2;
      }
      else {
        lo = other[/* lo */1];
        exit = 1;
      }
    }
    if (exit$1 === 2) {
      var other_hi = other[/* hi */0];
      var lo$1 = $$this[/* lo */1];
      var exit$4 = 0;
      if (other_hi !== -2147483648) {
        exit$4 = 3;
      }
      else if (other[/* lo */1] !== 0) {
        exit$4 = 3;
      }
      else {
        lo = lo$1;
        exit = 1;
      }
      if (exit$4 === 3) {
        var other_lo = other[/* lo */1];
        if (this_hi < 0) {
          if (other_hi < 0) {
            _other = neg(other);
            _this = neg($$this);
            continue ;

          }
          else {
            return neg(mul(neg($$this), other));
          }
        }
        else if (other_hi < 0) {
          return neg(mul($$this, neg(other)));
        }
        else {
          var a48 = (this_hi >>> 16);
          var a32 = this_hi & 65535;
          var a16 = (lo$1 >>> 16);
          var a00 = lo$1 & 65535;
          var b48 = (other_hi >>> 16);
          var b32 = other_hi & 65535;
          var b16 = (other_lo >>> 16);
          var b00 = other_lo & 65535;
          var c48 = 0;
          var c32 = 0;
          var c16 = 0;
          var c00 = a00 * b00;
          c16 = (c00 >>> 16) + a16 * b00;
          c32 = (c16 >>> 16);
          c16 = (c16 & 65535) + a00 * b16;
          c32 = c32 + (c16 >>> 16) + a32 * b00;
          c48 = (c32 >>> 16);
          c32 = (c32 & 65535) + a16 * b16;
          c48 += (c32 >>> 16);
          c32 = (c32 & 65535) + a00 * b32;
          c48 += (c32 >>> 16);
          c32 = c32 & 65535;
          c48 = c48 + (a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48) & 65535;
          var hi = c32 | (c48 << 16);
          var lo$2 = c00 & 65535 | ((c16 & 65535) << 16);
          return /* record */[
                  /* hi */hi,
                  /* lo */(lo$2 >>> 0)
                ];
        }
      }

    }
    if (exit === 1) {
      if ((lo & 1) === 0) {
        return zero;
      }
      else {
        return min_int;
      }
    }

  };
}

function swap(param) {
  var hi = Caml_int32.caml_int32_bswap(param[/* lo */1]);
  var lo = Caml_int32.caml_int32_bswap(param[/* hi */0]);
  return /* record */[
          /* hi */hi,
          /* lo */(lo >>> 0)
        ];
}

function ge(param, param$1) {
  var other_hi = param$1[/* hi */0];
  var hi = param[/* hi */0];
  if (hi > other_hi) {
    return /* true */1;
  }
  else if (hi < other_hi) {
    return /* false */0;
  }
  else {
    return +(param[/* lo */1] >= param$1[/* lo */1]);
  }
}

function neq(x, y) {
  return !eq(x, y);
}

function lt(x, y) {
  return !ge(x, y);
}

function gt(x, y) {
  if (x[/* hi */0] > y[/* hi */0]) {
    return /* true */1;
  }
  else if (x[/* hi */0] < y[/* hi */0]) {
    return /* false */0;
  }
  else {
    return +(x[/* lo */1] > y[/* lo */1]);
  }
}

function le(x, y) {
  return !gt(x, y);
}

function to_float(param) {
  return param[/* hi */0] * 4294967296 + param[/* lo */1];
}

var two_ptr_32_dbl = Math.pow(2, 32);

var two_ptr_63_dbl = Math.pow(2, 63);

var neg_two_ptr_63 = -Math.pow(2, 63);

function of_float(x) {
  if (isNaN(x) || !isFinite(x)) {
    return zero;
  }
  else if (x <= neg_two_ptr_63) {
    return min_int;
  }
  else if (x + 1 >= two_ptr_63_dbl) {
    return max_int;
  }
  else if (x < 0) {
    return neg(of_float(-x));
  }
  else {
    var hi = x / two_ptr_32_dbl | 0;
    var lo = x % two_ptr_32_dbl | 0;
    return /* record */[
            /* hi */hi,
            /* lo */(lo >>> 0)
          ];
  }
}

function div(_self, _other) {
  while(true) {
    var other = _other;
    var self = _self;
    var self_hi = self[/* hi */0];
    var exit = 0;
    var exit$1 = 0;
    if (other[/* hi */0] !== 0) {
      exit$1 = 2;
    }
    else if (other[/* lo */1] !== 0) {
      exit$1 = 2;
    }
    else {
      throw Caml_builtin_exceptions.division_by_zero;
    }
    if (exit$1 === 2) {
      if (self_hi !== -2147483648) {
        if (self_hi !== 0) {
          exit = 1;
        }
        else if (self[/* lo */1] !== 0) {
          exit = 1;
        }
        else {
          return zero;
        }
      }
      else if (self[/* lo */1] !== 0) {
        exit = 1;
      }
      else if (eq(other, one) || eq(other, neg_one)) {
        return self;
      }
      else if (eq(other, min_int)) {
        return one;
      }
      else {
        var other_hi = other[/* hi */0];
        var half_this = asr_(self, 1);
        var approx = lsl_(div(half_this, other), 1);
        var exit$2 = 0;
        if (approx[/* hi */0] !== 0) {
          exit$2 = 3;
        }
        else if (approx[/* lo */1] !== 0) {
          exit$2 = 3;
        }
        else if (other_hi < 0) {
          return one;
        }
        else {
          return neg(one);
        }
        if (exit$2 === 3) {
          var y = mul(other, approx);
          var rem = add(self, neg(y));
          return add(approx, div(rem, other));
        }

      }
    }
    if (exit === 1) {
      var other_hi$1 = other[/* hi */0];
      var exit$3 = 0;
      if (other_hi$1 !== -2147483648) {
        exit$3 = 2;
      }
      else if (other[/* lo */1] !== 0) {
        exit$3 = 2;
      }
      else {
        return zero;
      }
      if (exit$3 === 2) {
        if (self_hi < 0) {
          if (other_hi$1 < 0) {
            _other = neg(other);
            _self = neg(self);
            continue ;

          }
          else {
            return neg(div(neg(self), other));
          }
        }
        else if (other_hi$1 < 0) {
          return neg(div(self, neg(other)));
        }
        else {
          var res = zero;
          var rem$1 = self;
          while(ge(rem$1, other)) {
            var approx$1 = Math.max(1, Math.floor(to_float(rem$1) / to_float(other)));
            var log2 = Math.ceil(Math.log(approx$1) / Math.LN2);
            var delta = log2 <= 48 ? 1 : Math.pow(2, log2 - 48);
            var approxRes = of_float(approx$1);
            var approxRem = mul(approxRes, other);
            while(approxRem[/* hi */0] < 0 || gt(approxRem, rem$1)) {
              approx$1 -= delta;
              approxRes = of_float(approx$1);
              approxRem = mul(approxRes, other);
            };
            if (is_zero(approxRes)) {
              approxRes = one;
            }
            res = add(res, approxRes);
            rem$1 = add(rem$1, neg(approxRem));
          };
          return res;
        }
      }

    }

  };
}

function mod_(self, other) {
  var y = mul(div(self, other), other);
  return add(self, neg(y));
}

function div_mod(self, other) {
  var quotient = div(self, other);
  var y = mul(quotient, other);
  return /* tuple */[
          quotient,
          add(self, neg(y))
        ];
}

function compare(self, other) {
  var v = Caml_obj.caml_nativeint_compare(self[/* hi */0], other[/* hi */0]);
  if (v) {
    return v;
  }
  else {
    return Caml_obj.caml_nativeint_compare(self[/* lo */1], other[/* lo */1]);
  }
}

function of_int32(lo) {
  return /* record */[
          /* hi */lo < 0 ? -1 : 0,
          /* lo */(lo >>> 0)
        ];
}

function to_int32(x) {
  return x[/* lo */1] | 0;
}

function to_hex(x) {
  var aux = function (v) {
    return (v >>> 0).toString(16);
  };
  var match = x[/* hi */0];
  var match$1 = x[/* lo */1];
  var exit = 0;
  if (match !== 0) {
    exit = 1;
  }
  else if (match$1 !== 0) {
    exit = 1;
  }
  else {
    return "0";
  }
  if (exit === 1) {
    if (match$1 !== 0) {
      if (match !== 0) {
        var lo = aux(x[/* lo */1]);
        var pad = 8 - lo.length | 0;
        if (pad <= 0) {
          return aux(x[/* hi */0]) + lo;
        }
        else {
          return aux(x[/* hi */0]) + (Caml_utils.repeat(pad, "0") + lo);
        }
      }
      else {
        return aux(x[/* lo */1]);
      }
    }
    else {
      return aux(x[/* hi */0]) + "00000000";
    }
  }

}

function discard_sign(x) {
  return /* record */[
          /* hi */2147483647 & x[/* hi */0],
          /* lo */x[/* lo */1]
        ];
}

function float_of_bits(x) {
  var int32 = new Int32Array(/* array */[
        x[/* lo */1],
        x[/* hi */0]
      ]);
  return new Float64Array(int32.buffer)[0];
}

function bits_of_float(x) {
  var to_nat = function (x) {
    return x;
  };
  var u = new Float64Array(/* float array */[x]);
  var int32 = new Int32Array(u.buffer);
  var hi = to_nat(int32[1]);
  var lo = to_nat(int32[0]);
  return /* record */[
          /* hi */hi,
          /* lo */(lo >>> 0)
        ];
}

function get64(s, i) {
  var hi = (s.charCodeAt(i + 4 | 0) << 32) | (s.charCodeAt(i + 5 | 0) << 40) | (s.charCodeAt(i + 6 | 0) << 48) | (s.charCodeAt(i + 7 | 0) << 56);
  var lo = s.charCodeAt(i) | (s.charCodeAt(i + 1 | 0) << 8) | (s.charCodeAt(i + 2 | 0) << 16) | (s.charCodeAt(i + 3 | 0) << 24);
  return /* record */[
          /* hi */hi,
          /* lo */(lo >>> 0)
        ];
}

exports.min_int       = min_int;
exports.max_int       = max_int;
exports.one           = one;
exports.zero          = zero;
exports.not           = not;
exports.of_int32      = of_int32;
exports.to_int32      = to_int32;
exports.add           = add;
exports.neg           = neg;
exports.sub           = sub;
exports.lsl_          = lsl_;
exports.lsr_          = lsr_;
exports.asr_          = asr_;
exports.is_zero       = is_zero;
exports.mul           = mul;
exports.swap          = swap;
exports.ge            = ge;
exports.eq            = eq;
exports.neq           = neq;
exports.lt            = lt;
exports.gt            = gt;
exports.le            = le;
exports.to_float      = to_float;
exports.of_float      = of_float;
exports.div           = div;
exports.mod_          = mod_;
exports.div_mod       = div_mod;
exports.compare       = compare;
exports.to_hex        = to_hex;
exports.discard_sign  = discard_sign;
exports.float_of_bits = float_of_bits;
exports.bits_of_float = bits_of_float;
exports.get64         = get64;
/* two_ptr_32_dbl Not a pure module */
  })();
});

require.register("bs-platform/lib/js/caml_io.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Curry                   = require("bs-platform/lib/js/curry");

function $caret(prim, prim$1) {
  return prim + prim$1;
}

var stdin = undefined;

var stdout = /* record */[
  /* buffer */"",
  /* output */function (_, s) {
    var v = s.length - 1 | 0;
    if (( (typeof process !== "undefined") && process.stdout && process.stdout.write)) {
      return ( process.stdout.write )(s);
    }
    else if (s[v] === "\n") {
      console.log(s.slice(0, v));
      return /* () */0;
    }
    else {
      console.log(s);
      return /* () */0;
    }
  }
];

var stderr = /* record */[
  /* buffer */"",
  /* output */function (_, s) {
    var v = s.length - 1 | 0;
    if (s[v] === "\n") {
      console.log(s.slice(0, v));
      return /* () */0;
    }
    else {
      console.log(s);
      return /* () */0;
    }
  }
];

function caml_ml_open_descriptor_in() {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_ml_open_descriptor_in not implemented"
      ];
}

function caml_ml_open_descriptor_out() {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_ml_open_descriptor_out not implemented"
      ];
}

function caml_ml_flush(oc) {
  if (oc[/* buffer */0] !== "") {
    Curry._2(oc[/* output */1], oc, oc[/* buffer */0]);
    oc[/* buffer */0] = "";
    return /* () */0;
  }
  else {
    return 0;
  }
}

var node_std_output = (function (s){
   return (typeof process !== "undefined") && process.stdout && (process.stdout.write(s), true);
   }
);

function caml_ml_output(oc, str, offset, len) {
  var str$1 = offset === 0 && len === str.length ? str : str.slice(offset, len);
  if (( (typeof process !== "undefined") && process.stdout && process.stdout.write ) && oc === stdout) {
    return ( process.stdout.write )(str$1);
  }
  else {
    var id = str$1.lastIndexOf("\n");
    if (id < 0) {
      oc[/* buffer */0] = oc[/* buffer */0] + str$1;
      return /* () */0;
    }
    else {
      oc[/* buffer */0] = oc[/* buffer */0] + str$1.slice(0, id + 1 | 0);
      caml_ml_flush(oc);
      oc[/* buffer */0] = oc[/* buffer */0] + str$1.slice(id + 1 | 0);
      return /* () */0;
    }
  }
}

function caml_ml_output_char(oc, $$char) {
  return caml_ml_output(oc, String.fromCharCode($$char), 0, 1);
}

function caml_ml_input(_, _$1, _$2, _$3) {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_ml_input ic not implemented"
      ];
}

function caml_ml_input_char() {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_ml_input_char not implemnted"
      ];
}

function caml_ml_out_channels_list() {
  return /* :: */[
          stdout,
          /* :: */[
            stderr,
            /* [] */0
          ]
        ];
}

exports.$caret                      = $caret;
exports.stdin                       = stdin;
exports.stdout                      = stdout;
exports.stderr                      = stderr;
exports.caml_ml_open_descriptor_in  = caml_ml_open_descriptor_in;
exports.caml_ml_open_descriptor_out = caml_ml_open_descriptor_out;
exports.caml_ml_flush               = caml_ml_flush;
exports.node_std_output             = node_std_output;
exports.caml_ml_output              = caml_ml_output;
exports.caml_ml_output_char         = caml_ml_output_char;
exports.caml_ml_input               = caml_ml_input;
exports.caml_ml_input_char          = caml_ml_input_char;
exports.caml_ml_out_channels_list   = caml_ml_out_channels_list;
/* stdin Not a pure module */
  })();
});

require.register("bs-platform/lib/js/caml_md5.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


function cmn(q, a, b, x, s, t) {
  var a$1 = ((a + q | 0) + x | 0) + t | 0;
  return ((a$1 << s) | (a$1 >>> (32 - s | 0)) | 0) + b | 0;
}

function f(a, b, c, d, x, s, t) {
  return cmn(b & c | (b ^ -1) & d, a, b, x, s, t);
}

function g(a, b, c, d, x, s, t) {
  return cmn(b & d | c & (d ^ -1), a, b, x, s, t);
}

function h(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function i(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | d ^ -1), a, b, x, s, t);
}

function cycle(x, k) {
  var a = x[0];
  var b = x[1];
  var c = x[2];
  var d = x[3];
  a = f(a, b, c, d, k[0], 7, -680876936);
  d = f(d, a, b, c, k[1], 12, -389564586);
  c = f(c, d, a, b, k[2], 17, 606105819);
  b = f(b, c, d, a, k[3], 22, -1044525330);
  a = f(a, b, c, d, k[4], 7, -176418897);
  d = f(d, a, b, c, k[5], 12, 1200080426);
  c = f(c, d, a, b, k[6], 17, -1473231341);
  b = f(b, c, d, a, k[7], 22, -45705983);
  a = f(a, b, c, d, k[8], 7, 1770035416);
  d = f(d, a, b, c, k[9], 12, -1958414417);
  c = f(c, d, a, b, k[10], 17, -42063);
  b = f(b, c, d, a, k[11], 22, -1990404162);
  a = f(a, b, c, d, k[12], 7, 1804603682);
  d = f(d, a, b, c, k[13], 12, -40341101);
  c = f(c, d, a, b, k[14], 17, -1502002290);
  b = f(b, c, d, a, k[15], 22, 1236535329);
  a = g(a, b, c, d, k[1], 5, -165796510);
  d = g(d, a, b, c, k[6], 9, -1069501632);
  c = g(c, d, a, b, k[11], 14, 643717713);
  b = g(b, c, d, a, k[0], 20, -373897302);
  a = g(a, b, c, d, k[5], 5, -701558691);
  d = g(d, a, b, c, k[10], 9, 38016083);
  c = g(c, d, a, b, k[15], 14, -660478335);
  b = g(b, c, d, a, k[4], 20, -405537848);
  a = g(a, b, c, d, k[9], 5, 568446438);
  d = g(d, a, b, c, k[14], 9, -1019803690);
  c = g(c, d, a, b, k[3], 14, -187363961);
  b = g(b, c, d, a, k[8], 20, 1163531501);
  a = g(a, b, c, d, k[13], 5, -1444681467);
  d = g(d, a, b, c, k[2], 9, -51403784);
  c = g(c, d, a, b, k[7], 14, 1735328473);
  b = g(b, c, d, a, k[12], 20, -1926607734);
  a = h(a, b, c, d, k[5], 4, -378558);
  d = h(d, a, b, c, k[8], 11, -2022574463);
  c = h(c, d, a, b, k[11], 16, 1839030562);
  b = h(b, c, d, a, k[14], 23, -35309556);
  a = h(a, b, c, d, k[1], 4, -1530992060);
  d = h(d, a, b, c, k[4], 11, 1272893353);
  c = h(c, d, a, b, k[7], 16, -155497632);
  b = h(b, c, d, a, k[10], 23, -1094730640);
  a = h(a, b, c, d, k[13], 4, 681279174);
  d = h(d, a, b, c, k[0], 11, -358537222);
  c = h(c, d, a, b, k[3], 16, -722521979);
  b = h(b, c, d, a, k[6], 23, 76029189);
  a = h(a, b, c, d, k[9], 4, -640364487);
  d = h(d, a, b, c, k[12], 11, -421815835);
  c = h(c, d, a, b, k[15], 16, 530742520);
  b = h(b, c, d, a, k[2], 23, -995338651);
  a = i(a, b, c, d, k[0], 6, -198630844);
  d = i(d, a, b, c, k[7], 10, 1126891415);
  c = i(c, d, a, b, k[14], 15, -1416354905);
  b = i(b, c, d, a, k[5], 21, -57434055);
  a = i(a, b, c, d, k[12], 6, 1700485571);
  d = i(d, a, b, c, k[3], 10, -1894986606);
  c = i(c, d, a, b, k[10], 15, -1051523);
  b = i(b, c, d, a, k[1], 21, -2054922799);
  a = i(a, b, c, d, k[8], 6, 1873313359);
  d = i(d, a, b, c, k[15], 10, -30611744);
  c = i(c, d, a, b, k[6], 15, -1560198380);
  b = i(b, c, d, a, k[13], 21, 1309151649);
  a = i(a, b, c, d, k[4], 6, -145523070);
  d = i(d, a, b, c, k[11], 10, -1120210379);
  c = i(c, d, a, b, k[2], 15, 718787259);
  b = i(b, c, d, a, k[9], 21, -343485551);
  x[0] = a + x[0] | 0;
  x[1] = b + x[1] | 0;
  x[2] = c + x[2] | 0;
  x[3] = d + x[3] | 0;
  return /* () */0;
}

var state = /* array */[
  1732584193,
  -271733879,
  -1732584194,
  271733878
];

var md5blk = /* array */[
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

function caml_md5_string(s, start, len) {
  var s$1 = s.slice(start, len);
  var n = s$1.length;
  state[0] = 1732584193;
  state[1] = -271733879;
  state[2] = -1732584194;
  state[3] = 271733878;
  for(var i = 0; i <= 15; ++i){
    md5blk[i] = 0;
  }
  var i_end = n / 64 | 0;
  for(var i$1 = 1; i$1 <= i_end; ++i$1){
    for(var j = 0; j <= 15; ++j){
      var k = ((i$1 << 6) - 64 | 0) + (j << 2) | 0;
      md5blk[j] = ((s$1.charCodeAt(k) + (s$1.charCodeAt(k + 1 | 0) << 8) | 0) + (s$1.charCodeAt(k + 2 | 0) << 16) | 0) + (s$1.charCodeAt(k + 3 | 0) << 24) | 0;
    }
    cycle(state, md5blk);
  }
  var s_tail = s$1.slice((i_end << 6));
  for(var kk = 0; kk <= 15; ++kk){
    md5blk[kk] = 0;
  }
  var i_end$1 = s_tail.length - 1 | 0;
  for(var i$2 = 0; i$2 <= i_end$1; ++i$2){
    md5blk[i$2 / 4 | 0] = md5blk[i$2 / 4 | 0] | (s_tail.charCodeAt(i$2) << (i$2 % 4 << 3));
  }
  var i$3 = i_end$1 + 1 | 0;
  md5blk[i$3 / 4 | 0] = md5blk[i$3 / 4 | 0] | (128 << (i$3 % 4 << 3));
  if (i$3 > 55) {
    cycle(state, md5blk);
    for(var i$4 = 0; i$4 <= 15; ++i$4){
      md5blk[i$4] = 0;
    }
  }
  md5blk[14] = (n << 3);
  cycle(state, md5blk);
  return String.fromCharCode(state[0] & 255, (state[0] >> 8) & 255, (state[0] >> 16) & 255, (state[0] >> 24) & 255, state[1] & 255, (state[1] >> 8) & 255, (state[1] >> 16) & 255, (state[1] >> 24) & 255, state[2] & 255, (state[2] >> 8) & 255, (state[2] >> 16) & 255, (state[2] >> 24) & 255, state[3] & 255, (state[3] >> 8) & 255, (state[3] >> 16) & 255, (state[3] >> 24) & 255);
}

exports.caml_md5_string = caml_md5_string;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_obj.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Block                   = require("bs-platform/lib/js/block");

function caml_obj_dup(x) {
  var len = x.length;
  var v = {
    length: len,
    tag: x.tag | 0
  };
  for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
    v[i] = x[i];
  }
  return v;
}

function caml_obj_truncate(x, new_size) {
  var len = x.length;
  if (new_size <= 0 || new_size > len) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Obj.truncate"
        ];
  }
  else if (len !== new_size) {
    for(var i = new_size ,i_finish = len - 1 | 0; i <= i_finish; ++i){
      x[i] = 0;
    }
    x.length = new_size;
    return /* () */0;
  }
  else {
    return 0;
  }
}

function caml_lazy_make_forward(x) {
  return Block.__(250, [x]);
}

function caml_update_dummy(x, y) {
  var len = y.length;
  for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
    x[i] = y[i];
  }
  x.tag = y.tag | 0;
  x.length = y.length;
  return /* () */0;
}

function caml_int_compare(x, y) {
  if (x < y) {
    return -1;
  }
  else if (x === y) {
    return 0;
  }
  else {
    return 1;
  }
}

function caml_compare(_a, _b) {
  while(true) {
    var b = _b;
    var a = _a;
    if (typeof a === "string") {
      var x = a;
      var y = b;
      if (x < y) {
        return -1;
      }
      else if (x === y) {
        return 0;
      }
      else {
        return 1;
      }
    }
    else if (typeof a === "number") {
      return caml_int_compare(a, b);
    }
    else if (typeof a === "boolean" || typeof a === "null" || typeof a === "undefined") {
      var x$1 = a;
      var y$1 = b;
      if (x$1 === y$1) {
        return 0;
      }
      else if (x$1 < y$1) {
        return -1;
      }
      else {
        return 1;
      }
    }
    else {
      var tag_a = a.tag | 0;
      var tag_b = b.tag | 0;
      if (tag_a === 250) {
        _a = a[0];
        continue ;

      }
      else if (tag_b === 250) {
        _b = b[0];
        continue ;

      }
      else if (tag_a === 248) {
        return caml_int_compare(a[1], b[1]);
      }
      else if (tag_a === 251) {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "equal: abstract value"
            ];
      }
      else if (tag_a !== tag_b) {
        if (tag_a < tag_b) {
          return -1;
        }
        else {
          return 1;
        }
      }
      else {
        var len_a = a.length;
        var len_b = b.length;
        if (len_a === len_b) {
          var a$1 = a;
          var b$1 = b;
          var _i = 0;
          var same_length = len_a;
          while(true) {
            var i = _i;
            if (i === same_length) {
              return 0;
            }
            else {
              var res = caml_compare(a$1[i], b$1[i]);
              if (res !== 0) {
                return res;
              }
              else {
                _i = i + 1 | 0;
                continue ;

              }
            }
          };
        }
        else if (len_a < len_b) {
          var a$2 = a;
          var b$2 = b;
          var _i$1 = 0;
          var short_length = len_a;
          while(true) {
            var i$1 = _i$1;
            if (i$1 === short_length) {
              return -1;
            }
            else {
              var res$1 = caml_compare(a$2[i$1], b$2[i$1]);
              if (res$1 !== 0) {
                return res$1;
              }
              else {
                _i$1 = i$1 + 1 | 0;
                continue ;

              }
            }
          };
        }
        else {
          var a$3 = a;
          var b$3 = b;
          var _i$2 = 0;
          var short_length$1 = len_b;
          while(true) {
            var i$2 = _i$2;
            if (i$2 === short_length$1) {
              return 1;
            }
            else {
              var res$2 = caml_compare(a$3[i$2], b$3[i$2]);
              if (res$2 !== 0) {
                return res$2;
              }
              else {
                _i$2 = i$2 + 1 | 0;
                continue ;

              }
            }
          };
        }
      }
    }
  };
}

function caml_equal(_a, _b) {
  while(true) {
    var b = _b;
    var a = _a;
    if (typeof a === "string" || typeof a === "number" || typeof a === "boolean" || typeof a === "undefined" || typeof a === "null") {
      return +(a === b);
    }
    else {
      var tag_a = a.tag | 0;
      var tag_b = b.tag | 0;
      if (tag_a === 250) {
        _a = a[0];
        continue ;

      }
      else if (tag_b === 250) {
        _b = b[0];
        continue ;

      }
      else if (tag_a === 248) {
        return +(a[1] === b[1]);
      }
      else if (tag_a === 251) {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "equal: abstract value"
            ];
      }
      else if (tag_a !== tag_b) {
        return /* false */0;
      }
      else {
        var len_a = a.length;
        var len_b = b.length;
        if (len_a === len_b) {
          var a$1 = a;
          var b$1 = b;
          var _i = 0;
          var same_length = len_a;
          while(true) {
            var i = _i;
            if (i === same_length) {
              return /* true */1;
            }
            else if (caml_equal(a$1[i], b$1[i])) {
              _i = i + 1 | 0;
              continue ;

            }
            else {
              return /* false */0;
            }
          };
        }
        else {
          return /* false */0;
        }
      }
    }
  };
}

function caml_notequal(a, b) {
  return !caml_equal(a, b);
}

function caml_greaterequal(a, b) {
  return +(caml_compare(a, b) >= 0);
}

function caml_greaterthan(a, b) {
  return +(caml_compare(a, b) > 0);
}

function caml_lessequal(a, b) {
  return +(caml_compare(a, b) <= 0);
}

function caml_lessthan(a, b) {
  return +(caml_compare(a, b) < 0);
}

var caml_int32_compare = caml_int_compare;

var caml_nativeint_compare = caml_int_compare;

exports.caml_obj_dup           = caml_obj_dup;
exports.caml_obj_truncate      = caml_obj_truncate;
exports.caml_lazy_make_forward = caml_lazy_make_forward;
exports.caml_update_dummy      = caml_update_dummy;
exports.caml_int_compare       = caml_int_compare;
exports.caml_int32_compare     = caml_int32_compare;
exports.caml_nativeint_compare = caml_nativeint_compare;
exports.caml_compare           = caml_compare;
exports.caml_equal             = caml_equal;
exports.caml_notequal          = caml_notequal;
exports.caml_greaterequal      = caml_greaterequal;
exports.caml_greaterthan       = caml_greaterthan;
exports.caml_lessthan          = caml_lessthan;
exports.caml_lessequal         = caml_lessequal;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_oo.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_array              = require("bs-platform/lib/js/caml_array");

var caml_methods_cache = Caml_array.caml_make_vect(1000, 0);

function caml_get_public_method(obj, tag, cacheid) {
  var meths = obj[0];
  var offs = caml_methods_cache[cacheid];
  if (meths[offs] === tag) {
    return meths[offs - 1 | 0];
  }
  else {
    var aux = function (_i) {
      while(true) {
        var i = _i;
        if (i < 3) {
          throw [
                Caml_builtin_exceptions.assert_failure,
                [
                  "caml_oo.ml",
                  54,
                  20
                ]
              ];
        }
        else if (meths[i] === tag) {
          caml_methods_cache[cacheid] = i;
          return i;
        }
        else {
          _i = i - 2 | 0;
          continue ;

        }
      };
    };
    return meths[aux((meths[0] << 1) + 1 | 0) - 1 | 0];
  }
}

exports.caml_get_public_method = caml_get_public_method;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_string.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");

function js_string_of_char(prim) {
  return String.fromCharCode(prim);
}

function caml_string_get(s, i) {
  if (i >= s.length || i < 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "index out of bounds"
        ];
  }
  else {
    return s.charCodeAt(i);
  }
}

function caml_create_string(len) {
  if (len < 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "String.create"
        ];
  }
  else {
    return new Array(len);
  }
}

function caml_string_compare(s1, s2) {
  if (s1 === s2) {
    return 0;
  }
  else if (s1 < s2) {
    return -1;
  }
  else {
    return 1;
  }
}

function caml_fill_string(s, i, l, c) {
  if (l > 0) {
    for(var k = i ,k_finish = (l + i | 0) - 1 | 0; k <= k_finish; ++k){
      s[k] = c;
    }
    return /* () */0;
  }
  else {
    return 0;
  }
}

function caml_blit_string(s1, i1, s2, i2, len) {
  if (len > 0) {
    var off1 = s1.length - i1 | 0;
    if (len <= off1) {
      for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
        s2[i2 + i | 0] = s1.charCodeAt(i1 + i | 0);
      }
      return /* () */0;
    }
    else {
      for(var i$1 = 0 ,i_finish$1 = off1 - 1 | 0; i$1 <= i_finish$1; ++i$1){
        s2[i2 + i$1 | 0] = s1.charCodeAt(i1 + i$1 | 0);
      }
      for(var i$2 = off1 ,i_finish$2 = len - 1 | 0; i$2 <= i_finish$2; ++i$2){
        s2[i2 + i$2 | 0] = /* "\000" */0;
      }
      return /* () */0;
    }
  }
  else {
    return 0;
  }
}

function caml_blit_bytes(s1, i1, s2, i2, len) {
  if (len > 0) {
    if (s1 === s2) {
      var s1$1 = s1;
      var i1$1 = i1;
      var i2$1 = i2;
      var len$1 = len;
      if (i1$1 < i2$1) {
        var range_a = (s1$1.length - i2$1 | 0) - 1 | 0;
        var range_b = len$1 - 1 | 0;
        var range = range_a > range_b ? range_b : range_a;
        for(var j = range; j >= 0; --j){
          s1$1[i2$1 + j | 0] = s1$1[i1$1 + j | 0];
        }
        return /* () */0;
      }
      else if (i1$1 > i2$1) {
        var range_a$1 = (s1$1.length - i1$1 | 0) - 1 | 0;
        var range_b$1 = len$1 - 1 | 0;
        var range$1 = range_a$1 > range_b$1 ? range_b$1 : range_a$1;
        for(var k = 0; k <= range$1; ++k){
          s1$1[i2$1 + k | 0] = s1$1[i1$1 + k | 0];
        }
        return /* () */0;
      }
      else {
        return 0;
      }
    }
    else {
      var off1 = s1.length - i1 | 0;
      if (len <= off1) {
        for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
          s2[i2 + i | 0] = s1[i1 + i | 0];
        }
        return /* () */0;
      }
      else {
        for(var i$1 = 0 ,i_finish$1 = off1 - 1 | 0; i$1 <= i_finish$1; ++i$1){
          s2[i2 + i$1 | 0] = s1[i1 + i$1 | 0];
        }
        for(var i$2 = off1 ,i_finish$2 = len - 1 | 0; i$2 <= i_finish$2; ++i$2){
          s2[i2 + i$2 | 0] = /* "\000" */0;
        }
        return /* () */0;
      }
    }
  }
  else {
    return 0;
  }
}

function bytes_of_string(s) {
  var len = s.length;
  var res = new Array(len);
  for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
    res[i] = s.charCodeAt(i);
  }
  return res;
}

function bytes_to_string(a) {
  var bytes = a;
  var i = 0;
  var len = a.length;
  var s = "";
  var s_len = len;
  if (i === 0 && len <= 4096 && len === bytes.length) {
    return String.fromCharCode.apply(null,bytes);
  }
  else {
    var offset = 0;
    while(s_len > 0) {
      var next = s_len < 1024 ? s_len : 1024;
      var tmp_bytes = new Array(next);
      caml_blit_bytes(bytes, offset, tmp_bytes, 0, next);
      s = s + String.fromCharCode.apply(null,tmp_bytes);
      s_len = s_len - next | 0;
      offset = offset + next | 0;
    };
    return s;
  }
}

function caml_string_of_char_array(chars) {
  var len = chars.length;
  var bytes = new Array(len);
  for(var i = 0 ,i_finish = len - 1 | 0; i <= i_finish; ++i){
    bytes[i] = chars[i];
  }
  return bytes_to_string(bytes);
}

function caml_is_printable(c) {
  if (c > 31) {
    return +(c < 127);
  }
  else {
    return /* false */0;
  }
}

function caml_string_get16(s, i) {
  return s.charCodeAt(i) + (s.charCodeAt(i + 1 | 0) << 8) | 0;
}

function caml_string_get32(s, i) {
  return ((s.charCodeAt(i) + (s.charCodeAt(i + 1 | 0) << 8) | 0) + (s.charCodeAt(i + 2 | 0) << 16) | 0) + (s.charCodeAt(i + 3 | 0) << 24) | 0;
}

function get(s, i) {
  if (i < 0 || i >= s.length) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "index out of bounds"
        ];
  }
  else {
    return s.charCodeAt(i);
  }
}

exports.bytes_of_string           = bytes_of_string;
exports.bytes_to_string           = bytes_to_string;
exports.caml_is_printable         = caml_is_printable;
exports.caml_string_of_char_array = caml_string_of_char_array;
exports.caml_string_get           = caml_string_get;
exports.caml_string_compare       = caml_string_compare;
exports.caml_create_string        = caml_create_string;
exports.caml_fill_string          = caml_fill_string;
exports.caml_blit_string          = caml_blit_string;
exports.caml_blit_bytes           = caml_blit_bytes;
exports.caml_string_get16         = caml_string_get16;
exports.caml_string_get32         = caml_string_get32;
exports.js_string_of_char         = js_string_of_char;
exports.get                       = get;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/caml_sys.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");

function caml_raise_not_found() {
  throw Caml_builtin_exceptions.not_found;
}


function $$caml_sys_getenv(n) {
    //nodejs env
    if (typeof process !== 'undefined'
        && process.env
        && process.env[n] != undefined){
        return process.env[n]
    }
    else{
     caml_raise_not_found()
    };
  }

;


function $$date(){
  return (+new Date())
};


;

var caml_initial_time = $$date() * 0.001;

function caml_sys_time() {
  return ($$date() - caml_initial_time) * 0.001;
}

function caml_sys_random_seed() {
  return /* array */[(($$date() | 0) ^ 4294967295) * Math.random() | 0];
}

function caml_sys_system_command() {
  return 127;
}

function caml_sys_getcwd() {
  return "/";
}

function caml_sys_is_directory() {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_sys_is_directory not implemented"
      ];
}

function caml_sys_file_exists() {
  throw [
        Caml_builtin_exceptions.failure,
        "caml_sys_file_exists not implemented"
      ];
}

function caml_sys_getenv(prim) {
  return $$caml_sys_getenv(prim);
}

exports.caml_raise_not_found    = caml_raise_not_found;
exports.caml_sys_getenv         = caml_sys_getenv;
exports.caml_sys_time           = caml_sys_time;
exports.caml_sys_random_seed    = caml_sys_random_seed;
exports.caml_sys_system_command = caml_sys_system_command;
exports.caml_sys_getcwd         = caml_sys_getcwd;
exports.caml_sys_is_directory   = caml_sys_is_directory;
exports.caml_sys_file_exists    = caml_sys_file_exists;
/*  Not a pure module */
  })();
});

require.register("bs-platform/lib/js/caml_utils.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


var repeat = ( (String.prototype.repeat && function (count,self){return self.repeat(count)}) ||
                                                  function(count , self) {
        if (self.length == 0 || count == 0) {
            return '';
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        if (self.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (;;) {
            if ((count & 1) == 1) {
                rpt += self;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            self += self;
        }
        return rpt;
    }
);

exports.repeat = repeat;
/* repeat Not a pure module */
  })();
});

require.register("bs-platform/lib/js/camlinternalFormatBasics.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Block = require("bs-platform/lib/js/block");

function erase_rel(param) {
  if (typeof param === "number") {
    return /* End_of_fmtty */0;
  }
  else {
    switch (param.tag | 0) {
      case 0 :
          return /* Char_ty */Block.__(0, [erase_rel(param[0])]);
      case 1 :
          return /* String_ty */Block.__(1, [erase_rel(param[0])]);
      case 2 :
          return /* Int_ty */Block.__(2, [erase_rel(param[0])]);
      case 3 :
          return /* Int32_ty */Block.__(3, [erase_rel(param[0])]);
      case 4 :
          return /* Nativeint_ty */Block.__(4, [erase_rel(param[0])]);
      case 5 :
          return /* Int64_ty */Block.__(5, [erase_rel(param[0])]);
      case 6 :
          return /* Float_ty */Block.__(6, [erase_rel(param[0])]);
      case 7 :
          return /* Bool_ty */Block.__(7, [erase_rel(param[0])]);
      case 8 :
          return /* Format_arg_ty */Block.__(8, [
                    param[0],
                    erase_rel(param[1])
                  ]);
      case 9 :
          var ty1 = param[0];
          return /* Format_subst_ty */Block.__(9, [
                    ty1,
                    ty1,
                    erase_rel(param[2])
                  ]);
      case 10 :
          return /* Alpha_ty */Block.__(10, [erase_rel(param[0])]);
      case 11 :
          return /* Theta_ty */Block.__(11, [erase_rel(param[0])]);
      case 12 :
          return /* Any_ty */Block.__(12, [erase_rel(param[0])]);
      case 13 :
          return /* Reader_ty */Block.__(13, [erase_rel(param[0])]);
      case 14 :
          return /* Ignored_reader_ty */Block.__(14, [erase_rel(param[0])]);

    }
  }
}

function concat_fmtty(fmtty1, fmtty2) {
  if (typeof fmtty1 === "number") {
    return fmtty2;
  }
  else {
    switch (fmtty1.tag | 0) {
      case 0 :
          return /* Char_ty */Block.__(0, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 1 :
          return /* String_ty */Block.__(1, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 2 :
          return /* Int_ty */Block.__(2, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 3 :
          return /* Int32_ty */Block.__(3, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 4 :
          return /* Nativeint_ty */Block.__(4, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 5 :
          return /* Int64_ty */Block.__(5, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 6 :
          return /* Float_ty */Block.__(6, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 7 :
          return /* Bool_ty */Block.__(7, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 8 :
          return /* Format_arg_ty */Block.__(8, [
                    fmtty1[0],
                    concat_fmtty(fmtty1[1], fmtty2)
                  ]);
      case 9 :
          return /* Format_subst_ty */Block.__(9, [
                    fmtty1[0],
                    fmtty1[1],
                    concat_fmtty(fmtty1[2], fmtty2)
                  ]);
      case 10 :
          return /* Alpha_ty */Block.__(10, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 11 :
          return /* Theta_ty */Block.__(11, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 12 :
          return /* Any_ty */Block.__(12, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 13 :
          return /* Reader_ty */Block.__(13, [concat_fmtty(fmtty1[0], fmtty2)]);
      case 14 :
          return /* Ignored_reader_ty */Block.__(14, [concat_fmtty(fmtty1[0], fmtty2)]);

    }
  }
}

function concat_fmt(fmt1, fmt2) {
  if (typeof fmt1 === "number") {
    return fmt2;
  }
  else {
    switch (fmt1.tag | 0) {
      case 0 :
          return /* Char */Block.__(0, [concat_fmt(fmt1[0], fmt2)]);
      case 1 :
          return /* Caml_char */Block.__(1, [concat_fmt(fmt1[0], fmt2)]);
      case 2 :
          return /* String */Block.__(2, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 3 :
          return /* Caml_string */Block.__(3, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 4 :
          return /* Int */Block.__(4, [
                    fmt1[0],
                    fmt1[1],
                    fmt1[2],
                    concat_fmt(fmt1[3], fmt2)
                  ]);
      case 5 :
          return /* Int32 */Block.__(5, [
                    fmt1[0],
                    fmt1[1],
                    fmt1[2],
                    concat_fmt(fmt1[3], fmt2)
                  ]);
      case 6 :
          return /* Nativeint */Block.__(6, [
                    fmt1[0],
                    fmt1[1],
                    fmt1[2],
                    concat_fmt(fmt1[3], fmt2)
                  ]);
      case 7 :
          return /* Int64 */Block.__(7, [
                    fmt1[0],
                    fmt1[1],
                    fmt1[2],
                    concat_fmt(fmt1[3], fmt2)
                  ]);
      case 8 :
          return /* Float */Block.__(8, [
                    fmt1[0],
                    fmt1[1],
                    fmt1[2],
                    concat_fmt(fmt1[3], fmt2)
                  ]);
      case 9 :
          return /* Bool */Block.__(9, [concat_fmt(fmt1[0], fmt2)]);
      case 10 :
          return /* Flush */Block.__(10, [concat_fmt(fmt1[0], fmt2)]);
      case 11 :
          return /* String_literal */Block.__(11, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 12 :
          return /* Char_literal */Block.__(12, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 13 :
          return /* Format_arg */Block.__(13, [
                    fmt1[0],
                    fmt1[1],
                    concat_fmt(fmt1[2], fmt2)
                  ]);
      case 14 :
          return /* Format_subst */Block.__(14, [
                    fmt1[0],
                    fmt1[1],
                    concat_fmt(fmt1[2], fmt2)
                  ]);
      case 15 :
          return /* Alpha */Block.__(15, [concat_fmt(fmt1[0], fmt2)]);
      case 16 :
          return /* Theta */Block.__(16, [concat_fmt(fmt1[0], fmt2)]);
      case 17 :
          return /* Formatting_lit */Block.__(17, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 18 :
          return /* Formatting_gen */Block.__(18, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 19 :
          return /* Reader */Block.__(19, [concat_fmt(fmt1[0], fmt2)]);
      case 20 :
          return /* Scan_char_set */Block.__(20, [
                    fmt1[0],
                    fmt1[1],
                    concat_fmt(fmt1[2], fmt2)
                  ]);
      case 21 :
          return /* Scan_get_counter */Block.__(21, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 22 :
          return /* Scan_next_char */Block.__(22, [concat_fmt(fmt1[0], fmt2)]);
      case 23 :
          return /* Ignored_param */Block.__(23, [
                    fmt1[0],
                    concat_fmt(fmt1[1], fmt2)
                  ]);
      case 24 :
          return /* Custom */Block.__(24, [
                    fmt1[0],
                    fmt1[1],
                    concat_fmt(fmt1[2], fmt2)
                  ]);

    }
  }
}

exports.concat_fmtty = concat_fmtty;
exports.erase_rel    = erase_rel;
exports.concat_fmt   = concat_fmt;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/char.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_string             = require("bs-platform/lib/js/caml_string");

function chr(n) {
  if (n < 0 || n > 255) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Char.chr"
        ];
  }
  else {
    return n;
  }
}

function escaped(c) {
  var exit = 0;
  if (c >= 40) {
    if (c !== 92) {
      exit = c >= 127 ? 1 : 2;
    }
    else {
      return "\\\\";
    }
  }
  else if (c >= 32) {
    if (c >= 39) {
      return "\\'";
    }
    else {
      exit = 2;
    }
  }
  else if (c >= 14) {
    exit = 1;
  }
  else {
    switch (c) {
      case 8 :
          return "\\b";
      case 9 :
          return "\\t";
      case 10 :
          return "\\n";
      case 0 :
      case 1 :
      case 2 :
      case 3 :
      case 4 :
      case 5 :
      case 6 :
      case 7 :
      case 11 :
      case 12 :
          exit = 1;
          break;
      case 13 :
          return "\\r";

    }
  }
  switch (exit) {
    case 1 :
        var s = new Array(4);
        s[0] = /* "\\" */92;
        s[1] = 48 + (c / 100 | 0) | 0;
        s[2] = 48 + (c / 10 | 0) % 10 | 0;
        s[3] = 48 + c % 10 | 0;
        return Caml_string.bytes_to_string(s);
    case 2 :
        var s$1 = new Array(1);
        s$1[0] = c;
        return Caml_string.bytes_to_string(s$1);

  }
}

function lowercase(c) {
  if (c >= /* "A" */65 && c <= /* "Z" */90 || c >= /* "\192" */192 && c <= /* "\214" */214 || c >= /* "\216" */216 && c <= /* "\222" */222) {
    return c + 32 | 0;
  }
  else {
    return c;
  }
}

function uppercase(c) {
  if (c >= /* "a" */97 && c <= /* "z" */122 || c >= /* "\224" */224 && c <= /* "\246" */246 || c >= /* "\248" */248 && c <= /* "\254" */254) {
    return c - 32 | 0;
  }
  else {
    return c;
  }
}

function compare(c1, c2) {
  return c1 - c2 | 0;
}

exports.chr       = chr;
exports.escaped   = escaped;
exports.lowercase = lowercase;
exports.uppercase = uppercase;
exports.compare   = compare;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/curry.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_oo    = require("bs-platform/lib/js/caml_oo");
var Caml_array = require("bs-platform/lib/js/caml_array");

function app(_f, _args) {
  while(true) {
    var args = _args;
    var f = _f;
    var arity = f.length;
    var arity$1 = arity ? arity : 1;
    var len = args.length;
    var d = arity$1 - len | 0;
    if (d) {
      if (d < 0) {
        _args = Caml_array.caml_array_sub(args, arity$1, -d);
        _f = f.apply(null, Caml_array.caml_array_sub(args, 0, arity$1));
        continue ;

      }
      else {
        return (function(f,args){
        return function (x) {
          return app(f, args.concat(/* array */[x]));
        }
        }(f,args));
      }
    }
    else {
      return f.apply(null, args);
    }
  };
}

function js(label, cacheid, obj, args) {
  var meth = Caml_oo.caml_get_public_method(obj, label, cacheid);
  return app(meth, args);
}

function curry_1(o, a0, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[a0]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return o(a0);
      case 2 :
          return function (param) {
            return o(a0, param);
          };
      case 3 :
          return function (param, param$1) {
            return o(a0, param, param$1);
          };
      case 4 :
          return function (param, param$1, param$2) {
            return o(a0, param, param$1, param$2);
          };
      case 5 :
          return function (param, param$1, param$2, param$3) {
            return o(a0, param, param$1, param$2, param$3);
          };
      case 6 :
          return function (param, param$1, param$2, param$3, param$4) {
            return o(a0, param, param$1, param$2, param$3, param$4);
          };
      case 7 :
          return function (param, param$1, param$2, param$3, param$4, param$5) {
            return o(a0, param, param$1, param$2, param$3, param$4, param$5);
          };

    }
  }
}

function _1(o, a0) {
  var arity = o.length;
  if (arity === 1) {
    return o(a0);
  }
  else {
    return curry_1(o, a0, arity);
  }
}

function js1(label, cacheid, a0) {
  return _1(Caml_oo.caml_get_public_method(a0, label, cacheid), a0);
}

function __1(o) {
  var arity = o.length;
  if (arity === 1) {
    return o;
  }
  else {
    return function (a0) {
      return _1(o, a0);
    };
  }
}

function curry_2(o, a0, a1, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[a1]);
      case 2 :
          return o(a0, a1);
      case 3 :
          return function (param) {
            return o(a0, a1, param);
          };
      case 4 :
          return function (param, param$1) {
            return o(a0, a1, param, param$1);
          };
      case 5 :
          return function (param, param$1, param$2) {
            return o(a0, a1, param, param$1, param$2);
          };
      case 6 :
          return function (param, param$1, param$2, param$3) {
            return o(a0, a1, param, param$1, param$2, param$3);
          };
      case 7 :
          return function (param, param$1, param$2, param$3, param$4) {
            return o(a0, a1, param, param$1, param$2, param$3, param$4);
          };

    }
  }
}

function _2(o, a0, a1) {
  var arity = o.length;
  if (arity === 2) {
    return o(a0, a1);
  }
  else {
    return curry_2(o, a0, a1, arity);
  }
}

function js2(label, cacheid, a0, a1) {
  return _2(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1);
}

function __2(o) {
  var arity = o.length;
  if (arity === 2) {
    return o;
  }
  else {
    return function (a0, a1) {
      return _2(o, a0, a1);
    };
  }
}

function curry_3(o, a0, a1, a2, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[a2]);
      case 3 :
          return o(a0, a1, a2);
      case 4 :
          return function (param) {
            return o(a0, a1, a2, param);
          };
      case 5 :
          return function (param, param$1) {
            return o(a0, a1, a2, param, param$1);
          };
      case 6 :
          return function (param, param$1, param$2) {
            return o(a0, a1, a2, param, param$1, param$2);
          };
      case 7 :
          return function (param, param$1, param$2, param$3) {
            return o(a0, a1, a2, param, param$1, param$2, param$3);
          };

    }
  }
}

function _3(o, a0, a1, a2) {
  var arity = o.length;
  if (arity === 3) {
    return o(a0, a1, a2);
  }
  else {
    return curry_3(o, a0, a1, a2, arity);
  }
}

function js3(label, cacheid, a0, a1, a2) {
  return _3(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2);
}

function __3(o) {
  var arity = o.length;
  if (arity === 3) {
    return o;
  }
  else {
    return function (a0, a1, a2) {
      return _3(o, a0, a1, a2);
    };
  }
}

function curry_4(o, a0, a1, a2, a3, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2,
                a3
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2,
                      a3
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[
                      a2,
                      a3
                    ]);
      case 3 :
          return app(o(a0, a1, a2), /* array */[a3]);
      case 4 :
          return o(a0, a1, a2, a3);
      case 5 :
          return function (param) {
            return o(a0, a1, a2, a3, param);
          };
      case 6 :
          return function (param, param$1) {
            return o(a0, a1, a2, a3, param, param$1);
          };
      case 7 :
          return function (param, param$1, param$2) {
            return o(a0, a1, a2, a3, param, param$1, param$2);
          };

    }
  }
}

function _4(o, a0, a1, a2, a3) {
  var arity = o.length;
  if (arity === 4) {
    return o(a0, a1, a2, a3);
  }
  else {
    return curry_4(o, a0, a1, a2, a3, arity);
  }
}

function js4(label, cacheid, a0, a1, a2, a3) {
  return _4(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2, a3);
}

function __4(o) {
  var arity = o.length;
  if (arity === 4) {
    return o;
  }
  else {
    return function (a0, a1, a2, a3) {
      return _4(o, a0, a1, a2, a3);
    };
  }
}

function curry_5(o, a0, a1, a2, a3, a4, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2,
                a3,
                a4
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2,
                      a3,
                      a4
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[
                      a2,
                      a3,
                      a4
                    ]);
      case 3 :
          return app(o(a0, a1, a2), /* array */[
                      a3,
                      a4
                    ]);
      case 4 :
          return app(o(a0, a1, a2, a3), /* array */[a4]);
      case 5 :
          return o(a0, a1, a2, a3, a4);
      case 6 :
          return function (param) {
            return o(a0, a1, a2, a3, a4, param);
          };
      case 7 :
          return function (param, param$1) {
            return o(a0, a1, a2, a3, a4, param, param$1);
          };

    }
  }
}

function _5(o, a0, a1, a2, a3, a4) {
  var arity = o.length;
  if (arity === 5) {
    return o(a0, a1, a2, a3, a4);
  }
  else {
    return curry_5(o, a0, a1, a2, a3, a4, arity);
  }
}

function js5(label, cacheid, a0, a1, a2, a3, a4) {
  return _5(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2, a3, a4);
}

function __5(o) {
  var arity = o.length;
  if (arity === 5) {
    return o;
  }
  else {
    return function (a0, a1, a2, a3, a4) {
      return _5(o, a0, a1, a2, a3, a4);
    };
  }
}

function curry_6(o, a0, a1, a2, a3, a4, a5, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2,
                a3,
                a4,
                a5
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2,
                      a3,
                      a4,
                      a5
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[
                      a2,
                      a3,
                      a4,
                      a5
                    ]);
      case 3 :
          return app(o(a0, a1, a2), /* array */[
                      a3,
                      a4,
                      a5
                    ]);
      case 4 :
          return app(o(a0, a1, a2, a3), /* array */[
                      a4,
                      a5
                    ]);
      case 5 :
          return app(o(a0, a1, a2, a3, a4), /* array */[a5]);
      case 6 :
          return o(a0, a1, a2, a3, a4, a5);
      case 7 :
          return function (param) {
            return o(a0, a1, a2, a3, a4, a5, param);
          };

    }
  }
}

function _6(o, a0, a1, a2, a3, a4, a5) {
  var arity = o.length;
  if (arity === 6) {
    return o(a0, a1, a2, a3, a4, a5);
  }
  else {
    return curry_6(o, a0, a1, a2, a3, a4, a5, arity);
  }
}

function js6(label, cacheid, a0, a1, a2, a3, a4, a5) {
  return _6(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2, a3, a4, a5);
}

function __6(o) {
  var arity = o.length;
  if (arity === 6) {
    return o;
  }
  else {
    return function (a0, a1, a2, a3, a4, a5) {
      return _6(o, a0, a1, a2, a3, a4, a5);
    };
  }
}

function curry_7(o, a0, a1, a2, a3, a4, a5, a6, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2,
                a3,
                a4,
                a5,
                a6
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2,
                      a3,
                      a4,
                      a5,
                      a6
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[
                      a2,
                      a3,
                      a4,
                      a5,
                      a6
                    ]);
      case 3 :
          return app(o(a0, a1, a2), /* array */[
                      a3,
                      a4,
                      a5,
                      a6
                    ]);
      case 4 :
          return app(o(a0, a1, a2, a3), /* array */[
                      a4,
                      a5,
                      a6
                    ]);
      case 5 :
          return app(o(a0, a1, a2, a3, a4), /* array */[
                      a5,
                      a6
                    ]);
      case 6 :
          return app(o(a0, a1, a2, a3, a4, a5), /* array */[a6]);
      case 7 :
          return o(a0, a1, a2, a3, a4, a5, a6);

    }
  }
}

function _7(o, a0, a1, a2, a3, a4, a5, a6) {
  var arity = o.length;
  if (arity === 7) {
    return o(a0, a1, a2, a3, a4, a5, a6);
  }
  else {
    return curry_7(o, a0, a1, a2, a3, a4, a5, a6, arity);
  }
}

function js7(label, cacheid, a0, a1, a2, a3, a4, a5, a6) {
  return _7(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2, a3, a4, a5, a6);
}

function __7(o) {
  var arity = o.length;
  if (arity === 7) {
    return o;
  }
  else {
    return function (a0, a1, a2, a3, a4, a5, a6) {
      return _7(o, a0, a1, a2, a3, a4, a5, a6);
    };
  }
}

function curry_8(o, a0, a1, a2, a3, a4, a5, a6, a7, arity) {
  if (arity > 7 || arity < 0) {
    return app(o, /* array */[
                a0,
                a1,
                a2,
                a3,
                a4,
                a5,
                a6,
                a7
              ]);
  }
  else {
    switch (arity) {
      case 0 :
      case 1 :
          return app(o(a0), /* array */[
                      a1,
                      a2,
                      a3,
                      a4,
                      a5,
                      a6,
                      a7
                    ]);
      case 2 :
          return app(o(a0, a1), /* array */[
                      a2,
                      a3,
                      a4,
                      a5,
                      a6,
                      a7
                    ]);
      case 3 :
          return app(o(a0, a1, a2), /* array */[
                      a3,
                      a4,
                      a5,
                      a6,
                      a7
                    ]);
      case 4 :
          return app(o(a0, a1, a2, a3), /* array */[
                      a4,
                      a5,
                      a6,
                      a7
                    ]);
      case 5 :
          return app(o(a0, a1, a2, a3, a4), /* array */[
                      a5,
                      a6,
                      a7
                    ]);
      case 6 :
          return app(o(a0, a1, a2, a3, a4, a5), /* array */[
                      a6,
                      a7
                    ]);
      case 7 :
          return app(o(a0, a1, a2, a3, a4, a5, a6), /* array */[a7]);

    }
  }
}

function _8(o, a0, a1, a2, a3, a4, a5, a6, a7) {
  var arity = o.length;
  if (arity === 8) {
    return o(a0, a1, a2, a3, a4, a5, a6, a7);
  }
  else {
    return curry_8(o, a0, a1, a2, a3, a4, a5, a6, a7, arity);
  }
}

function js8(label, cacheid, a0, a1, a2, a3, a4, a5, a6, a7) {
  return _8(Caml_oo.caml_get_public_method(a0, label, cacheid), a0, a1, a2, a3, a4, a5, a6, a7);
}

function __8(o) {
  var arity = o.length;
  if (arity === 8) {
    return o;
  }
  else {
    return function (a0, a1, a2, a3, a4, a5, a6, a7) {
      return _8(o, a0, a1, a2, a3, a4, a5, a6, a7);
    };
  }
}

exports.app     = app;
exports.js      = js;
exports.curry_1 = curry_1;
exports._1      = _1;
exports.js1     = js1;
exports.__1     = __1;
exports.curry_2 = curry_2;
exports._2      = _2;
exports.js2     = js2;
exports.__2     = __2;
exports.curry_3 = curry_3;
exports._3      = _3;
exports.js3     = js3;
exports.__3     = __3;
exports.curry_4 = curry_4;
exports._4      = _4;
exports.js4     = js4;
exports.__4     = __4;
exports.curry_5 = curry_5;
exports._5      = _5;
exports.js5     = js5;
exports.__5     = __5;
exports.curry_6 = curry_6;
exports._6      = _6;
exports.js6     = js6;
exports.__6     = __6;
exports.curry_7 = curry_7;
exports._7      = _7;
exports.js7     = js7;
exports.__7     = __7;
exports.curry_8 = curry_8;
exports._8      = _8;
exports.js8     = js8;
exports.__8     = __8;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/digest.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Pervasives              = require("bs-platform/lib/js/pervasives");
var Char                    = require("bs-platform/lib/js/char");
var Caml_md5                = require("bs-platform/lib/js/caml_md5");
var $$String                = require("bs-platform/lib/js/string");
var Caml_string             = require("bs-platform/lib/js/caml_string");

function string(str) {
  return Caml_md5.caml_md5_string(str, 0, str.length);
}

function bytes(b) {
  return string(Caml_string.bytes_to_string(b));
}

function substring(str, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (str.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Digest.substring"
        ];
  }
  else {
    return Caml_md5.caml_md5_string(str, ofs, len);
  }
}

function subbytes(b, ofs, len) {
  return substring(Caml_string.bytes_to_string(b), ofs, len);
}

function file(filename) {
  Pervasives.open_in_bin(filename);
  var exit = 0;
  var d;
  try {
    d = function () {
        throw "caml_md5_chan not implemented by bucklescript yet\n";
      }();
    exit = 1;
  }
  catch (e){
    (function () {
          throw "caml_ml_close_channel not implemented by bucklescript yet\n";
        }());
    throw e;
  }
  if (exit === 1) {
    (function () {
          throw "caml_ml_close_channel not implemented by bucklescript yet\n";
        }());
    return d;
  }
  
}

var output = Pervasives.output_string

function input(chan) {
  return Pervasives.really_input_string(chan, 16);
}

function char_hex(n) {
  return n + (
          n < 10 ? /* "0" */48 : 87
        ) | 0;
}

function to_hex(d) {
  var result = new Array(32);
  for(var i = 0; i <= 15; ++i){
    var x = Caml_string.get(d, i);
    result[(i << 1)] = char_hex((x >>> 4));
    result[(i << 1) + 1 | 0] = char_hex(x & 15);
  }
  return Caml_string.bytes_to_string(result);
}

function from_hex(s) {
  if (s.length !== 32) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Digest.from_hex"
        ];
  }
  var digit = function (c) {
    if (c >= 65) {
      if (c >= 97) {
        if (c >= 103) {
          throw [
                Caml_builtin_exceptions.invalid_argument,
                "Digest.from_hex"
              ];
        }
        else {
          return (c - /* "a" */97 | 0) + 10 | 0;
        }
      }
      else if (c >= 71) {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "Digest.from_hex"
            ];
      }
      else {
        return (c - /* "A" */65 | 0) + 10 | 0;
      }
    }
    else if (c > 57 || c < 48) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "Digest.from_hex"
          ];
    }
    else {
      return c - /* "0" */48 | 0;
    }
  };
  var $$byte = function (i) {
    return (digit(Caml_string.get(s, i)) << 4) + digit(Caml_string.get(s, i + 1 | 0)) | 0;
  };
  var result = new Array(16);
  for(var i = 0; i <= 15; ++i){
    result[i] = Char.chr($$byte((i << 1)));
  }
  return Caml_string.bytes_to_string(result);
}

var compare = $$String.compare;

exports.compare   = compare;
exports.string    = string;
exports.bytes     = bytes;
exports.substring = substring;
exports.subbytes  = subbytes;
exports.file      = file;
exports.output    = output;
exports.input     = input;
exports.to_hex    = to_hex;
exports.from_hex  = from_hex;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/int32.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_obj    = require("/bs-platform/lib/js/caml_obj");
var Caml_format = require("/bs-platform/lib/js/caml_format");

function succ(n) {
  return n + 1 | 0;
}

function pred(n) {
  return n - 1 | 0;
}

function abs(n) {
  if (n >= 0) {
    return n;
  }
  else {
    return -n | 0;
  }
}

function lognot(n) {
  return n ^ -1;
}

function to_string(n) {
  return Caml_format.caml_int32_format("%d", n);
}

var compare = Caml_obj.caml_int32_compare

var zero = 0;

var one = 1;

var minus_one = -1;

var max_int = 2147483647;

var min_int = -2147483648;

exports.zero      = zero;
exports.one       = one;
exports.minus_one = minus_one;
exports.succ      = succ;
exports.pred      = pred;
exports.abs       = abs;
exports.max_int   = max_int;
exports.min_int   = min_int;
exports.lognot    = lognot;
exports.to_string = to_string;
exports.compare   = compare;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/int64.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_int64  = require("/bs-platform/lib/js/caml_int64");
var Caml_format = require("/bs-platform/lib/js/caml_format");

function succ(n) {
  return Caml_int64.add(n, /* int64 */[
              /* hi */0,
              /* lo */1
            ]);
}

function pred(n) {
  return Caml_int64.sub(n, /* int64 */[
              /* hi */0,
              /* lo */1
            ]);
}

function abs(n) {
  if (Caml_int64.ge(n, /* int64 */[
          /* hi */0,
          /* lo */0
        ])) {
    return n;
  }
  else {
    return Caml_int64.neg(n);
  }
}

function lognot(n) {
  return /* int64 */[
          /* hi */n[0] ^ /* hi */-1,
          /* lo */((n[1] ^ /* lo */4294967295) >>> 0)
        ];
}

function to_string(n) {
  return Caml_format.caml_int64_format("%d", n);
}

var compare = Caml_int64.compare

var zero = /* int64 */[
  /* hi */0,
  /* lo */0
];

var one = /* int64 */[
  /* hi */0,
  /* lo */1
];

var minus_one = /* int64 */[
  /* hi */-1,
  /* lo */4294967295
];

var max_int = /* int64 */[
  /* hi */2147483647,
  /* lo */4294967295
];

var min_int = /* int64 */[
  /* hi */-2147483648,
  /* lo */0
];

exports.zero      = zero;
exports.one       = one;
exports.minus_one = minus_one;
exports.succ      = succ;
exports.pred      = pred;
exports.abs       = abs;
exports.max_int   = max_int;
exports.min_int   = min_int;
exports.lognot    = lognot;
exports.to_string = to_string;
exports.compare   = compare;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/js_primitive.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';


function js_is_nil_undef(x) {
  if (x === null) {
    return /* true */1;
  }
  else {
    return +(x === undefined);
  }
}

function js_from_nullable_def(x) {
  if (x === null || x === undefined) {
    return /* None */0;
  }
  else {
    return /* Some */[x];
  }
}

function option_get(x) {
  if (x) {
    return x[0];
  }
  else {
    return undefined;
  }
}

exports.js_is_nil_undef      = js_is_nil_undef;
exports.js_from_nullable_def = js_from_nullable_def;
exports.option_get           = option_get;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/list.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Pervasives              = require("bs-platform/lib/js/pervasives");
var Curry                   = require("bs-platform/lib/js/curry");

function length(l) {
  var _len = 0;
  var _param = l;
  while(true) {
    var param = _param;
    var len = _len;
    if (param) {
      _param = param[1];
      _len = len + 1 | 0;
      continue ;

    }
    else {
      return len;
    }
  };
}

function hd(param) {
  if (param) {
    return param[0];
  }
  else {
    throw [
          Caml_builtin_exceptions.failure,
          "hd"
        ];
  }
}

function tl(param) {
  if (param) {
    return param[1];
  }
  else {
    throw [
          Caml_builtin_exceptions.failure,
          "tl"
        ];
  }
}

function nth(l, n) {
  if (n < 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "List.nth"
        ];
  }
  else {
    var _l = l;
    var _n = n;
    while(true) {
      var n$1 = _n;
      var l$1 = _l;
      if (l$1) {
        if (n$1) {
          _n = n$1 - 1 | 0;
          _l = l$1[1];
          continue ;

        }
        else {
          return l$1[0];
        }
      }
      else {
        throw [
              Caml_builtin_exceptions.failure,
              "nth"
            ];
      }
    };
  }
}

function rev_append(_l1, _l2) {
  while(true) {
    var l2 = _l2;
    var l1 = _l1;
    if (l1) {
      _l2 = /* :: */[
        l1[0],
        l2
      ];
      _l1 = l1[1];
      continue ;

    }
    else {
      return l2;
    }
  };
}

function rev(l) {
  return rev_append(l, /* [] */0);
}

function flatten(param) {
  if (param) {
    return Pervasives.$at(param[0], flatten(param[1]));
  }
  else {
    return /* [] */0;
  }
}

function map(f, param) {
  if (param) {
    var r = Curry._1(f, param[0]);
    return /* :: */[
            r,
            map(f, param[1])
          ];
  }
  else {
    return /* [] */0;
  }
}

function mapi(i, f, param) {
  if (param) {
    var r = Curry._2(f, i, param[0]);
    return /* :: */[
            r,
            mapi(i + 1 | 0, f, param[1])
          ];
  }
  else {
    return /* [] */0;
  }
}

function mapi$1(f, l) {
  return mapi(0, f, l);
}

function rev_map(f, l) {
  var _accu = /* [] */0;
  var _param = l;
  while(true) {
    var param = _param;
    var accu = _accu;
    if (param) {
      _param = param[1];
      _accu = /* :: */[
        Curry._1(f, param[0]),
        accu
      ];
      continue ;

    }
    else {
      return accu;
    }
  };
}

function iter(f, _param) {
  while(true) {
    var param = _param;
    if (param) {
      Curry._1(f, param[0]);
      _param = param[1];
      continue ;

    }
    else {
      return /* () */0;
    }
  };
}

function iteri(f, l) {
  var _i = 0;
  var f$1 = f;
  var _param = l;
  while(true) {
    var param = _param;
    var i = _i;
    if (param) {
      Curry._2(f$1, i, param[0]);
      _param = param[1];
      _i = i + 1 | 0;
      continue ;

    }
    else {
      return /* () */0;
    }
  };
}

function fold_left(f, _accu, _l) {
  while(true) {
    var l = _l;
    var accu = _accu;
    if (l) {
      _l = l[1];
      _accu = Curry._2(f, accu, l[0]);
      continue ;

    }
    else {
      return accu;
    }
  };
}

function fold_right(f, l, accu) {
  if (l) {
    return Curry._2(f, l[0], fold_right(f, l[1], accu));
  }
  else {
    return accu;
  }
}

function map2(f, l1, l2) {
  if (l1) {
    if (l2) {
      var r = Curry._2(f, l1[0], l2[0]);
      return /* :: */[
              r,
              map2(f, l1[1], l2[1])
            ];
    }
    else {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.map2"
          ];
    }
  }
  else if (l2) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "List.map2"
        ];
  }
  else {
    return /* [] */0;
  }
}

function rev_map2(f, l1, l2) {
  var _accu = /* [] */0;
  var _l1 = l1;
  var _l2 = l2;
  while(true) {
    var l2$1 = _l2;
    var l1$1 = _l1;
    var accu = _accu;
    if (l1$1) {
      if (l2$1) {
        _l2 = l2$1[1];
        _l1 = l1$1[1];
        _accu = /* :: */[
          Curry._2(f, l1$1[0], l2$1[0]),
          accu
        ];
        continue ;

      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "List.rev_map2"
            ];
      }
    }
    else if (l2$1) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.rev_map2"
          ];
    }
    else {
      return accu;
    }
  };
}

function iter2(f, _l1, _l2) {
  while(true) {
    var l2 = _l2;
    var l1 = _l1;
    if (l1) {
      if (l2) {
        Curry._2(f, l1[0], l2[0]);
        _l2 = l2[1];
        _l1 = l1[1];
        continue ;

      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "List.iter2"
            ];
      }
    }
    else if (l2) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.iter2"
          ];
    }
    else {
      return /* () */0;
    }
  };
}

function fold_left2(f, _accu, _l1, _l2) {
  while(true) {
    var l2 = _l2;
    var l1 = _l1;
    var accu = _accu;
    if (l1) {
      if (l2) {
        _l2 = l2[1];
        _l1 = l1[1];
        _accu = Curry._3(f, accu, l1[0], l2[0]);
        continue ;

      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "List.fold_left2"
            ];
      }
    }
    else if (l2) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.fold_left2"
          ];
    }
    else {
      return accu;
    }
  };
}

function fold_right2(f, l1, l2, accu) {
  if (l1) {
    if (l2) {
      return Curry._3(f, l1[0], l2[0], fold_right2(f, l1[1], l2[1], accu));
    }
    else {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.fold_right2"
          ];
    }
  }
  else if (l2) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "List.fold_right2"
        ];
  }
  else {
    return accu;
  }
}

function for_all(p, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Curry._1(p, param[0])) {
        _param = param[1];
        continue ;

      }
      else {
        return /* false */0;
      }
    }
    else {
      return /* true */1;
    }
  };
}

function exists(p, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Curry._1(p, param[0])) {
        return /* true */1;
      }
      else {
        _param = param[1];
        continue ;

      }
    }
    else {
      return /* false */0;
    }
  };
}

function for_all2(p, _l1, _l2) {
  while(true) {
    var l2 = _l2;
    var l1 = _l1;
    if (l1) {
      if (l2) {
        if (Curry._2(p, l1[0], l2[0])) {
          _l2 = l2[1];
          _l1 = l1[1];
          continue ;

        }
        else {
          return /* false */0;
        }
      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "List.for_all2"
            ];
      }
    }
    else if (l2) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.for_all2"
          ];
    }
    else {
      return /* true */1;
    }
  };
}

function exists2(p, _l1, _l2) {
  while(true) {
    var l2 = _l2;
    var l1 = _l1;
    if (l1) {
      if (l2) {
        if (Curry._2(p, l1[0], l2[0])) {
          return /* true */1;
        }
        else {
          _l2 = l2[1];
          _l1 = l1[1];
          continue ;

        }
      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "List.exists2"
            ];
      }
    }
    else if (l2) {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.exists2"
          ];
    }
    else {
      return /* false */0;
    }
  };
}

function mem(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Caml_obj.caml_compare(param[0], x)) {
        _param = param[1];
        continue ;

      }
      else {
        return /* true */1;
      }
    }
    else {
      return /* false */0;
    }
  };
}

function memq(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (param[0] === x) {
        return /* true */1;
      }
      else {
        _param = param[1];
        continue ;

      }
    }
    else {
      return /* false */0;
    }
  };
}

function assoc(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      var match = param[0];
      if (Caml_obj.caml_compare(match[0], x)) {
        _param = param[1];
        continue ;

      }
      else {
        return match[1];
      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function assq(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      var match = param[0];
      if (match[0] === x) {
        return match[1];
      }
      else {
        _param = param[1];
        continue ;

      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function mem_assoc(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Caml_obj.caml_compare(param[0][0], x)) {
        _param = param[1];
        continue ;

      }
      else {
        return /* true */1;
      }
    }
    else {
      return /* false */0;
    }
  };
}

function mem_assq(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (param[0][0] === x) {
        return /* true */1;
      }
      else {
        _param = param[1];
        continue ;

      }
    }
    else {
      return /* false */0;
    }
  };
}

function remove_assoc(x, param) {
  if (param) {
    var l = param[1];
    var pair = param[0];
    if (Caml_obj.caml_compare(pair[0], x)) {
      return /* :: */[
              pair,
              remove_assoc(x, l)
            ];
    }
    else {
      return l;
    }
  }
  else {
    return /* [] */0;
  }
}

function remove_assq(x, param) {
  if (param) {
    var l = param[1];
    var pair = param[0];
    if (pair[0] === x) {
      return l;
    }
    else {
      return /* :: */[
              pair,
              remove_assq(x, l)
            ];
    }
  }
  else {
    return /* [] */0;
  }
}

function find(p, _param) {
  while(true) {
    var param = _param;
    if (param) {
      var x = param[0];
      if (Curry._1(p, x)) {
        return x;
      }
      else {
        _param = param[1];
        continue ;

      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function find_all(p) {
  return function (param) {
    var _accu = /* [] */0;
    var _param = param;
    while(true) {
      var param$1 = _param;
      var accu = _accu;
      if (param$1) {
        var l = param$1[1];
        var x = param$1[0];
        if (Curry._1(p, x)) {
          _param = l;
          _accu = /* :: */[
            x,
            accu
          ];
          continue ;

        }
        else {
          _param = l;
          continue ;

        }
      }
      else {
        return rev_append(accu, /* [] */0);
      }
    };
  };
}

function partition(p, l) {
  var _yes = /* [] */0;
  var _no = /* [] */0;
  var _param = l;
  while(true) {
    var param = _param;
    var no = _no;
    var yes = _yes;
    if (param) {
      var l$1 = param[1];
      var x = param[0];
      if (Curry._1(p, x)) {
        _param = l$1;
        _yes = /* :: */[
          x,
          yes
        ];
        continue ;

      }
      else {
        _param = l$1;
        _no = /* :: */[
          x,
          no
        ];
        continue ;

      }
    }
    else {
      return /* tuple */[
              rev_append(yes, /* [] */0),
              rev_append(no, /* [] */0)
            ];
    }
  };
}

function split(param) {
  if (param) {
    var match = param[0];
    var match$1 = split(param[1]);
    return /* tuple */[
            /* :: */[
              match[0],
              match$1[0]
            ],
            /* :: */[
              match[1],
              match$1[1]
            ]
          ];
  }
  else {
    return /* tuple */[
            /* [] */0,
            /* [] */0
          ];
  }
}

function combine(l1, l2) {
  if (l1) {
    if (l2) {
      return /* :: */[
              /* tuple */[
                l1[0],
                l2[0]
              ],
              combine(l1[1], l2[1])
            ];
    }
    else {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "List.combine"
          ];
    }
  }
  else if (l2) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "List.combine"
        ];
  }
  else {
    return /* [] */0;
  }
}

function merge(cmp, l1, l2) {
  if (l1) {
    if (l2) {
      var h2 = l2[0];
      var h1 = l1[0];
      if (Curry._2(cmp, h1, h2) <= 0) {
        return /* :: */[
                h1,
                merge(cmp, l1[1], l2)
              ];
      }
      else {
        return /* :: */[
                h2,
                merge(cmp, l1, l2[1])
              ];
      }
    }
    else {
      return l1;
    }
  }
  else {
    return l2;
  }
}

function chop(_k, _l) {
  while(true) {
    var l = _l;
    var k = _k;
    if (k) {
      if (l) {
        _l = l[1];
        _k = k - 1 | 0;
        continue ;

      }
      else {
        throw [
              Caml_builtin_exceptions.assert_failure,
              [
                "list.ml",
                223,
                11
              ]
            ];
      }
    }
    else {
      return l;
    }
  };
}

function stable_sort(cmp, l) {
  var sort = function (n, l) {
    var exit = 0;
    if (n !== 2) {
      if (n !== 3) {
        exit = 1;
      }
      else if (l) {
        var match = l[1];
        if (match) {
          var match$1 = match[1];
          if (match$1) {
            var x3 = match$1[0];
            var x2 = match[0];
            var x1 = l[0];
            if (Curry._2(cmp, x1, x2) <= 0) {
              if (Curry._2(cmp, x2, x3) <= 0) {
                return /* :: */[
                        x1,
                        /* :: */[
                          x2,
                          /* :: */[
                            x3,
                            /* [] */0
                          ]
                        ]
                      ];
              }
              else if (Curry._2(cmp, x1, x3) <= 0) {
                return /* :: */[
                        x1,
                        /* :: */[
                          x3,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ]
                      ];
              }
              else {
                return /* :: */[
                        x3,
                        /* :: */[
                          x1,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ]
                      ];
              }
            }
            else if (Curry._2(cmp, x1, x3) <= 0) {
              return /* :: */[
                      x2,
                      /* :: */[
                        x1,
                        /* :: */[
                          x3,
                          /* [] */0
                        ]
                      ]
                    ];
            }
            else if (Curry._2(cmp, x2, x3) <= 0) {
              return /* :: */[
                      x2,
                      /* :: */[
                        x3,
                        /* :: */[
                          x1,
                          /* [] */0
                        ]
                      ]
                    ];
            }
            else {
              return /* :: */[
                      x3,
                      /* :: */[
                        x2,
                        /* :: */[
                          x1,
                          /* [] */0
                        ]
                      ]
                    ];
            }
          }
          else {
            exit = 1;
          }
        }
        else {
          exit = 1;
        }
      }
      else {
        exit = 1;
      }
    }
    else if (l) {
      var match$2 = l[1];
      if (match$2) {
        var x2$1 = match$2[0];
        var x1$1 = l[0];
        if (Curry._2(cmp, x1$1, x2$1) <= 0) {
          return /* :: */[
                  x1$1,
                  /* :: */[
                    x2$1,
                    /* [] */0
                  ]
                ];
        }
        else {
          return /* :: */[
                  x2$1,
                  /* :: */[
                    x1$1,
                    /* [] */0
                  ]
                ];
        }
      }
      else {
        exit = 1;
      }
    }
    else {
      exit = 1;
    }
    if (exit === 1) {
      var n1 = (n >> 1);
      var n2 = n - n1 | 0;
      var l2 = chop(n1, l);
      var s1 = rev_sort(n1, l);
      var s2 = rev_sort(n2, l2);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = /* [] */0;
      while(true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (l1) {
          if (l2$1) {
            var h2 = l2$1[0];
            var h1 = l1[0];
            if (Curry._2(cmp, h1, h2) > 0) {
              _accu = /* :: */[
                h1,
                accu
              ];
              _l1 = l1[1];
              continue ;

            }
            else {
              _accu = /* :: */[
                h2,
                accu
              ];
              _l2 = l2$1[1];
              continue ;

            }
          }
          else {
            return rev_append(l1, accu);
          }
        }
        else {
          return rev_append(l2$1, accu);
        }
      };
    }

  };
  var rev_sort = function (n, l) {
    var exit = 0;
    if (n !== 2) {
      if (n !== 3) {
        exit = 1;
      }
      else if (l) {
        var match = l[1];
        if (match) {
          var match$1 = match[1];
          if (match$1) {
            var x3 = match$1[0];
            var x2 = match[0];
            var x1 = l[0];
            if (Curry._2(cmp, x1, x2) > 0) {
              if (Curry._2(cmp, x2, x3) > 0) {
                return /* :: */[
                        x1,
                        /* :: */[
                          x2,
                          /* :: */[
                            x3,
                            /* [] */0
                          ]
                        ]
                      ];
              }
              else if (Curry._2(cmp, x1, x3) > 0) {
                return /* :: */[
                        x1,
                        /* :: */[
                          x3,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ]
                      ];
              }
              else {
                return /* :: */[
                        x3,
                        /* :: */[
                          x1,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ]
                      ];
              }
            }
            else if (Curry._2(cmp, x1, x3) > 0) {
              return /* :: */[
                      x2,
                      /* :: */[
                        x1,
                        /* :: */[
                          x3,
                          /* [] */0
                        ]
                      ]
                    ];
            }
            else if (Curry._2(cmp, x2, x3) > 0) {
              return /* :: */[
                      x2,
                      /* :: */[
                        x3,
                        /* :: */[
                          x1,
                          /* [] */0
                        ]
                      ]
                    ];
            }
            else {
              return /* :: */[
                      x3,
                      /* :: */[
                        x2,
                        /* :: */[
                          x1,
                          /* [] */0
                        ]
                      ]
                    ];
            }
          }
          else {
            exit = 1;
          }
        }
        else {
          exit = 1;
        }
      }
      else {
        exit = 1;
      }
    }
    else if (l) {
      var match$2 = l[1];
      if (match$2) {
        var x2$1 = match$2[0];
        var x1$1 = l[0];
        if (Curry._2(cmp, x1$1, x2$1) > 0) {
          return /* :: */[
                  x1$1,
                  /* :: */[
                    x2$1,
                    /* [] */0
                  ]
                ];
        }
        else {
          return /* :: */[
                  x2$1,
                  /* :: */[
                    x1$1,
                    /* [] */0
                  ]
                ];
        }
      }
      else {
        exit = 1;
      }
    }
    else {
      exit = 1;
    }
    if (exit === 1) {
      var n1 = (n >> 1);
      var n2 = n - n1 | 0;
      var l2 = chop(n1, l);
      var s1 = sort(n1, l);
      var s2 = sort(n2, l2);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = /* [] */0;
      while(true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (l1) {
          if (l2$1) {
            var h2 = l2$1[0];
            var h1 = l1[0];
            if (Curry._2(cmp, h1, h2) <= 0) {
              _accu = /* :: */[
                h1,
                accu
              ];
              _l1 = l1[1];
              continue ;

            }
            else {
              _accu = /* :: */[
                h2,
                accu
              ];
              _l2 = l2$1[1];
              continue ;

            }
          }
          else {
            return rev_append(l1, accu);
          }
        }
        else {
          return rev_append(l2$1, accu);
        }
      };
    }

  };
  var len = length(l);
  if (len < 2) {
    return l;
  }
  else {
    return sort(len, l);
  }
}

function sort_uniq(cmp, l) {
  var sort = function (n, l) {
    var exit = 0;
    if (n !== 2) {
      if (n !== 3) {
        exit = 1;
      }
      else if (l) {
        var match = l[1];
        if (match) {
          var match$1 = match[1];
          if (match$1) {
            var x3 = match$1[0];
            var x2 = match[0];
            var x1 = l[0];
            var c = Curry._2(cmp, x1, x2);
            if (c) {
              if (c < 0) {
                var c$1 = Curry._2(cmp, x2, x3);
                if (c$1) {
                  if (c$1 < 0) {
                    return /* :: */[
                            x1,
                            /* :: */[
                              x2,
                              /* :: */[
                                x3,
                                /* [] */0
                              ]
                            ]
                          ];
                  }
                  else {
                    var c$2 = Curry._2(cmp, x1, x3);
                    if (c$2) {
                      if (c$2 < 0) {
                        return /* :: */[
                                x1,
                                /* :: */[
                                  x3,
                                  /* :: */[
                                    x2,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                      else {
                        return /* :: */[
                                x3,
                                /* :: */[
                                  x1,
                                  /* :: */[
                                    x2,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                    }
                    else {
                      return /* :: */[
                              x1,
                              /* :: */[
                                x2,
                                /* [] */0
                              ]
                            ];
                    }
                  }
                }
                else {
                  return /* :: */[
                          x1,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ];
                }
              }
              else {
                var c$3 = Curry._2(cmp, x1, x3);
                if (c$3) {
                  if (c$3 < 0) {
                    return /* :: */[
                            x2,
                            /* :: */[
                              x1,
                              /* :: */[
                                x3,
                                /* [] */0
                              ]
                            ]
                          ];
                  }
                  else {
                    var c$4 = Curry._2(cmp, x2, x3);
                    if (c$4) {
                      if (c$4 < 0) {
                        return /* :: */[
                                x2,
                                /* :: */[
                                  x3,
                                  /* :: */[
                                    x1,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                      else {
                        return /* :: */[
                                x3,
                                /* :: */[
                                  x2,
                                  /* :: */[
                                    x1,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                    }
                    else {
                      return /* :: */[
                              x2,
                              /* :: */[
                                x1,
                                /* [] */0
                              ]
                            ];
                    }
                  }
                }
                else {
                  return /* :: */[
                          x2,
                          /* :: */[
                            x1,
                            /* [] */0
                          ]
                        ];
                }
              }
            }
            else {
              var c$5 = Curry._2(cmp, x2, x3);
              if (c$5) {
                if (c$5 < 0) {
                  return /* :: */[
                          x2,
                          /* :: */[
                            x3,
                            /* [] */0
                          ]
                        ];
                }
                else {
                  return /* :: */[
                          x3,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ];
                }
              }
              else {
                return /* :: */[
                        x2,
                        /* [] */0
                      ];
              }
            }
          }
          else {
            exit = 1;
          }
        }
        else {
          exit = 1;
        }
      }
      else {
        exit = 1;
      }
    }
    else if (l) {
      var match$2 = l[1];
      if (match$2) {
        var x2$1 = match$2[0];
        var x1$1 = l[0];
        var c$6 = Curry._2(cmp, x1$1, x2$1);
        if (c$6) {
          if (c$6 < 0) {
            return /* :: */[
                    x1$1,
                    /* :: */[
                      x2$1,
                      /* [] */0
                    ]
                  ];
          }
          else {
            return /* :: */[
                    x2$1,
                    /* :: */[
                      x1$1,
                      /* [] */0
                    ]
                  ];
          }
        }
        else {
          return /* :: */[
                  x1$1,
                  /* [] */0
                ];
        }
      }
      else {
        exit = 1;
      }
    }
    else {
      exit = 1;
    }
    if (exit === 1) {
      var n1 = (n >> 1);
      var n2 = n - n1 | 0;
      var l2 = chop(n1, l);
      var s1 = rev_sort(n1, l);
      var s2 = rev_sort(n2, l2);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = /* [] */0;
      while(true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (l1) {
          if (l2$1) {
            var t2 = l2$1[1];
            var h2 = l2$1[0];
            var t1 = l1[1];
            var h1 = l1[0];
            var c$7 = Curry._2(cmp, h1, h2);
            if (c$7) {
              if (c$7 > 0) {
                _accu = /* :: */[
                  h1,
                  accu
                ];
                _l1 = t1;
                continue ;

              }
              else {
                _accu = /* :: */[
                  h2,
                  accu
                ];
                _l2 = t2;
                continue ;

              }
            }
            else {
              _accu = /* :: */[
                h1,
                accu
              ];
              _l2 = t2;
              _l1 = t1;
              continue ;

            }
          }
          else {
            return rev_append(l1, accu);
          }
        }
        else {
          return rev_append(l2$1, accu);
        }
      };
    }

  };
  var rev_sort = function (n, l) {
    var exit = 0;
    if (n !== 2) {
      if (n !== 3) {
        exit = 1;
      }
      else if (l) {
        var match = l[1];
        if (match) {
          var match$1 = match[1];
          if (match$1) {
            var x3 = match$1[0];
            var x2 = match[0];
            var x1 = l[0];
            var c = Curry._2(cmp, x1, x2);
            if (c) {
              if (c > 0) {
                var c$1 = Curry._2(cmp, x2, x3);
                if (c$1) {
                  if (c$1 > 0) {
                    return /* :: */[
                            x1,
                            /* :: */[
                              x2,
                              /* :: */[
                                x3,
                                /* [] */0
                              ]
                            ]
                          ];
                  }
                  else {
                    var c$2 = Curry._2(cmp, x1, x3);
                    if (c$2) {
                      if (c$2 > 0) {
                        return /* :: */[
                                x1,
                                /* :: */[
                                  x3,
                                  /* :: */[
                                    x2,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                      else {
                        return /* :: */[
                                x3,
                                /* :: */[
                                  x1,
                                  /* :: */[
                                    x2,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                    }
                    else {
                      return /* :: */[
                              x1,
                              /* :: */[
                                x2,
                                /* [] */0
                              ]
                            ];
                    }
                  }
                }
                else {
                  return /* :: */[
                          x1,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ];
                }
              }
              else {
                var c$3 = Curry._2(cmp, x1, x3);
                if (c$3) {
                  if (c$3 > 0) {
                    return /* :: */[
                            x2,
                            /* :: */[
                              x1,
                              /* :: */[
                                x3,
                                /* [] */0
                              ]
                            ]
                          ];
                  }
                  else {
                    var c$4 = Curry._2(cmp, x2, x3);
                    if (c$4) {
                      if (c$4 > 0) {
                        return /* :: */[
                                x2,
                                /* :: */[
                                  x3,
                                  /* :: */[
                                    x1,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                      else {
                        return /* :: */[
                                x3,
                                /* :: */[
                                  x2,
                                  /* :: */[
                                    x1,
                                    /* [] */0
                                  ]
                                ]
                              ];
                      }
                    }
                    else {
                      return /* :: */[
                              x2,
                              /* :: */[
                                x1,
                                /* [] */0
                              ]
                            ];
                    }
                  }
                }
                else {
                  return /* :: */[
                          x2,
                          /* :: */[
                            x1,
                            /* [] */0
                          ]
                        ];
                }
              }
            }
            else {
              var c$5 = Curry._2(cmp, x2, x3);
              if (c$5) {
                if (c$5 > 0) {
                  return /* :: */[
                          x2,
                          /* :: */[
                            x3,
                            /* [] */0
                          ]
                        ];
                }
                else {
                  return /* :: */[
                          x3,
                          /* :: */[
                            x2,
                            /* [] */0
                          ]
                        ];
                }
              }
              else {
                return /* :: */[
                        x2,
                        /* [] */0
                      ];
              }
            }
          }
          else {
            exit = 1;
          }
        }
        else {
          exit = 1;
        }
      }
      else {
        exit = 1;
      }
    }
    else if (l) {
      var match$2 = l[1];
      if (match$2) {
        var x2$1 = match$2[0];
        var x1$1 = l[0];
        var c$6 = Curry._2(cmp, x1$1, x2$1);
        if (c$6) {
          if (c$6 > 0) {
            return /* :: */[
                    x1$1,
                    /* :: */[
                      x2$1,
                      /* [] */0
                    ]
                  ];
          }
          else {
            return /* :: */[
                    x2$1,
                    /* :: */[
                      x1$1,
                      /* [] */0
                    ]
                  ];
          }
        }
        else {
          return /* :: */[
                  x1$1,
                  /* [] */0
                ];
        }
      }
      else {
        exit = 1;
      }
    }
    else {
      exit = 1;
    }
    if (exit === 1) {
      var n1 = (n >> 1);
      var n2 = n - n1 | 0;
      var l2 = chop(n1, l);
      var s1 = sort(n1, l);
      var s2 = sort(n2, l2);
      var _l1 = s1;
      var _l2 = s2;
      var _accu = /* [] */0;
      while(true) {
        var accu = _accu;
        var l2$1 = _l2;
        var l1 = _l1;
        if (l1) {
          if (l2$1) {
            var t2 = l2$1[1];
            var h2 = l2$1[0];
            var t1 = l1[1];
            var h1 = l1[0];
            var c$7 = Curry._2(cmp, h1, h2);
            if (c$7) {
              if (c$7 < 0) {
                _accu = /* :: */[
                  h1,
                  accu
                ];
                _l1 = t1;
                continue ;

              }
              else {
                _accu = /* :: */[
                  h2,
                  accu
                ];
                _l2 = t2;
                continue ;

              }
            }
            else {
              _accu = /* :: */[
                h1,
                accu
              ];
              _l2 = t2;
              _l1 = t1;
              continue ;

            }
          }
          else {
            return rev_append(l1, accu);
          }
        }
        else {
          return rev_append(l2$1, accu);
        }
      };
    }

  };
  var len = length(l);
  if (len < 2) {
    return l;
  }
  else {
    return sort(len, l);
  }
}

var append = Pervasives.$at;

var concat = flatten;

var filter = find_all;

var sort = stable_sort;

var fast_sort = stable_sort;

exports.length       = length;
exports.hd           = hd;
exports.tl           = tl;
exports.nth          = nth;
exports.rev          = rev;
exports.append       = append;
exports.rev_append   = rev_append;
exports.concat       = concat;
exports.flatten      = flatten;
exports.iter         = iter;
exports.iteri        = iteri;
exports.map          = map;
exports.mapi         = mapi$1;
exports.rev_map      = rev_map;
exports.fold_left    = fold_left;
exports.fold_right   = fold_right;
exports.iter2        = iter2;
exports.map2         = map2;
exports.rev_map2     = rev_map2;
exports.fold_left2   = fold_left2;
exports.fold_right2  = fold_right2;
exports.for_all      = for_all;
exports.exists       = exists;
exports.for_all2     = for_all2;
exports.exists2      = exists2;
exports.mem          = mem;
exports.memq         = memq;
exports.find         = find;
exports.filter       = filter;
exports.find_all     = find_all;
exports.partition    = partition;
exports.assoc        = assoc;
exports.assq         = assq;
exports.mem_assoc    = mem_assoc;
exports.mem_assq     = mem_assq;
exports.remove_assoc = remove_assoc;
exports.remove_assq  = remove_assq;
exports.split        = split;
exports.combine      = combine;
exports.sort         = sort;
exports.stable_sort  = stable_sort;
exports.fast_sort    = fast_sort;
exports.sort_uniq    = sort_uniq;
exports.merge        = merge;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/nativeint.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_obj    = require("bs-platform/lib/js/caml_obj");
var Caml_format = require("bs-platform/lib/js/caml_format");
var Sys         = require("bs-platform/lib/js/sys");

function succ(n) {
  return n + 1;
}

function pred(n) {
  return n - 1;
}

function abs(n) {
  if (n >= 0) {
    return n;
  }
  else {
    return -n;
  }
}

var min_int = -9007199254740991;

var max_int = 9007199254740991;

function lognot(n) {
  return n ^ -1;
}

function to_string(n) {
  return Caml_format.caml_nativeint_format("%d", n);
}

var compare = Caml_obj.caml_nativeint_compare

var zero = 0;

var one = 1;

var minus_one = -1;

var size = Sys.word_size;

exports.zero      = zero;
exports.one       = one;
exports.minus_one = minus_one;
exports.succ      = succ;
exports.pred      = pred;
exports.abs       = abs;
exports.size      = size;
exports.max_int   = max_int;
exports.min_int   = min_int;
exports.lognot    = lognot;
exports.to_string = to_string;
exports.compare   = compare;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/pervasives.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions  = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                 = require("bs-platform/lib/js/caml_obj");
var Caml_io                  = require("bs-platform/lib/js/caml_io");
var Caml_exceptions          = require("bs-platform/lib/js/caml_exceptions");
var Caml_format              = require("bs-platform/lib/js/caml_format");
var Curry                    = require("bs-platform/lib/js/curry");
var CamlinternalFormatBasics = require("bs-platform/lib/js/camlinternalFormatBasics");
var Caml_string              = require("bs-platform/lib/js/caml_string");

function failwith(s) {
  throw [
        Caml_builtin_exceptions.failure,
        s
      ];
}

function invalid_arg(s) {
  throw [
        Caml_builtin_exceptions.invalid_argument,
        s
      ];
}

var Exit = Caml_exceptions.create("Pervasives.Exit");

function min(x, y) {
  if (Caml_obj.caml_lessequal(x, y)) {
    return x;
  }
  else {
    return y;
  }
}

function max(x, y) {
  if (Caml_obj.caml_greaterequal(x, y)) {
    return x;
  }
  else {
    return y;
  }
}

function abs(x) {
  if (x >= 0) {
    return x;
  }
  else {
    return -x;
  }
}

function lnot(x) {
  return x ^ -1;
}

var min_int = -2147483648;

function $caret(a, b) {
  return a + b;
}

function char_of_int(n) {
  if (n < 0 || n > 255) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "char_of_int"
        ];
  }
  else {
    return n;
  }
}

function string_of_bool(b) {
  if (b) {
    return "true";
  }
  else {
    return "false";
  }
}

function bool_of_string(param) {
  switch (param) {
    case "false" :
        return /* false */0;
    case "true" :
        return /* true */1;
    default:
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "bool_of_string"
          ];
  }
}

function string_of_int(param) {
  return "" + param;
}

function valid_float_lexem(s) {
  var l = s.length;
  var _i = 0;
  while(true) {
    var i = _i;
    if (i >= l) {
      return $caret(s, ".");
    }
    else {
      var match = Caml_string.get(s, i);
      if (match >= 48) {
        if (match >= 58) {
          return s;
        }
        else {
          _i = i + 1 | 0;
          continue ;

        }
      }
      else if (match !== 45) {
        return s;
      }
      else {
        _i = i + 1 | 0;
        continue ;

      }
    }
  };
}

function string_of_float(f) {
  return valid_float_lexem(Caml_format.caml_format_float("%.12g", f));
}

function $at(l1, l2) {
  if (l1) {
    return /* :: */[
            l1[0],
            $at(l1[1], l2)
          ];
  }
  else {
    return l2;
  }
}

var stdin = Caml_io.stdin;

var stdout = Caml_io.stdout;

var stderr = Caml_io.stderr;

function open_out_gen(_, _$1, _$2) {
  return Caml_io.caml_ml_open_descriptor_out(function () {
                throw "caml_sys_open not implemented by bucklescript yet\n";
              }());
}

function open_out(name) {
  return open_out_gen(/* :: */[
              /* Open_wronly */1,
              /* :: */[
                /* Open_creat */3,
                /* :: */[
                  /* Open_trunc */4,
                  /* :: */[
                    /* Open_text */7,
                    /* [] */0
                  ]
                ]
              ]
            ], 438, name);
}

function open_out_bin(name) {
  return open_out_gen(/* :: */[
              /* Open_wronly */1,
              /* :: */[
                /* Open_creat */3,
                /* :: */[
                  /* Open_trunc */4,
                  /* :: */[
                    /* Open_binary */6,
                    /* [] */0
                  ]
                ]
              ]
            ], 438, name);
}

function flush_all() {
  var _param = Caml_io.caml_ml_out_channels_list(/* () */0);
  while(true) {
    var param = _param;
    if (param) {
      try {
        Caml_io.caml_ml_flush(param[0]);
      }
      catch (exn){

      }
      _param = param[1];
      continue ;

    }
    else {
      return /* () */0;
    }
  };
}

function output_bytes(oc, s) {
  return Caml_io.caml_ml_output(oc, s, 0, s.length);
}

function output_string(oc, s) {
  return Caml_io.caml_ml_output(oc, s, 0, s.length);
}

function output(oc, s, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "output"
        ];
  }
  else {
    return Caml_io.caml_ml_output(oc, s, ofs, len);
  }
}

function output_substring(oc, s, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "output_substring"
        ];
  }
  else {
    return Caml_io.caml_ml_output(oc, s, ofs, len);
  }
}

function output_value(_, _$1) {
  return function () {
            throw "caml_output_value not implemented by bucklescript yet\n";
          }();
}

function close_out(oc) {
  Caml_io.caml_ml_flush(oc);
  return function () {
            throw "caml_ml_close_channel not implemented by bucklescript yet\n";
          }();
}

function close_out_noerr(oc) {
  try {
    Caml_io.caml_ml_flush(oc);
  }
  catch (exn){

  }
  try {
    return function () {
              throw "caml_ml_close_channel not implemented by bucklescript yet\n";
            }();
  }
  catch (exn$1){
    return /* () */0;
  }
}

function open_in_gen(_, _$1, _$2) {
  return Caml_io.caml_ml_open_descriptor_in(function () {
                throw "caml_sys_open not implemented by bucklescript yet\n";
              }());
}

function open_in(name) {
  return open_in_gen(/* :: */[
              /* Open_rdonly */0,
              /* :: */[
                /* Open_text */7,
                /* [] */0
              ]
            ], 0, name);
}

function open_in_bin(name) {
  return open_in_gen(/* :: */[
              /* Open_rdonly */0,
              /* :: */[
                /* Open_binary */6,
                /* [] */0
              ]
            ], 0, name);
}

function input(_, s, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "input"
        ];
  }
  else {
    return function () {
              throw "caml_ml_input not implemented by bucklescript yet\n";
            }();
  }
}

function unsafe_really_input(_, _$1, _ofs, _len) {
  while(true) {
    var len = _len;
    var ofs = _ofs;
    if (len <= 0) {
      return /* () */0;
    }
    else {
      var r = function () {
          throw "caml_ml_input not implemented by bucklescript yet\n";
        }();
      if (r) {
        _len = len - r | 0;
        _ofs = ofs + r | 0;
        continue ;

      }
      else {
        throw Caml_builtin_exceptions.end_of_file;
      }
    }
  };
}

function really_input(ic, s, ofs, len) {
  if (ofs < 0 || len < 0 || ofs > (s.length - len | 0)) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "really_input"
        ];
  }
  else {
    return unsafe_really_input(ic, s, ofs, len);
  }
}

function really_input_string(ic, len) {
  var s = Caml_string.caml_create_string(len);
  really_input(ic, s, 0, len);
  return Caml_string.bytes_to_string(s);
}

function input_line(chan) {
  var build_result = function (buf, _pos, _param) {
    while(true) {
      var param = _param;
      var pos = _pos;
      if (param) {
        var hd = param[0];
        var len = hd.length;
        Caml_string.caml_blit_bytes(hd, 0, buf, pos - len | 0, len);
        _param = param[1];
        _pos = pos - len | 0;
        continue ;

      }
      else {
        return buf;
      }
    };
  };
  var scan = function (_accu, _len) {
    while(true) {
      var len = _len;
      var accu = _accu;
      var n = function () {
          throw "caml_ml_input_scan_line not implemented by bucklescript yet\n";
        }();
      if (n) {
        if (n > 0) {
          var res = Caml_string.caml_create_string(n - 1 | 0);
          (function () {
                throw "caml_ml_input not implemented by bucklescript yet\n";
              }());
          Caml_io.caml_ml_input_char(chan);
          if (accu) {
            var len$1 = (len + n | 0) - 1 | 0;
            return build_result(Caml_string.caml_create_string(len$1), len$1, /* :: */[
                        res,
                        accu
                      ]);
          }
          else {
            return res;
          }
        }
        else {
          var beg = Caml_string.caml_create_string(-n);
          (function () {
                throw "caml_ml_input not implemented by bucklescript yet\n";
              }());
          _len = len - n | 0;
          _accu = /* :: */[
            beg,
            accu
          ];
          continue ;

        }
      }
      else if (accu) {
        return build_result(Caml_string.caml_create_string(len), len, accu);
      }
      else {
        throw Caml_builtin_exceptions.end_of_file;
      }
    };
  };
  return Caml_string.bytes_to_string(scan(/* [] */0, 0));
}

function close_in_noerr() {
  try {
    return function () {
              throw "caml_ml_close_channel not implemented by bucklescript yet\n";
            }();
  }
  catch (exn){
    return /* () */0;
  }
}

function print_char(c) {
  return Caml_io.caml_ml_output_char(stdout, c);
}

function print_string(s) {
  return output_string(stdout, s);
}

function print_bytes(s) {
  return output_bytes(stdout, s);
}

function print_int(i) {
  return output_string(stdout, "" + i);
}

function print_float(f) {
  return output_string(stdout, valid_float_lexem(Caml_format.caml_format_float("%.12g", f)));
}

function print_endline(param) {
  console.log(param);
  return 0;
}

function print_newline() {
  Caml_io.caml_ml_output_char(stdout, /* "\n" */10);
  return Caml_io.caml_ml_flush(stdout);
}

function prerr_char(c) {
  return Caml_io.caml_ml_output_char(stderr, c);
}

function prerr_string(s) {
  return output_string(stderr, s);
}

function prerr_bytes(s) {
  return output_bytes(stderr, s);
}

function prerr_int(i) {
  return output_string(stderr, "" + i);
}

function prerr_float(f) {
  return output_string(stderr, valid_float_lexem(Caml_format.caml_format_float("%.12g", f)));
}

function prerr_endline(param) {
  console.error(param);
  return 0;
}

function prerr_newline() {
  Caml_io.caml_ml_output_char(stderr, /* "\n" */10);
  return Caml_io.caml_ml_flush(stderr);
}

function read_line() {
  Caml_io.caml_ml_flush(stdout);
  return input_line(stdin);
}

function read_int() {
  return Caml_format.caml_int_of_string((Caml_io.caml_ml_flush(stdout), input_line(stdin)));
}

function read_float() {
  return Caml_format.caml_float_of_string((Caml_io.caml_ml_flush(stdout), input_line(stdin)));
}

function string_of_format(param) {
  return param[1];
}

function $caret$caret(param, param$1) {
  return /* Format */[
          CamlinternalFormatBasics.concat_fmt(param[0], param$1[0]),
          $caret(param[1], $caret("%,", param$1[1]))
        ];
}

var exit_function = [flush_all];

function at_exit(f) {
  var g = exit_function[0];
  exit_function[0] = function () {
    Curry._1(f, /* () */0);
    return Curry._1(g, /* () */0);
  };
  return /* () */0;
}

function do_at_exit() {
  return Curry._1(exit_function[0], /* () */0);
}

function exit() {
  do_at_exit(/* () */0);
  return function () {
            throw "caml_sys_exit not implemented by bucklescript yet\n";
          }();
}

var max_int = 2147483647;

var infinity = Infinity;

var neg_infinity = -Infinity;

var nan = NaN;

var max_float = Number.MAX_VALUE;

var min_float = Number.MIN_VALUE;

var epsilon_float = 2.220446049250313e-16;

var flush = Caml_io.caml_ml_flush

var output_char = Caml_io.caml_ml_output_char

var output_byte = Caml_io.caml_ml_output_char

function output_binary_int(_, _$1) {
  return function () {
            throw "caml_ml_output_int not implemented by bucklescript yet\n";
          }();
}

function seek_out(_, _$1) {
  return function () {
            throw "caml_ml_seek_out not implemented by bucklescript yet\n";
          }();
}

function pos_out() {
  return function () {
            throw "caml_ml_pos_out not implemented by bucklescript yet\n";
          }();
}

function out_channel_length() {
  return function () {
            throw "caml_ml_channel_size not implemented by bucklescript yet\n";
          }();
}

function set_binary_mode_out(_, _$1) {
  return function () {
            throw "caml_ml_set_binary_mode not implemented by bucklescript yet\n";
          }();
}

var input_char = Caml_io.caml_ml_input_char

var input_byte = Caml_io.caml_ml_input_char

function input_binary_int() {
  return function () {
            throw "caml_ml_input_int not implemented by bucklescript yet\n";
          }();
}

function input_value() {
  return function () {
            throw "caml_input_value not implemented by bucklescript yet\n";
          }();
}

function seek_in(_, _$1) {
  return function () {
            throw "caml_ml_seek_in not implemented by bucklescript yet\n";
          }();
}

function pos_in() {
  return function () {
            throw "caml_ml_pos_in not implemented by bucklescript yet\n";
          }();
}

function in_channel_length() {
  return function () {
            throw "caml_ml_channel_size not implemented by bucklescript yet\n";
          }();
}

function close_in() {
  return function () {
            throw "caml_ml_close_channel not implemented by bucklescript yet\n";
          }();
}

function set_binary_mode_in(_, _$1) {
  return function () {
            throw "caml_ml_set_binary_mode not implemented by bucklescript yet\n";
          }();
}

function LargeFile_000(_, _$1) {
  return function () {
            throw "caml_ml_seek_out_64 not implemented by bucklescript yet\n";
          }();
}

function LargeFile_001() {
  return function () {
            throw "caml_ml_pos_out_64 not implemented by bucklescript yet\n";
          }();
}

function LargeFile_002() {
  return function () {
            throw "caml_ml_channel_size_64 not implemented by bucklescript yet\n";
          }();
}

function LargeFile_003(_, _$1) {
  return function () {
            throw "caml_ml_seek_in_64 not implemented by bucklescript yet\n";
          }();
}

function LargeFile_004() {
  return function () {
            throw "caml_ml_pos_in_64 not implemented by bucklescript yet\n";
          }();
}

function LargeFile_005() {
  return function () {
            throw "caml_ml_channel_size_64 not implemented by bucklescript yet\n";
          }();
}

var LargeFile = [
  LargeFile_000,
  LargeFile_001,
  LargeFile_002,
  LargeFile_003,
  LargeFile_004,
  LargeFile_005
];

exports.invalid_arg         = invalid_arg;
exports.failwith            = failwith;
exports.Exit                = Exit;
exports.min                 = min;
exports.max                 = max;
exports.abs                 = abs;
exports.max_int             = max_int;
exports.min_int             = min_int;
exports.lnot                = lnot;
exports.infinity            = infinity;
exports.neg_infinity        = neg_infinity;
exports.nan                 = nan;
exports.max_float           = max_float;
exports.min_float           = min_float;
exports.epsilon_float       = epsilon_float;
exports.$caret              = $caret;
exports.char_of_int         = char_of_int;
exports.string_of_bool      = string_of_bool;
exports.bool_of_string      = bool_of_string;
exports.string_of_int       = string_of_int;
exports.string_of_float     = string_of_float;
exports.$at                 = $at;
exports.stdin               = stdin;
exports.stdout              = stdout;
exports.stderr              = stderr;
exports.print_char          = print_char;
exports.print_string        = print_string;
exports.print_bytes         = print_bytes;
exports.print_int           = print_int;
exports.print_float         = print_float;
exports.print_endline       = print_endline;
exports.print_newline       = print_newline;
exports.prerr_char          = prerr_char;
exports.prerr_string        = prerr_string;
exports.prerr_bytes         = prerr_bytes;
exports.prerr_int           = prerr_int;
exports.prerr_float         = prerr_float;
exports.prerr_endline       = prerr_endline;
exports.prerr_newline       = prerr_newline;
exports.read_line           = read_line;
exports.read_int            = read_int;
exports.read_float          = read_float;
exports.open_out            = open_out;
exports.open_out_bin        = open_out_bin;
exports.open_out_gen        = open_out_gen;
exports.flush               = flush;
exports.flush_all           = flush_all;
exports.output_char         = output_char;
exports.output_string       = output_string;
exports.output_bytes        = output_bytes;
exports.output              = output;
exports.output_substring    = output_substring;
exports.output_byte         = output_byte;
exports.output_binary_int   = output_binary_int;
exports.output_value        = output_value;
exports.seek_out            = seek_out;
exports.pos_out             = pos_out;
exports.out_channel_length  = out_channel_length;
exports.close_out           = close_out;
exports.close_out_noerr     = close_out_noerr;
exports.set_binary_mode_out = set_binary_mode_out;
exports.open_in             = open_in;
exports.open_in_bin         = open_in_bin;
exports.open_in_gen         = open_in_gen;
exports.input_char          = input_char;
exports.input_line          = input_line;
exports.input               = input;
exports.really_input        = really_input;
exports.really_input_string = really_input_string;
exports.input_byte          = input_byte;
exports.input_binary_int    = input_binary_int;
exports.input_value         = input_value;
exports.seek_in             = seek_in;
exports.pos_in              = pos_in;
exports.in_channel_length   = in_channel_length;
exports.close_in            = close_in;
exports.close_in_noerr      = close_in_noerr;
exports.set_binary_mode_in  = set_binary_mode_in;
exports.LargeFile           = LargeFile;
exports.string_of_format    = string_of_format;
exports.$caret$caret        = $caret$caret;
exports.exit                = exit;
exports.at_exit             = at_exit;
exports.valid_float_lexem   = valid_float_lexem;
exports.unsafe_really_input = unsafe_really_input;
exports.do_at_exit          = do_at_exit;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/random.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_int64              = require("bs-platform/lib/js/caml_int64");
var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_sys                = require("bs-platform/lib/js/caml_sys");
var Pervasives              = require("bs-platform/lib/js/pervasives");
var Nativeint               = require("bs-platform/lib/js/nativeint");
var Int32                   = require("bs-platform/lib/js/int32");
var Digest                  = require("bs-platform/lib/js/digest");
var Curry                   = require("bs-platform/lib/js/curry");
var Int64                   = require("bs-platform/lib/js/int64");
var Caml_array              = require("bs-platform/lib/js/caml_array");
var $$Array                 = require("bs-platform/lib/js/array");
var Caml_string             = require("bs-platform/lib/js/caml_string");

function assign(st1, st2) {
  $$Array.blit(st2[/* st */0], 0, st1[/* st */0], 0, 55);
  st1[/* idx */1] = st2[/* idx */1];
  return /* () */0;
}

function full_init(s, seed) {
  var combine = function (accu, x) {
    return Digest.string(accu + x);
  };
  var extract = function (d) {
    return ((Caml_string.get(d, 0) + (Caml_string.get(d, 1) << 8) | 0) + (Caml_string.get(d, 2) << 16) | 0) + (Caml_string.get(d, 3) << 24) | 0;
  };
  var seed$1 = seed.length ? seed : /* int array */[0];
  var l = seed$1.length;
  for(var i = 0; i <= 54; ++i){
    s[/* st */0][i] = i;
  }
  var accu = "x";
  for(var i$1 = 0 ,i_finish = 54 + Pervasives.max(55, l) | 0; i$1 <= i_finish; ++i$1){
    var j = i$1 % 55;
    var k = i$1 % l;
    accu = combine(accu, seed$1[k]);
    s[/* st */0][j] = (s[/* st */0][j] ^ extract(accu)) & 1073741823;
  }
  s[/* idx */1] = 0;
  return /* () */0;
}

function make(seed) {
  var result = /* record */[
    /* st */Caml_array.caml_make_vect(55, 0),
    /* idx */0
  ];
  full_init(result, seed);
  return result;
}

function make_self_init() {
  return make(Caml_sys.caml_sys_random_seed(/* () */0));
}

function copy(s) {
  var result = /* record */[
    /* st */Caml_array.caml_make_vect(55, 0),
    /* idx */0
  ];
  assign(result, s);
  return result;
}

function bits(s) {
  s[/* idx */1] = (s[/* idx */1] + 1 | 0) % 55;
  var curval = s[/* st */0][s[/* idx */1]];
  var newval = s[/* st */0][(s[/* idx */1] + 24 | 0) % 55] + (curval ^ (curval >>> 25) & 31) | 0;
  var newval30 = newval & 1073741823;
  s[/* st */0][s[/* idx */1]] = newval30;
  return newval30;
}

function $$int(s, bound) {
  if (bound > 1073741823 || bound <= 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Random.int"
        ];
  }
  else {
    var s$1 = s;
    var n = bound;
    while(true) {
      var r = bits(s$1);
      var v = r % n;
      if ((r - v | 0) > ((1073741823 - n | 0) + 1 | 0)) {
        continue ;
        
      }
      else {
        return v;
      }
    };
  }
}

function int32(s, bound) {
  if (bound <= 0) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Random.int32"
        ];
  }
  else {
    var s$1 = s;
    var n = bound;
    while(true) {
      var b1 = bits(s$1);
      var b2 = ((bits(s$1) & 1) << 30);
      var r = b1 | b2;
      var v = r % n;
      if ((r - v | 0) > ((Int32.max_int - n | 0) + 1 | 0)) {
        continue ;
        
      }
      else {
        return v;
      }
    };
  }
}

function int64(s, bound) {
  if (Caml_int64.le(bound, /* int64 */[
          /* hi */0,
          /* lo */0
        ])) {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Random.int64"
        ];
  }
  else {
    var s$1 = s;
    var n = bound;
    while(true) {
      var b1 = Caml_int64.of_int32(bits(s$1));
      var b2 = Caml_int64.lsl_(Caml_int64.of_int32(bits(s$1)), 30);
      var b3 = Caml_int64.lsl_(Caml_int64.of_int32(bits(s$1) & 7), 60);
      var r_000 = /* hi */b1[0] | /* hi */b2[0] | b3[0];
      var r_001 = /* lo */((b1[1] | b2[1] | b3[1]) >>> 0);
      var r = /* int64 */[
        r_000,
        r_001
      ];
      var v = Caml_int64.mod_(r, n);
      if (Caml_int64.gt(Caml_int64.sub(r, v), Caml_int64.add(Caml_int64.sub(Int64.max_int, n), /* int64 */[
                  /* hi */0,
                  /* lo */1
                ]))) {
        continue ;
        
      }
      else {
        return v;
      }
    };
  }
}

var nativeint = Nativeint.size === 32 ? int32 : function (s, bound) {
    return int64(s, Caml_int64.of_int32(bound))[1] | 0;
  };

function rawfloat(s) {
  var r1 = bits(s);
  var r2 = bits(s);
  return (r1 / 1073741824.0 + r2) / 1073741824.0;
}

function $$float(s, bound) {
  return rawfloat(s) * bound;
}

function bool(s) {
  return +((bits(s) & 1) === 0);
}

var $$default = /* record */[
  /* st : array */[
    987910699,
    495797812,
    364182224,
    414272206,
    318284740,
    990407751,
    383018966,
    270373319,
    840823159,
    24560019,
    536292337,
    512266505,
    189156120,
    730249596,
    143776328,
    51606627,
    140166561,
    366354223,
    1003410265,
    700563762,
    981890670,
    913149062,
    526082594,
    1021425055,
    784300257,
    667753350,
    630144451,
    949649812,
    48546892,
    415514493,
    258888527,
    511570777,
    89983870,
    283659902,
    308386020,
    242688715,
    482270760,
    865188196,
    1027664170,
    207196989,
    193777847,
    619708188,
    671350186,
    149669678,
    257044018,
    87658204,
    558145612,
    183450813,
    28133145,
    901332182,
    710253903,
    510646120,
    652377910,
    409934019,
    801085050
  ],
  /* idx */0
];

function bits$1() {
  return bits($$default);
}

function $$int$1(bound) {
  return $$int($$default, bound);
}

function int32$1(bound) {
  return int32($$default, bound);
}

function nativeint$1(bound) {
  return Curry._2(nativeint, $$default, bound);
}

function int64$1(bound) {
  return int64($$default, bound);
}

function $$float$1(scale) {
  return rawfloat($$default) * scale;
}

function bool$1() {
  return bool($$default);
}

function full_init$1(seed) {
  return full_init($$default, seed);
}

function init(seed) {
  return full_init($$default, /* int array */[seed]);
}

function self_init() {
  return full_init$1(Caml_sys.caml_sys_random_seed(/* () */0));
}

function get_state() {
  return copy($$default);
}

function set_state(s) {
  return assign($$default, s);
}

var State = [
  make,
  make_self_init,
  copy,
  bits,
  $$int,
  int32,
  nativeint,
  int64,
  $$float,
  bool
];

exports.init      = init;
exports.full_init = full_init$1;
exports.self_init = self_init;
exports.bits      = bits$1;
exports.$$int     = $$int$1;
exports.int32     = int32$1;
exports.nativeint = nativeint$1;
exports.int64     = int64$1;
exports.$$float   = $$float$1;
exports.bool      = bool$1;
exports.State     = State;
exports.get_state = get_state;
exports.set_state = set_state;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/string.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Bytes       = require("bs-platform/lib/js/bytes");
var Caml_int32  = require("bs-platform/lib/js/caml_int32");
var Caml_string = require("bs-platform/lib/js/caml_string");
var List        = require("bs-platform/lib/js/list");

function make(n, c) {
  return Caml_string.bytes_to_string(Bytes.make(n, c));
}

function init(n, f) {
  return Caml_string.bytes_to_string(Bytes.init(n, f));
}

function copy(s) {
  return Caml_string.bytes_to_string(Bytes.copy(Caml_string.bytes_of_string(s)));
}

function sub(s, ofs, len) {
  return Caml_string.bytes_to_string(Bytes.sub(Caml_string.bytes_of_string(s), ofs, len));
}

function concat(sep, l) {
  if (l) {
    var hd = l[0];
    var num = [0];
    var len = [0];
    List.iter(function (s) {
          num[0] = num[0] + 1 | 0;
          len[0] = len[0] + s.length | 0;
          return /* () */0;
        }, l);
    var r = Caml_string.caml_create_string(len[0] + Caml_int32.imul(sep.length, num[0] - 1 | 0) | 0);
    Caml_string.caml_blit_string(hd, 0, r, 0, hd.length);
    var pos = [hd.length];
    List.iter(function (s) {
          Caml_string.caml_blit_string(sep, 0, r, pos[0], sep.length);
          pos[0] = pos[0] + sep.length | 0;
          Caml_string.caml_blit_string(s, 0, r, pos[0], s.length);
          pos[0] = pos[0] + s.length | 0;
          return /* () */0;
        }, l[1]);
    return Caml_string.bytes_to_string(r);
  }
  else {
    return "";
  }
}

function iter(f, s) {
  return Bytes.iter(f, Caml_string.bytes_of_string(s));
}

function iteri(f, s) {
  return Bytes.iteri(f, Caml_string.bytes_of_string(s));
}

function map(f, s) {
  return Caml_string.bytes_to_string(Bytes.map(f, Caml_string.bytes_of_string(s)));
}

function mapi(f, s) {
  return Caml_string.bytes_to_string(Bytes.mapi(f, Caml_string.bytes_of_string(s)));
}

function is_space(param) {
  var switcher = param - 9 | 0;
  if (switcher > 4 || switcher < 0) {
    if (switcher !== 23) {
      return /* false */0;
    }
    else {
      return /* true */1;
    }
  }
  else if (switcher !== 2) {
    return /* true */1;
  }
  else {
    return /* false */0;
  }
}

function trim(s) {
  if (s === "" || !(is_space(s.charCodeAt(0)) || is_space(s.charCodeAt(s.length - 1 | 0)))) {
    return s;
  }
  else {
    return Caml_string.bytes_to_string(Bytes.trim(Caml_string.bytes_of_string(s)));
  }
}

function escaped(s) {
  var needs_escape = function (_i) {
    while(true) {
      var i = _i;
      if (i >= s.length) {
        return /* false */0;
      }
      else {
        var match = s.charCodeAt(i);
        if (match >= 32) {
          var switcher = match - 34 | 0;
          if (switcher > 58 || switcher < 0) {
            if (switcher >= 93) {
              return /* true */1;
            }
            else {
              _i = i + 1 | 0;
              continue ;

            }
          }
          else if (switcher > 57 || switcher < 1) {
            return /* true */1;
          }
          else {
            _i = i + 1 | 0;
            continue ;

          }
        }
        else {
          return /* true */1;
        }
      }
    };
  };
  if (needs_escape(0)) {
    return Caml_string.bytes_to_string(Bytes.escaped(Caml_string.bytes_of_string(s)));
  }
  else {
    return s;
  }
}

function index(s, c) {
  return Bytes.index(Caml_string.bytes_of_string(s), c);
}

function rindex(s, c) {
  return Bytes.rindex(Caml_string.bytes_of_string(s), c);
}

function index_from(s, i, c) {
  return Bytes.index_from(Caml_string.bytes_of_string(s), i, c);
}

function rindex_from(s, i, c) {
  return Bytes.rindex_from(Caml_string.bytes_of_string(s), i, c);
}

function contains(s, c) {
  return Bytes.contains(Caml_string.bytes_of_string(s), c);
}

function contains_from(s, i, c) {
  return Bytes.contains_from(Caml_string.bytes_of_string(s), i, c);
}

function rcontains_from(s, i, c) {
  return Bytes.rcontains_from(Caml_string.bytes_of_string(s), i, c);
}

function uppercase(s) {
  return Caml_string.bytes_to_string(Bytes.uppercase(Caml_string.bytes_of_string(s)));
}

function lowercase(s) {
  return Caml_string.bytes_to_string(Bytes.lowercase(Caml_string.bytes_of_string(s)));
}

function capitalize(s) {
  return Caml_string.bytes_to_string(Bytes.capitalize(Caml_string.bytes_of_string(s)));
}

function uncapitalize(s) {
  return Caml_string.bytes_to_string(Bytes.uncapitalize(Caml_string.bytes_of_string(s)));
}

var compare = Caml_string.caml_string_compare

var fill = Bytes.fill;

var blit = Bytes.blit_string;

exports.make           = make;
exports.init           = init;
exports.copy           = copy;
exports.sub            = sub;
exports.fill           = fill;
exports.blit           = blit;
exports.concat         = concat;
exports.iter           = iter;
exports.iteri          = iteri;
exports.map            = map;
exports.mapi           = mapi;
exports.trim           = trim;
exports.escaped        = escaped;
exports.index          = index;
exports.rindex         = rindex;
exports.index_from     = index_from;
exports.rindex_from    = rindex_from;
exports.contains       = contains;
exports.contains_from  = contains_from;
exports.rcontains_from = rcontains_from;
exports.uppercase      = uppercase;
exports.lowercase      = lowercase;
exports.capitalize     = capitalize;
exports.uncapitalize   = uncapitalize;
exports.compare        = compare;
/* No side effect */
  })();
});

require.register("bs-platform/lib/js/sys.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_exceptions = require("/bs-platform/lib/js/caml_exceptions");

var is_js = /* true */1;

var match_001 = /* array */[];

var big_endian = /* false */0;

var unix = /* false */0;

var win32 = /* true */1;

var cygwin = /* false */0;

var max_array_length = 2147483647;

var max_string_length = 2147483647;

var interactive = [/* false */0];

function set_signal(_, _$1) {
  return /* () */0;
}

var Break = Caml_exceptions.create("Sys.Break");

function catch_break() {
  return /* () */0;
}

var argv = match_001;

var executable_name = "cmd";

var os_type = "Win32";

var word_size = 32;

var sigabrt = -1;

var sigalrm = -2;

var sigfpe = -3;

var sighup = -4;

var sigill = -5;

var sigint = -6;

var sigkill = -7;

var sigpipe = -8;

var sigquit = -9;

var sigsegv = -10;

var sigterm = -11;

var sigusr1 = -12;

var sigusr2 = -13;

var sigchld = -14;

var sigcont = -15;

var sigstop = -16;

var sigtstp = -17;

var sigttin = -18;

var sigttou = -19;

var sigvtalrm = -20;

var sigprof = -21;

var ocaml_version = "4.02.3+dev1-2015-07-10";

exports.argv              = argv;
exports.executable_name   = executable_name;
exports.interactive       = interactive;
exports.os_type           = os_type;
exports.unix              = unix;
exports.win32             = win32;
exports.cygwin            = cygwin;
exports.word_size         = word_size;
exports.big_endian        = big_endian;
exports.is_js             = is_js;
exports.max_string_length = max_string_length;
exports.max_array_length  = max_array_length;
exports.set_signal        = set_signal;
exports.sigabrt           = sigabrt;
exports.sigalrm           = sigalrm;
exports.sigfpe            = sigfpe;
exports.sighup            = sighup;
exports.sigill            = sigill;
exports.sigint            = sigint;
exports.sigkill           = sigkill;
exports.sigpipe           = sigpipe;
exports.sigquit           = sigquit;
exports.sigsegv           = sigsegv;
exports.sigterm           = sigterm;
exports.sigusr1           = sigusr1;
exports.sigusr2           = sigusr2;
exports.sigchld           = sigchld;
exports.sigcont           = sigcont;
exports.sigstop           = sigstop;
exports.sigtstp           = sigtstp;
exports.sigttin           = sigttin;
exports.sigttou           = sigttou;
exports.sigvtalrm         = sigvtalrm;
exports.sigprof           = sigprof;
exports.Break             = Break;
exports.catch_break       = catch_break;
exports.ocaml_version     = ocaml_version;
/* No side effect */
  })();
});

require.register("process/browser.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "process");
  (function() {
    // shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };
  })();
});
require.register("src/counter.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
var Curry    = require("bs-platform/lib/js/curry");
var Tea      = require("./tea");
var Vdom     = require("./vdom");

function init() {
  return 4;
}

function update(model, param) {
  if (typeof param === "number") {
    switch (param) {
      case 0 : 
          return model + 1 | 0;
      case 1 : 
          return model - 1 | 0;
      case 2 : 
          return 0;
      
    }
  }
  else {
    return param[0];
  }
}

function view_button(title, $staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[key], msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(lift, model) {
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* Style */Block.__(4, [/* :: */[
                    /* tuple */[
                      "display",
                      "inline-block"
                    ],
                    /* :: */[
                      /* tuple */[
                        "vertical-align",
                        "top"
                      ],
                      /* [] */0
                    ]
                  ]]),
              /* [] */0
            ], /* :: */[
              Tea_html.span(/* None */0, /* None */0, /* :: */[
                    Vdom.style("text-weight", "bold"),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["" + model]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.br(/* [] */0),
                /* :: */[
                  view_button("Increment", /* None */0, Curry._1(lift, /* Increment */0)),
                  /* :: */[
                    Tea_html.br(/* [] */0),
                    /* :: */[
                      view_button("Decrement", /* None */0, Curry._1(lift, /* Decrement */1)),
                      /* :: */[
                        Tea_html.br(/* [] */0),
                        /* :: */[
                          view_button("Set to 42", /* None */0, Curry._1(lift, /* Set */[42])),
                          /* :: */[
                            Tea_html.br(/* [] */0),
                            /* :: */[
                              model !== 0 ? view_button("Reset", /* None */0, Curry._1(lift, /* Reset */2)) : Tea_html.noNode,
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]);
}

exports.init        = init;
exports.update      = update;
exports.view_button = view_button;
exports.view        = view;
/* Tea Not a pure module */

});

;require.register("src/counterParts.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Tea_html                = require("./tea_html");
var Block                   = require("bs-platform/lib/js/block");
var Curry                   = require("bs-platform/lib/js/curry");
var Tea                     = require("./tea");
var Vdom                    = require("./vdom");

function height(param) {
  if (param) {
    return param[4];
  }
  else {
    return 0;
  }
}

function create(l, x, d, r) {
  var hl = height(l);
  var hr = height(r);
  return /* Node */[
          l,
          x,
          d,
          r,
          hl >= hr ? hl + 1 | 0 : hr + 1 | 0
        ];
}

function singleton(x, d) {
  return /* Node */[
          /* Empty */0,
          x,
          d,
          /* Empty */0,
          1
        ];
}

function bal(l, x, d, r) {
  var hl = l ? l[4] : 0;
  var hr = r ? r[4] : 0;
  if (hl > (hr + 2 | 0)) {
    if (l) {
      var lr = l[3];
      var ld = l[2];
      var lv = l[1];
      var ll = l[0];
      if (height(ll) >= height(lr)) {
        return create(ll, lv, ld, create(lr, x, d, r));
      }
      else if (lr) {
        return create(create(ll, lv, ld, lr[0]), lr[1], lr[2], create(lr[3], x, d, r));
      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "Map.bal"
            ];
      }
    }
    else {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "Map.bal"
          ];
    }
  }
  else if (hr > (hl + 2 | 0)) {
    if (r) {
      var rr = r[3];
      var rd = r[2];
      var rv = r[1];
      var rl = r[0];
      if (height(rr) >= height(rl)) {
        return create(create(l, x, d, rl), rv, rd, rr);
      }
      else if (rl) {
        return create(create(l, x, d, rl[0]), rl[1], rl[2], create(rl[3], rv, rd, rr));
      }
      else {
        throw [
              Caml_builtin_exceptions.invalid_argument,
              "Map.bal"
            ];
      }
    }
    else {
      throw [
            Caml_builtin_exceptions.invalid_argument,
            "Map.bal"
          ];
    }
  }
  else {
    return /* Node */[
            l,
            x,
            d,
            r,
            hl >= hr ? hl + 1 | 0 : hr + 1 | 0
          ];
  }
}

function is_empty(param) {
  if (param) {
    return /* false */0;
  }
  else {
    return /* true */1;
  }
}

function add(x, data, param) {
  if (param) {
    var r = param[3];
    var d = param[2];
    var v = param[1];
    var l = param[0];
    var c = Caml_obj.caml_compare(x, v);
    if (c) {
      if (c < 0) {
        return bal(add(x, data, l), v, d, r);
      }
      else {
        return bal(l, v, d, add(x, data, r));
      }
    }
    else {
      return /* Node */[
              l,
              x,
              data,
              r,
              param[4]
            ];
    }
  }
  else {
    return /* Node */[
            /* Empty */0,
            x,
            data,
            /* Empty */0,
            1
          ];
  }
}

function find(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      var c = Caml_obj.caml_compare(x, param[1]);
      if (c) {
        _param = c < 0 ? param[0] : param[3];
        continue ;
        
      }
      else {
        return param[2];
      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function mem(x, _param) {
  while(true) {
    var param = _param;
    if (param) {
      var c = Caml_obj.caml_compare(x, param[1]);
      if (c) {
        _param = c < 0 ? param[0] : param[3];
        continue ;
        
      }
      else {
        return /* true */1;
      }
    }
    else {
      return /* false */0;
    }
  };
}

function min_binding(_param) {
  while(true) {
    var param = _param;
    if (param) {
      var l = param[0];
      if (l) {
        _param = l;
        continue ;
        
      }
      else {
        return /* tuple */[
                param[1],
                param[2]
              ];
      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function max_binding(_param) {
  while(true) {
    var param = _param;
    if (param) {
      var r = param[3];
      if (r) {
        _param = r;
        continue ;
        
      }
      else {
        return /* tuple */[
                param[1],
                param[2]
              ];
      }
    }
    else {
      throw Caml_builtin_exceptions.not_found;
    }
  };
}

function remove_min_binding(param) {
  if (param) {
    var l = param[0];
    if (l) {
      return bal(remove_min_binding(l), param[1], param[2], param[3]);
    }
    else {
      return param[3];
    }
  }
  else {
    throw [
          Caml_builtin_exceptions.invalid_argument,
          "Map.remove_min_elt"
        ];
  }
}

function remove(x, param) {
  if (param) {
    var r = param[3];
    var d = param[2];
    var v = param[1];
    var l = param[0];
    var c = Caml_obj.caml_compare(x, v);
    if (c) {
      if (c < 0) {
        return bal(remove(x, l), v, d, r);
      }
      else {
        return bal(l, v, d, remove(x, r));
      }
    }
    else {
      var t1 = l;
      var t2 = r;
      if (t1) {
        if (t2) {
          var match = min_binding(t2);
          return bal(t1, match[0], match[1], remove_min_binding(t2));
        }
        else {
          return t1;
        }
      }
      else {
        return t2;
      }
    }
  }
  else {
    return /* Empty */0;
  }
}

function iter(f, _param) {
  while(true) {
    var param = _param;
    if (param) {
      iter(f, param[0]);
      Curry._2(f, param[1], param[2]);
      _param = param[3];
      continue ;
      
    }
    else {
      return /* () */0;
    }
  };
}

function map(f, param) {
  if (param) {
    var l$prime = map(f, param[0]);
    var d$prime = Curry._1(f, param[2]);
    var r$prime = map(f, param[3]);
    return /* Node */[
            l$prime,
            param[1],
            d$prime,
            r$prime,
            param[4]
          ];
  }
  else {
    return /* Empty */0;
  }
}

function mapi(f, param) {
  if (param) {
    var v = param[1];
    var l$prime = mapi(f, param[0]);
    var d$prime = Curry._2(f, v, param[2]);
    var r$prime = mapi(f, param[3]);
    return /* Node */[
            l$prime,
            v,
            d$prime,
            r$prime,
            param[4]
          ];
  }
  else {
    return /* Empty */0;
  }
}

function fold(f, _m, _accu) {
  while(true) {
    var accu = _accu;
    var m = _m;
    if (m) {
      _accu = Curry._3(f, m[1], m[2], fold(f, m[0], accu));
      _m = m[3];
      continue ;
      
    }
    else {
      return accu;
    }
  };
}

function for_all(p, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Curry._2(p, param[1], param[2])) {
        if (for_all(p, param[0])) {
          _param = param[3];
          continue ;
          
        }
        else {
          return /* false */0;
        }
      }
      else {
        return /* false */0;
      }
    }
    else {
      return /* true */1;
    }
  };
}

function exists(p, _param) {
  while(true) {
    var param = _param;
    if (param) {
      if (Curry._2(p, param[1], param[2])) {
        return /* true */1;
      }
      else if (exists(p, param[0])) {
        return /* true */1;
      }
      else {
        _param = param[3];
        continue ;
        
      }
    }
    else {
      return /* false */0;
    }
  };
}

function add_min_binding(k, v, param) {
  if (param) {
    return bal(add_min_binding(k, v, param[0]), param[1], param[2], param[3]);
  }
  else {
    return singleton(k, v);
  }
}

function add_max_binding(k, v, param) {
  if (param) {
    return bal(param[0], param[1], param[2], add_max_binding(k, v, param[3]));
  }
  else {
    return singleton(k, v);
  }
}

function join(l, v, d, r) {
  if (l) {
    if (r) {
      var rh = r[4];
      var lh = l[4];
      if (lh > (rh + 2 | 0)) {
        return bal(l[0], l[1], l[2], join(l[3], v, d, r));
      }
      else if (rh > (lh + 2 | 0)) {
        return bal(join(l, v, d, r[0]), r[1], r[2], r[3]);
      }
      else {
        return create(l, v, d, r);
      }
    }
    else {
      return add_max_binding(v, d, l);
    }
  }
  else {
    return add_min_binding(v, d, r);
  }
}

function concat(t1, t2) {
  if (t1) {
    if (t2) {
      var match = min_binding(t2);
      return join(t1, match[0], match[1], remove_min_binding(t2));
    }
    else {
      return t1;
    }
  }
  else {
    return t2;
  }
}

function concat_or_join(t1, v, d, t2) {
  if (d) {
    return join(t1, v, d[0], t2);
  }
  else {
    return concat(t1, t2);
  }
}

function split(x, param) {
  if (param) {
    var r = param[3];
    var d = param[2];
    var v = param[1];
    var l = param[0];
    var c = Caml_obj.caml_compare(x, v);
    if (c) {
      if (c < 0) {
        var match = split(x, l);
        return /* tuple */[
                match[0],
                match[1],
                join(match[2], v, d, r)
              ];
      }
      else {
        var match$1 = split(x, r);
        return /* tuple */[
                join(l, v, d, match$1[0]),
                match$1[1],
                match$1[2]
              ];
      }
    }
    else {
      return /* tuple */[
              l,
              /* Some */[d],
              r
            ];
    }
  }
  else {
    return /* tuple */[
            /* Empty */0,
            /* None */0,
            /* Empty */0
          ];
  }
}

function merge(f, s1, s2) {
  var exit = 0;
  if (s1) {
    var v1 = s1[1];
    if (s1[4] >= height(s2)) {
      var match = split(v1, s2);
      return concat_or_join(merge(f, s1[0], match[0]), v1, Curry._3(f, v1, /* Some */[s1[2]], match[1]), merge(f, s1[3], match[2]));
    }
    else {
      exit = 1;
    }
  }
  else if (s2) {
    exit = 1;
  }
  else {
    return /* Empty */0;
  }
  if (exit === 1) {
    if (s2) {
      var v2 = s2[1];
      var match$1 = split(v2, s1);
      return concat_or_join(merge(f, match$1[0], s2[0]), v2, Curry._3(f, v2, match$1[1], /* Some */[s2[2]]), merge(f, match$1[2], s2[3]));
    }
    else {
      throw [
            Caml_builtin_exceptions.assert_failure,
            [
              "map.ml",
              270,
              10
            ]
          ];
    }
  }
  
}

function filter(p, param) {
  if (param) {
    var d = param[2];
    var v = param[1];
    var l$prime = filter(p, param[0]);
    var pvd = Curry._2(p, v, d);
    var r$prime = filter(p, param[3]);
    if (pvd) {
      return join(l$prime, v, d, r$prime);
    }
    else {
      return concat(l$prime, r$prime);
    }
  }
  else {
    return /* Empty */0;
  }
}

function partition(p, param) {
  if (param) {
    var d = param[2];
    var v = param[1];
    var match = partition(p, param[0]);
    var lf = match[1];
    var lt = match[0];
    var pvd = Curry._2(p, v, d);
    var match$1 = partition(p, param[3]);
    var rf = match$1[1];
    var rt = match$1[0];
    if (pvd) {
      return /* tuple */[
              join(lt, v, d, rt),
              concat(lf, rf)
            ];
    }
    else {
      return /* tuple */[
              concat(lt, rt),
              join(lf, v, d, rf)
            ];
    }
  }
  else {
    return /* tuple */[
            /* Empty */0,
            /* Empty */0
          ];
  }
}

function cons_enum(_m, _e) {
  while(true) {
    var e = _e;
    var m = _m;
    if (m) {
      _e = /* More */[
        m[1],
        m[2],
        m[3],
        e
      ];
      _m = m[0];
      continue ;
      
    }
    else {
      return e;
    }
  };
}

function compare(cmp, m1, m2) {
  var _e1 = cons_enum(m1, /* End */0);
  var _e2 = cons_enum(m2, /* End */0);
  while(true) {
    var e2 = _e2;
    var e1 = _e1;
    if (e1) {
      if (e2) {
        var c = Caml_obj.caml_compare(e1[0], e2[0]);
        if (c !== 0) {
          return c;
        }
        else {
          var c$1 = Curry._2(cmp, e1[1], e2[1]);
          if (c$1 !== 0) {
            return c$1;
          }
          else {
            _e2 = cons_enum(e2[2], e2[3]);
            _e1 = cons_enum(e1[2], e1[3]);
            continue ;
            
          }
        }
      }
      else {
        return 1;
      }
    }
    else if (e2) {
      return -1;
    }
    else {
      return 0;
    }
  };
}

function equal(cmp, m1, m2) {
  var _e1 = cons_enum(m1, /* End */0);
  var _e2 = cons_enum(m2, /* End */0);
  while(true) {
    var e2 = _e2;
    var e1 = _e1;
    if (e1) {
      if (e2) {
        if (Caml_obj.caml_compare(e1[0], e2[0])) {
          return /* false */0;
        }
        else if (Curry._2(cmp, e1[1], e2[1])) {
          _e2 = cons_enum(e2[2], e2[3]);
          _e1 = cons_enum(e1[2], e1[3]);
          continue ;
          
        }
        else {
          return /* false */0;
        }
      }
      else {
        return /* false */0;
      }
    }
    else if (e2) {
      return /* false */0;
    }
    else {
      return /* true */1;
    }
  };
}

function cardinal(param) {
  if (param) {
    return (cardinal(param[0]) + 1 | 0) + cardinal(param[3]) | 0;
  }
  else {
    return 0;
  }
}

function bindings_aux(_accu, _param) {
  while(true) {
    var param = _param;
    var accu = _accu;
    if (param) {
      _param = param[0];
      _accu = /* :: */[
        /* tuple */[
          param[1],
          param[2]
        ],
        bindings_aux(accu, param[3])
      ];
      continue ;
      
    }
    else {
      return accu;
    }
  };
}

function bindings(s) {
  return bindings_aux(/* [] */0, s);
}

var IntMap = [
  /* Empty */0,
  is_empty,
  mem,
  add,
  singleton,
  remove,
  merge,
  compare,
  equal,
  iter,
  fold,
  for_all,
  exists,
  filter,
  partition,
  cardinal,
  bindings,
  min_binding,
  max_binding,
  min_binding,
  split,
  find,
  map,
  mapi
];

function init(defaultValue, lift) {
  return /* record */[
          /* values : Empty */0,
          /* defaultValue */defaultValue,
          /* lift */lift
        ];
}

function get_value(id, model) {
  if (mem(id, model[/* values */0])) {
    return find(id, model[/* values */0]);
  }
  else {
    return model[/* defaultValue */1];
  }
}

function put_value(id, value, model) {
  return /* record */[
          /* values */add(id, value, model[/* values */0]),
          /* defaultValue */model[/* defaultValue */1],
          /* lift */model[/* lift */2]
        ];
}

function mutate_value(id, op, model) {
  var value = get_value(id, model);
  return put_value(id, Curry._1(op, value), model);
}

function remove_value(id, model) {
  return /* record */[
          /* values */remove(id, model[/* values */0]),
          /* defaultValue */model[/* defaultValue */1],
          /* lift */model[/* lift */2]
        ];
}

function update(model, param) {
  switch (param.tag | 0) {
    case 0 : 
        return mutate_value(param[0], function (param) {
                    return 1 + param | 0;
                  }, model);
    case 1 : 
        return mutate_value(param[0], function (i) {
                    return i - 1 | 0;
                  }, model);
    case 2 : 
        return put_value(param[0], 0, model);
    case 3 : 
        return put_value(param[0], param[1], model);
    case 4 : 
        return remove_value(param[0], model);
    
  }
}

function shutdown(model, id) {
  var msg = Curry._1(model[/* lift */2], /* Shutdown */Block.__(4, [id]));
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              return Curry._1(enqueue, msg);
            }]);
}

function view_button(title, $staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[key], msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(id, model) {
  var lift = model[/* lift */2];
  var value = get_value(id, model);
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* Style */Block.__(4, [/* :: */[
                    /* tuple */[
                      "display",
                      "inline-block"
                    ],
                    /* :: */[
                      /* tuple */[
                        "vertical-align",
                        "top"
                      ],
                      /* [] */0
                    ]
                  ]]),
              /* [] */0
            ], /* :: */[
              Tea_html.span(/* None */0, /* None */0, /* :: */[
                    Vdom.style("text-weight", "bold"),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["" + value]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.br(/* [] */0),
                /* :: */[
                  view_button("Increment", /* None */0, Curry._1(lift, /* Increment */Block.__(0, [id]))),
                  /* :: */[
                    Tea_html.br(/* [] */0),
                    /* :: */[
                      view_button("Decrement", /* None */0, Curry._1(lift, /* Decrement */Block.__(1, [id]))),
                      /* :: */[
                        Tea_html.br(/* [] */0),
                        /* :: */[
                          view_button("Set to 42", /* None */0, Curry._1(lift, /* Set */Block.__(3, [
                                      id,
                                      42
                                    ]))),
                          /* :: */[
                            Tea_html.br(/* [] */0),
                            /* :: */[
                              value !== 0 ? view_button("Reset", /* None */0, Curry._1(lift, /* Reset */Block.__(2, [id]))) : Tea_html.noNode,
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]);
}

exports.IntMap       = IntMap;
exports.init         = init;
exports.get_value    = get_value;
exports.put_value    = put_value;
exports.mutate_value = mutate_value;
exports.remove_value = remove_value;
exports.update       = update;
exports.shutdown     = shutdown;
exports.view_button  = view_button;
exports.view         = view;
/* Tea Not a pure module */

});

;require.register("src/effect_time.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block      = require("bs-platform/lib/js/block");
var Curry      = require("bs-platform/lib/js/curry");
var Tea        = require("./tea");
var Web_window = require("./web_window");

function every(interval, tagger) {
  return /* Every */[
          interval,
          tagger
        ];
}

function delay(msTime, msg) {
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              Web_window.setTimeout(function () {
                    return Curry._1(enqueue, msg);
                  }, msTime);
              return /* () */0;
            }]);
}

exports.every = every;
exports.delay = delay;
/* Tea Not a pure module */

});

;require.register("src/fib.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function fib(n) {
  var _n = n;
  var _a = 1;
  var _b = 1;
  while(true) {
    var b = _b;
    var a = _a;
    var n$1 = _n;
    if (n$1) {
      _b = a + b | 0;
      _a = b;
      _n = n$1 - 1 | 0;
      continue ;
      
    }
    else {
      return a;
    }
  };
}

exports.fib = fib;
/* No side effect */

});

;require.register("src/main_clock.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
var Tea_time = require("./tea_time");
var Tea      = require("./tea");

function init() {
  return /* tuple */[
          Date.now(),
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (param) {
    return /* tuple */[
            param[0],
            /* NoCmd */0
          ];
  }
  else {
    return /* tuple */[
            model,
            /* NoCmd */0
          ];
  }
}

function subscriptions() {
  return Tea_time.every(16, function (t) {
              return /* Time */[t];
            });
}

function view(model) {
  var ms = model % 1000.0 | 0;
  var sec$prime = model / 1000.0 | 0;
  var sec = sec$prime % 60;
  var min$prime = sec$prime / 60 | 0;
  var min = min$prime % 60;
  var hrs$prime = min$prime / 60 | 0;
  var hrs = hrs$prime % 24;
  return Tea_html.span(/* None */0, /* None */0, /* [] */0, /* :: */[
              /* Text */Block.__(0, [hrs + (":" + (min + (":" + (sec + ("." + ms)))))]),
              /* [] */0
            ]);
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  /* subscriptions */subscriptions
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.init          = init;
exports.update        = update;
exports.subscriptions = subscriptions;
exports.view          = view;
exports.main          = main;
/* Tea Not a pure module */

});

;require.register("src/main_clock_svg.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app    = require("./tea_app");
var Pervasives = require("bs-platform/lib/js/pervasives");
var Tea_svg    = require("./tea_svg");
var Block      = require("bs-platform/lib/js/block");
var Tea_time   = require("./tea_time");
var Tea        = require("./tea");

function init() {
  return /* tuple */[
          Date.now(),
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (param) {
    return /* tuple */[
            param[0],
            /* NoCmd */0
          ];
  }
  else {
    return /* tuple */[
            model,
            /* NoCmd */0
          ];
  }
}

function subscriptions() {
  return Tea_time.every(16, function (t) {
              return /* Time */[t];
            });
}

var tau = 8.0 * Math.atan(1.0);

function view(model) {
  var angle = tau * Tea_time.inMinutes(model);
  var handX = Pervasives.string_of_float(50.0 + 40.0 * Math.cos(angle));
  var handY = Pervasives.string_of_float(50.0 + 40.0 * Math.sin(angle));
  return Tea_svg.svg(/* None */0, /* None */0, /* :: */[
              /* Attribute */Block.__(1, [
                  "",
                  "viewBox",
                  "0 0 100 100"
                ]),
              /* :: */[
                /* Attribute */Block.__(1, [
                    "",
                    "width",
                    "300px"
                  ]),
                /* [] */0
              ]
            ], /* :: */[
              Tea_svg.circle(/* None */0, /* None */0, /* :: */[
                    /* Attribute */Block.__(1, [
                        "",
                        "cx",
                        "50"
                      ]),
                    /* :: */[
                      /* Attribute */Block.__(1, [
                          "",
                          "cy",
                          "50"
                        ]),
                      /* :: */[
                        /* Attribute */Block.__(1, [
                            "",
                            "r",
                            "45"
                          ]),
                        /* :: */[
                          /* Attribute */Block.__(1, [
                              "",
                              "fill",
                              "#0B79CE"
                            ]),
                          /* [] */0
                        ]
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_svg.line(/* None */0, /* None */0, /* :: */[
                      /* Attribute */Block.__(1, [
                          "",
                          "x1",
                          "50"
                        ]),
                      /* :: */[
                        /* Attribute */Block.__(1, [
                            "",
                            "y1",
                            "50"
                          ]),
                        /* :: */[
                          /* Attribute */Block.__(1, [
                              "",
                              "x2",
                              handX
                            ]),
                          /* :: */[
                            /* Attribute */Block.__(1, [
                                "",
                                "y2",
                                handY
                              ]),
                            /* :: */[
                              /* Attribute */Block.__(1, [
                                  "",
                                  "stroke",
                                  "#023963"
                                ]),
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  /* subscriptions */subscriptions
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.init          = init;
exports.update        = update;
exports.subscriptions = subscriptions;
exports.tau           = tau;
exports.view          = view;
exports.main          = main;
/* tau Not a pure module */

});

;require.register("src/main_counter.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
var Tea      = require("./tea");
var Vdom     = require("./vdom");

function update(model, param) {
  if (typeof param === "number") {
    switch (param) {
      case 0 : 
          return model + 1 | 0;
      case 1 : 
          return model - 1 | 0;
      case 2 : 
          return 0;
      
    }
  }
  else {
    return param[0];
  }
}

function view_button(title, msg) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* None */0, msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.span(/* None */0, /* None */0, /* :: */[
                    Vdom.style("text-weight", "bold"),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["" + model]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.br(/* [] */0),
                /* :: */[
                  view_button("Increment", /* Increment */0),
                  /* :: */[
                    Tea_html.br(/* [] */0),
                    /* :: */[
                      view_button("Decrement", /* Decrement */1),
                      /* :: */[
                        Tea_html.br(/* [] */0),
                        /* :: */[
                          view_button("Set to 42", /* Set */[42]),
                          /* :: */[
                            Tea_html.br(/* [] */0),
                            /* :: */[
                              model !== 0 ? view_button("Reset", /* Reset */2) : Tea_html.noNode,
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]);
}

var partial_arg = /* record */[
  /* model */4,
  /* update */update,
  /* view */view
];

function main(param, param$1) {
  return Tea_app.beginnerProgram(partial_arg, param, param$1);
}

exports.update      = update;
exports.view_button = view_button;
exports.view        = view;
exports.main        = main;
/* Tea Not a pure module */

});

;require.register("src/main_counter_navigation.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_navigation = require("./tea_navigation");
var Tea_html       = require("./tea_html");
var Caml_format    = require("bs-platform/lib/js/caml_format");
var Block          = require("bs-platform/lib/js/block");
var Tea            = require("./tea");
var Vdom           = require("./vdom");
var $$String       = require("bs-platform/lib/js/string");

function toUrl(count) {
  return "#/" + count;
}

function fromUrl(url) {
  try {
    return /* Some */[Caml_format.caml_int_of_string($$String.sub(url, 2, url.length - 2 | 0))];
  }
  catch (exn){
    return /* None */0;
  }
}

function update(model, msg) {
  var newModel;
  if (typeof msg === "number") {
    switch (msg) {
      case 0 : 
          newModel = model + 1 | 0;
          break;
      case 1 : 
          newModel = model - 1 | 0;
          break;
      case 2 : 
          newModel = 0;
          break;
      
    }
  }
  else {
    newModel = msg[0];
  }
  return /* tuple */[
          model,
          Tea_navigation.newUrl("#/" + newModel)
        ];
}

function view_button(title, msg) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* None */0, msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.span(/* None */0, /* None */0, /* :: */[
                    Vdom.style("text-weight", "bold"),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["" + model]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.br(/* [] */0),
                /* :: */[
                  view_button("Increment", /* Increment */0),
                  /* :: */[
                    Tea_html.br(/* [] */0),
                    /* :: */[
                      view_button("Decrement", /* Decrement */1),
                      /* :: */[
                        Tea_html.br(/* [] */0),
                        /* :: */[
                          view_button("Set to 42", /* Set */[42]),
                          /* :: */[
                            Tea_html.br(/* [] */0),
                            /* :: */[
                              model !== 0 ? view_button("Reset", /* Reset */2) : Tea_html.noNode,
                              /* [] */0
                            ]
                          ]
                        ]
                      ]
                    ]
                  ]
                ]
              ]
            ]);
}

function urlParser($$location) {
  return fromUrl($$location[/* hash */7]);
}

function urlUpdate(model, param) {
  if (param) {
    return /* tuple */[
            param[0],
            /* NoCmd */0
          ];
  }
  else {
    return /* tuple */[
            model,
            Tea_navigation.modifyUrl("#/" + model)
          ];
  }
}

function init(_, result) {
  return urlUpdate(0, result);
}

var main = Tea_navigation.navigationProgram(urlParser, /* record */[
      /* urlUpdate */urlUpdate,
      /* init */init,
      /* update */update,
      /* view */view,
      /* subscriptions */function () {
        return /* NoSub */0;
      },
      /* shutdown */function () {
        return /* NoCmd */0;
      }
    ]);

exports.toUrl       = toUrl;
exports.fromUrl     = fromUrl;
exports.update      = update;
exports.view_button = view_button;
exports.view        = view;
exports.urlParser   = urlParser;
exports.urlUpdate   = urlUpdate;
exports.init        = init;
exports.main        = main;
/* main Not a pure module */

});

;require.register("src/main_embeddedCounters.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
var Tea      = require("./tea");
var List     = require("bs-platform/lib/js/list");
var Counter  = require("./counter");

function update(model, param) {
  if (typeof param === "number") {
    if (param !== 0) {
      return /* record */[/* counters */List.tl(model[/* counters */0])];
    }
    else {
      return /* record */[/* counters : :: */[
                4,
                model[/* counters */0]
              ]];
    }
  }
  else {
    var ms = param[1];
    var idx = param[0];
    console.log(/* tuple */[
          model,
          idx,
          ms
        ]);
    return /* record */[/* counters */List.mapi(function (i, m) {
                  if (i !== idx) {
                    return m;
                  }
                  else {
                    return Counter.update(m, ms);
                  }
                }, model[/* counters */0])];
  }
}

function view_button(title, $staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[key], msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.button(/* None */0, /* None */0, /* :: */[
                    Tea_html.onClick(/* None */0, /* AddCounter */0),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["Prepend a Counter"]),
                    /* [] */0
                  ]),
              /* :: */[
                List.length(model[/* counters */0]) ? Tea_html.button(/* None */0, /* None */0, /* :: */[
                        Tea_html.onClick(/* None */0, /* RemoveCounter */1),
                        /* [] */0
                      ], /* :: */[
                        /* Text */Block.__(0, ["Delete a Counter"]),
                        /* [] */0
                      ]) : Tea_html.noNode,
                /* :: */[
                  Tea_html.div(/* None */0, /* None */0, /* [] */0, List.mapi(function (i, mo) {
                            return Counter.view(function (ms) {
                                        return /* Counter */[
                                                i,
                                                ms
                                              ];
                                      }, mo);
                          }, model[/* counters */0])),
                  /* [] */0
                ]
              ]
            ]);
}

var partial_arg_000 = /* model : record */[/* counters : [] */0];

var partial_arg = /* record */[
  partial_arg_000,
  /* update */update,
  /* view */view
];

function main(param, param$1) {
  return Tea_app.beginnerProgram(partial_arg, param, param$1);
}

exports.update      = update;
exports.view_button = view_button;
exports.view        = view;
exports.main        = main;
/* Tea Not a pure module */

});

;require.register("src/main_embeddedCountersParts.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app      = require("./tea_app");
var Tea_html     = require("./tea_html");
var Block        = require("bs-platform/lib/js/block");
var Tea          = require("./tea");
var CounterParts = require("./counterParts");

function init() {
  return /* tuple */[
          /* record */[
            /* counters : record */[
              /* values : Empty */0,
              /* defaultValue */4,
              /* lift */function (sm) {
                return /* Counters */[sm];
              }
            ],
            /* count */0
          ],
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (typeof param === "number") {
    if (param !== 0) {
      return /* tuple */[
              /* record */[
                /* counters */model[/* counters */0],
                /* count */model[/* count */1] - 1 | 0
              ],
              CounterParts.shutdown(model[/* counters */0], model[/* count */1])
            ];
    }
    else {
      return /* tuple */[
              /* record */[
                /* counters */model[/* counters */0],
                /* count */model[/* count */1] + 1 | 0
              ],
              /* NoCmd */0
            ];
    }
  }
  else {
    var cMsg = param[0];
    console.log(/* tuple */[
          model,
          cMsg
        ]);
    return /* tuple */[
            /* record */[
              /* counters */CounterParts.update(model[/* counters */0], cMsg),
              /* count */model[/* count */1]
            ],
            /* NoCmd */0
          ];
  }
}

function view_button(title, $staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[key], msg),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(model) {
  var showCounter = function () {
    var _l = /* [] */0;
    var a = 1;
    var _b = model[/* count */1];
    while(true) {
      var b = _b;
      var l = _l;
      if (a > b) {
        return l;
      }
      else {
        _b = b - 1 | 0;
        _l = /* :: */[
          CounterParts.view(b, model[/* counters */0]),
          l
        ];
        continue ;
        
      }
    };
  };
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.button(/* None */0, /* None */0, /* :: */[
                    Tea_html.onClick(/* None */0, /* AddCounter */0),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["Append a Counter"]),
                    /* [] */0
                  ]),
              /* :: */[
                model[/* count */1] ? Tea_html.button(/* None */0, /* None */0, /* :: */[
                        Tea_html.onClick(/* None */0, /* RemoveCounter */1),
                        /* [] */0
                      ], /* :: */[
                        /* Text */Block.__(0, ["Delete a Counter"]),
                        /* [] */0
                      ]) : Tea_html.noNode,
                /* :: */[
                  Tea_html.div(/* None */0, /* None */0, /* [] */0, showCounter(/* () */0)),
                  /* [] */0
                ]
              ]
            ]);
}

function partial_arg_003() {
  return /* NoSub */0;
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  partial_arg_003
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.init        = init;
exports.update      = update;
exports.view_button = view_button;
exports.view        = view;
exports.main        = main;
/* Tea Not a pure module */

});

;require.register("src/main_entry.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';



/* No side effect */

});

;require.register("src/main_field.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Bytes       = require("bs-platform/lib/js/bytes");
var Tea_app     = require("./tea_app");
var Tea_html    = require("./tea_html");
var Block       = require("bs-platform/lib/js/block");
var Tea         = require("./tea");
var Caml_string = require("bs-platform/lib/js/caml_string");

function update(_, param) {
  return param[0];
}

var myStyle = /* Style */Block.__(4, [/* :: */[
      /* tuple */[
        "width",
        "100%"
      ],
      /* :: */[
        /* tuple */[
          "height",
          "40px"
        ],
        /* :: */[
          /* tuple */[
            "padding",
            "10px 0"
          ],
          /* :: */[
            /* tuple */[
              "font-size",
              "2em"
            ],
            /* :: */[
              /* tuple */[
                "text-align",
                "center"
              ],
              /* [] */0
            ]
          ]
        ]
      ]
    ]]);

function view(content) {
  var string_rev = function (s) {
    var len = s.length;
    var f = function (i) {
      return Caml_string.get(s, (len - 1 | 0) - i | 0);
    };
    return Caml_string.bytes_to_string(Bytes.init(len, f));
  };
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "placeholder",
                        "Text to reverse"
                      ]),
                    /* :: */[
                      Tea_html.onInput(/* None */0, function (s) {
                            return /* NewContent */[s];
                          }),
                      /* :: */[
                        myStyle,
                        /* [] */0
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.div(/* None */0, /* None */0, /* :: */[
                      myStyle,
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, [string_rev(content)]),
                      /* [] */0
                    ]),
                /* [] */0
              ]
            ]);
}

var partial_arg = /* record */[
  /* model */"",
  /* update */update,
  /* view */view
];

function main(param, param$1) {
  return Tea_app.beginnerProgram(partial_arg, param, param$1);
}

exports.update  = update;
exports.myStyle = myStyle;
exports.view    = view;
exports.main    = main;
/* Tea Not a pure module */

});

;require.register("src/main_form.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
var Tea      = require("./tea");

var model = /* record */[
  /* name */"",
  /* password */"",
  /* passwordAgain */""
];

function update(model, param) {
  switch (param.tag | 0) {
    case 0 : 
        return /* record */[
                /* name */param[0],
                /* password */model[/* password */1],
                /* passwordAgain */model[/* passwordAgain */2]
              ];
    case 1 : 
        return /* record */[
                /* name */model[/* name */0],
                /* password */param[0],
                /* passwordAgain */model[/* passwordAgain */2]
              ];
    case 2 : 
        return /* record */[
                /* name */model[/* name */0],
                /* password */model[/* password */1],
                /* passwordAgain */param[0]
              ];
    
  }
}

function viewValidation(model) {
  var match = model[/* password */1] === model[/* passwordAgain */2] ? /* tuple */[
      "green",
      "OK"
    ] : /* tuple */[
      "red",
      "Passwords do not match!"
    ];
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* Style */Block.__(4, [/* :: */[
                    /* tuple */[
                      "color",
                      match[0]
                    ],
                    /* [] */0
                  ]]),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [match[1]]),
              /* [] */0
            ]);
}

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "type",
                        "text"
                      ]),
                    /* :: */[
                      /* RawProp */Block.__(0, [
                          "placeholder",
                          "Name"
                        ]),
                      /* :: */[
                        Tea_html.onInput(/* None */0, function (s) {
                              return /* Name */Block.__(0, [s]);
                            }),
                        /* [] */0
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "type",
                          "password"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "placeholder",
                            "Password"
                          ]),
                        /* :: */[
                          Tea_html.onInput(/* None */0, function (s) {
                                return /* Password */Block.__(1, [s]);
                              }),
                          /* [] */0
                        ]
                      ]
                    ], /* [] */0),
                /* :: */[
                  Tea_html.input(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "type",
                            "password"
                          ]),
                        /* :: */[
                          /* RawProp */Block.__(0, [
                              "placeholder",
                              "Re-enter Password"
                            ]),
                          /* :: */[
                            Tea_html.onInput(/* None */0, function (s) {
                                  return /* PasswordAgain */Block.__(2, [s]);
                                }),
                            /* [] */0
                          ]
                        ]
                      ], /* [] */0),
                  /* :: */[
                    viewValidation(model),
                    /* [] */0
                  ]
                ]
              ]
            ]);
}

var partial_arg = /* record */[
  /* model */model,
  /* update */update,
  /* view */view
];

function main(param, param$1) {
  return Tea_app.beginnerProgram(partial_arg, param, param$1);
}

exports.model          = model;
exports.update         = update;
exports.viewValidation = viewValidation;
exports.view           = view;
exports.main           = main;
/* Tea Not a pure module */

});

;require.register("src/main_random.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app    = require("./tea_app");
var Tea_html   = require("./tea_html");
var Block      = require("bs-platform/lib/js/block");
var Tea        = require("./tea");
var Tea_random = require("./tea_random");

function init() {
  return /* tuple */[
          /* record */[/* dieFace */1],
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (param) {
    return /* tuple */[
            /* record */[/* dieFace */param[0]],
            /* NoCmd */0
          ];
  }
  else {
    return /* tuple */[
            model,
            Tea_random.generate(function (v) {
                  return /* NewFace */[v];
                }, Tea_random.$$int(1, 6))
          ];
  }
}

function subscriptions() {
  return /* NoSub */0;
}

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["" + model[/* dieFace */0]]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.button(/* None */0, /* None */0, /* :: */[
                      Tea_html.onClick(/* None */0, /* Roll */0),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Roll"]),
                      /* [] */0
                    ]),
                /* [] */0
              ]
            ]);
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  /* subscriptions */subscriptions
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.init          = init;
exports.update        = update;
exports.subscriptions = subscriptions;
exports.view          = view;
exports.main          = main;
/* Tea Not a pure module */

});

;require.register("src/main_random_color.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app    = require("./tea_app");
var Tea_html   = require("./tea_html");
var Block      = require("bs-platform/lib/js/block");
var Tea        = require("./tea");
var Vdom       = require("./vdom");
var Tea_random = require("./tea_random");

function init() {
  return /* tuple */[
          /* record */[
            /* r */255,
            /* g */255,
            /* b */255
          ],
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (param) {
    return /* tuple */[
            /* record */[
              /* r */param[0],
              /* g */param[1],
              /* b */param[2]
            ],
            /* NoCmd */0
          ];
  }
  else {
    var genInt = Tea_random.$$int(1, 255);
    var genTuple3 = Tea_random.map3(function (r, g, b) {
          return /* NewColor */[
                  r,
                  g,
                  b
                ];
        }, genInt, genInt, genInt);
    return /* tuple */[
            model,
            Tea_random.generate(function (v) {
                  return v;
                }, genTuple3)
          ];
  }
}

function subscriptions() {
  return /* NoSub */0;
}

function view(model) {
  var r = "" + model[/* r */0];
  var g = "" + model[/* g */1];
  var b = "" + model[/* b */2];
  var isDark = +((((model[/* r */0] + model[/* g */1] | 0) + model[/* b */2] | 0) / 3 | 0) > 128);
  var rgb = "(" + (r + ("," + (g + ("," + (b + ")")))));
  var altRgb = isDark ? "(0,0,0)" : "(255,255,255)";
  var value = "rgb" + rgb;
  var value$1 = "rgb" + altRgb;
  return Tea_html.div(/* None */0, /* None */0, /* [] */0, /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* :: */[
                    Vdom.style("background-color", value),
                    /* :: */[
                      Vdom.style("color", value$1),
                      /* [] */0
                    ]
                  ], /* :: */[
                    /* Text */Block.__(0, [rgb]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.button(/* None */0, /* None */0, /* :: */[
                      Tea_html.onClick(/* None */0, /* Roll */0),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Roll"]),
                      /* [] */0
                    ]),
                /* [] */0
              ]
            ]);
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  /* subscriptions */subscriptions
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.init          = init;
exports.update        = update;
exports.subscriptions = subscriptions;
exports.view          = view;
exports.main          = main;
/* Tea Not a pure module */

});

;require.register("src/main_todo.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app       = require("./tea_app");
var Tea_html      = require("./tea_html");
var Pervasives    = require("bs-platform/lib/js/pervasives");
var Block         = require("bs-platform/lib/js/block");
var Tea           = require("./tea");
var Vdom          = require("./vdom");
var List          = require("bs-platform/lib/js/list");
var Tea_html_cmds = require("./tea_html_cmds");

var emptyModel = /* record */[
  /* entries : [] */0,
  /* field */"",
  /* uid */0,
  /* visibility */"All"
];

function newEntry(desc, id) {
  return /* record */[
          /* description */desc,
          /* completed : false */0,
          /* editing : false */0,
          /* id */id
        ];
}

function init() {
  return /* tuple */[
          emptyModel,
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (typeof param === "number") {
    switch (param) {
      case 0 : 
          return /* tuple */[
                  model,
                  /* NoCmd */0
                ];
      case 1 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* field */1] === "" ? model[/* entries */0] : Pervasives.$at(model[/* entries */0], /* :: */[
                            newEntry(model[/* field */1], model[/* uid */2]),
                            /* [] */0
                          ]),
                    /* field */"",
                    /* uid */model[/* uid */2] + 1 | 0,
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 2 : 
          return /* tuple */[
                  /* record */[
                    /* entries */List.filter(function (param) {
                            return !param[/* completed */1];
                          })(model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */param[0],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 1 : 
          var editing = param[1];
          var id = param[0];
          var updateEntry = function (t) {
            if (t[/* id */3] === id) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */t[/* completed */1],
                      /* editing */editing,
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  editing ? Tea_html_cmds.focus("todo-" + id) : /* NoCmd */0
                ];
      case 2 : 
          var description = param[1];
          var id$1 = param[0];
          var updateEntry$1 = function (t) {
            if (t[/* id */3] === id$1) {
              return /* record */[
                      /* description */description,
                      /* completed */t[/* completed */1],
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$1, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 3 : 
          var id$2 = param[0];
          return /* tuple */[
                  /* record */[
                    /* entries */List.filter(function (t) {
                            return +(t[/* id */3] !== id$2);
                          })(model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 4 : 
          var completed = param[1];
          var id$3 = param[0];
          var updateEntry$2 = function (t) {
            if (t[/* id */3] === id$3) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */completed,
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$2, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 5 : 
          var completed$1 = param[0];
          var updateEntry$3 = function (t) {
            return /* record */[
                    /* description */t[/* description */0],
                    /* completed */completed$1,
                    /* editing */t[/* editing */2],
                    /* id */t[/* id */3]
                  ];
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$3, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 6 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */param[0]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
}

function onEnter($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var tagger = function (ev) {
    var match = ev.keyCode;
    if (match !== 13) {
      return /* None */0;
    }
    else {
      return /* Some */[msg];
    }
  };
  return Tea_html.on("keydown", /* Some */[key], tagger);
}

function viewEntry(todo) {
  var key = "" + todo[/* id */3];
  var b = todo[/* completed */1];
  var str = todo[/* description */0];
  var str$1 = "todo-" + todo[/* id */3];
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.classList(/* :: */[
                    /* tuple */[
                      "completed",
                      todo[/* completed */1]
                    ],
                    /* :: */[
                      /* tuple */[
                        "editing",
                        todo[/* editing */2]
                      ],
                      /* [] */0
                    ]
                  ]),
              /* [] */0
            ], /* :: */[
              Tea_html.div(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "view"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Tea_html.input(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "className",
                              "toggle"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "type",
                                "checkbox"
                              ]),
                            /* :: */[
                              Tea_html.checked(todo[/* completed */1]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key + (
                                        b ? "true" : "false"
                                      )], /* Check */Block.__(4, [
                                        todo[/* id */3],
                                        !todo[/* completed */1]
                                      ])),
                                /* [] */0
                              ]
                            ]
                          ]
                        ], /* [] */0),
                    /* :: */[
                      Tea_html.label(/* None */0, /* None */0, /* :: */[
                            Tea_html.onDoubleClick(/* Some */[key], /* EditingEntry */Block.__(1, [
                                    todo[/* id */3],
                                    /* true */1
                                  ])),
                            /* [] */0
                          ], /* :: */[
                            /* Text */Block.__(0, [todo[/* description */0]]),
                            /* [] */0
                          ]),
                      /* :: */[
                        Tea_html.button(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "className",
                                  "destroy"
                                ]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key], /* Delete */Block.__(3, [todo[/* id */3]])),
                                /* [] */0
                              ]
                            ], /* [] */0),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "edit"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "value",
                            str
                          ]),
                        /* :: */[
                          /* RawProp */Block.__(0, [
                              "name",
                              "title"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "id",
                                str$1
                              ]),
                            /* :: */[
                              Tea_html.onInput(/* Some */[key], function (value) {
                                    return /* UpdateEntry */Block.__(2, [
                                              todo[/* id */3],
                                              value
                                            ]);
                                  }),
                              /* :: */[
                                Tea_html.onBlur(/* Some */[key], /* EditingEntry */Block.__(1, [
                                        todo[/* id */3],
                                        /* false */0
                                      ])),
                                /* :: */[
                                  onEnter(/* Some */[key], /* EditingEntry */Block.__(1, [
                                          todo[/* id */3],
                                          /* false */0
                                        ])),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewEntries(visibility, entries) {
  var isVisible = function (todo) {
    switch (visibility) {
      case "Active" : 
          return !todo[/* completed */1];
      case "Completed" : 
          return todo[/* completed */1];
      default:
        return /* true */1;
    }
  };
  var allCompleted = List.for_all(function (param) {
        return param[/* completed */1];
      }, entries);
  var cssVisibility = entries ? "visible" : "hidden";
  return Tea_html.section(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "main"
                ]),
              /* :: */[
                Vdom.style("visibility", cssVisibility),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "toggle-all"
                      ]),
                    /* :: */[
                      /* RawProp */Block.__(0, [
                          "type",
                          "checkbox"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "name",
                            "toggle"
                          ]),
                        /* :: */[
                          Tea_html.checked(allCompleted),
                          /* :: */[
                            Tea_html.onClick(/* Some */[allCompleted ? "true" : "false"], /* CheckAll */Block.__(5, [!allCompleted])),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.label(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "htmlFor",
                          "toggle-all"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Mark all as complete"]),
                      /* [] */0
                    ]),
                /* :: */[
                  Tea_html.ul(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "className",
                            "todo-list"
                          ]),
                        /* [] */0
                      ], List.map(viewEntry, List.filter(isVisible)(entries))),
                  /* [] */0
                ]
              ]
            ]);
}

function viewInput(task) {
  return Tea_html.header(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "header"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["todos"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "new-todo"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "placeholder",
                            "What needs to be done?"
                          ]),
                        /* :: */[
                          Tea_html.autofocus(/* true */1),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "value",
                                task
                              ]),
                            /* :: */[
                              /* RawProp */Block.__(0, [
                                  "name",
                                  "newTodo"
                                ]),
                              /* :: */[
                                Tea_html.onInput(/* None */0, function (str) {
                                      return /* UpdateField */Block.__(0, [str]);
                                    }),
                                /* :: */[
                                  onEnter(/* None */0, /* Add */1),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewControlsCount(entriesLeft) {
  var item_ = entriesLeft === 1 ? " item" : " items";
  return Tea_html.span(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todo-count"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.strong(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["" + entriesLeft]),
                    /* [] */0
                  ]),
              /* :: */[
                /* Text */Block.__(0, [item_ + " left"]),
                /* [] */0
              ]
            ]);
}

function visibilitySwap(uri, visibility, actualVisibility) {
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[visibility], /* ChangeVisibility */Block.__(6, [visibility])),
              /* [] */0
            ], /* :: */[
              Tea_html.a(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "href",
                        uri
                      ]),
                    /* :: */[
                      Tea_html.classList(/* :: */[
                            /* tuple */[
                              "selected",
                              +(visibility === actualVisibility)
                            ],
                            /* [] */0
                          ]),
                      /* [] */0
                    ]
                  ], /* :: */[
                    /* Text */Block.__(0, [visibility]),
                    /* [] */0
                  ]),
              /* [] */0
            ]);
}

function viewControlsFilters(visibility) {
  return Tea_html.ul(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "filters"
                ]),
              /* [] */0
            ], /* :: */[
              visibilitySwap("#/", "All", visibility),
              /* :: */[
                /* Text */Block.__(0, [" "]),
                /* :: */[
                  visibilitySwap("#/active", "Active", visibility),
                  /* :: */[
                    /* Text */Block.__(0, [" "]),
                    /* :: */[
                      visibilitySwap("#/completed", "Completed", visibility),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]);
}

function viewControlsClear(entriesCompleted) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "clear-completed"
                ]),
              /* :: */[
                Tea_html.hidden(+(entriesCompleted === 0)),
                /* :: */[
                  Tea_html.onClick(/* None */0, /* DeleteComplete */2),
                  /* [] */0
                ]
              ]
            ], /* :: */[
              /* Text */Block.__(0, ["Clear completed (" + (entriesCompleted + ")")]),
              /* [] */0
            ]);
}

function viewControls(visibility, entries) {
  var entriesCompleted = List.length(List.filter(function (param) {
              return param[/* completed */1];
            })(entries));
  var entriesLeft = List.length(entries) - entriesCompleted | 0;
  return Tea_html.footer(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "footer"
                ]),
              /* :: */[
                Tea_html.hidden(+(List.length(entries) === 0)),
                /* [] */0
              ]
            ], /* :: */[
              viewControlsCount(entriesLeft),
              /* :: */[
                viewControlsFilters(visibility),
                /* :: */[
                  viewControlsClear(entriesCompleted),
                  /* [] */0
                ]
              ]
            ]);
}

var infoFooter = Tea_html.footer(/* None */0, /* None */0, /* :: */[
      /* RawProp */Block.__(0, [
          "className",
          "info"
        ]),
      /* [] */0
    ], /* :: */[
      Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
            /* Text */Block.__(0, ["Double-click to edit a todo"]),
            /* [] */0
          ]),
      /* :: */[
        Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
              /* Text */Block.__(0, ["Written by "]),
              /* :: */[
                Tea_html.a(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "href",
                          "https://github.com/evancz"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Evan Czaplicki"]),
                      /* [] */0
                    ]),
                /* :: */[
                  /* Text */Block.__(0, [" and converted by "]),
                  /* :: */[
                    Tea_html.a(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "href",
                              "https://github.com/overminddl1"
                            ]),
                          /* [] */0
                        ], /* :: */[
                          /* Text */Block.__(0, ["OvermindDL1"]),
                          /* [] */0
                        ]),
                    /* [] */0
                  ]
                ]
              ]
            ]),
        /* :: */[
          Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                /* Text */Block.__(0, ["Part of "]),
                /* :: */[
                  Tea_html.a(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "href",
                            "http://todomvc.com"
                          ]),
                        /* [] */0
                      ], /* :: */[
                        /* Text */Block.__(0, ["TodoMVC"]),
                        /* [] */0
                      ]),
                  /* [] */0
                ]
              ]),
          /* [] */0
        ]
      ]
    ]);

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todomvc-wrapper"
                ]),
              /* :: */[
                Vdom.style("visibility", "hidden"),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.section(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "todoapp"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    viewInput(model[/* field */1]),
                    /* :: */[
                      viewEntries(model[/* visibility */3], model[/* entries */0]),
                      /* :: */[
                        viewControls(model[/* visibility */3], model[/* entries */0]),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                infoFooter,
                /* [] */0
              ]
            ]);
}

function partial_arg_003() {
  return /* NoSub */0;
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  partial_arg_003
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.emptyModel          = emptyModel;
exports.newEntry            = newEntry;
exports.init                = init;
exports.update              = update;
exports.onEnter             = onEnter;
exports.viewEntry           = viewEntry;
exports.viewEntries         = viewEntries;
exports.viewInput           = viewInput;
exports.viewControlsCount   = viewControlsCount;
exports.visibilitySwap      = visibilitySwap;
exports.viewControlsFilters = viewControlsFilters;
exports.viewControlsClear   = viewControlsClear;
exports.viewControls        = viewControls;
exports.infoFooter          = infoFooter;
exports.view                = view;
exports.main                = main;
/* infoFooter Not a pure module */

});

;require.register("src/main_todo_optimized.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app       = require("./tea_app");
var Tea_html      = require("./tea_html");
var Block         = require("bs-platform/lib/js/block");
var Tea           = require("./tea");
var Vdom          = require("./vdom");
var List          = require("bs-platform/lib/js/list");
var Tea_html_cmds = require("./tea_html_cmds");

var emptyModel = /* record */[
  /* entries : [] */0,
  /* field */"",
  /* uid */0,
  /* visibility */"All"
];

function newEntry(desc, id) {
  return /* record */[
          /* description */desc,
          /* completed : false */0,
          /* editing : false */0,
          /* id */id
        ];
}

function init() {
  return /* tuple */[
          emptyModel,
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (typeof param === "number") {
    if (param) {
      return /* tuple */[
              /* record */[
                /* entries */List.filter(function (param) {
                        return !param[/* completed */1];
                      })(model[/* entries */0]),
                /* field */model[/* field */1],
                /* uid */model[/* uid */2],
                /* visibility */model[/* visibility */3]
              ],
              /* NoCmd */0
            ];
    }
    else {
      return /* tuple */[
              /* record */[
                /* entries */model[/* field */1] === "" ? model[/* entries */0] : /* :: */[
                    newEntry(model[/* field */1], model[/* uid */2]),
                    model[/* entries */0]
                  ],
                /* field */"",
                /* uid */model[/* uid */2] + 1 | 0,
                /* visibility */model[/* visibility */3]
              ],
              /* NoCmd */0
            ];
    }
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */param[0],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 1 : 
          var editing = param[1];
          var id = param[0];
          var updateEntry = function (t) {
            if (t[/* id */3] === id) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */t[/* completed */1],
                      /* editing */editing,
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  editing ? Tea_html_cmds.focus("todo-" + id) : /* NoCmd */0
                ];
      case 2 : 
          var description = param[1];
          var id$1 = param[0];
          var updateEntry$1 = function (t) {
            if (t[/* id */3] === id$1) {
              return /* record */[
                      /* description */description,
                      /* completed */t[/* completed */1],
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$1, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 3 : 
          var id$2 = param[0];
          return /* tuple */[
                  /* record */[
                    /* entries */List.filter(function (t) {
                            return +(t[/* id */3] !== id$2);
                          })(model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 4 : 
          var completed = param[1];
          var id$3 = param[0];
          var updateEntry$2 = function (t) {
            if (t[/* id */3] === id$3) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */completed,
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$2, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 5 : 
          var completed$1 = param[0];
          var updateEntry$3 = function (t) {
            return /* record */[
                    /* description */t[/* description */0],
                    /* completed */completed$1,
                    /* editing */t[/* editing */2],
                    /* id */t[/* id */3]
                  ];
          };
          return /* tuple */[
                  /* record */[
                    /* entries */List.map(updateEntry$3, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 6 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */param[0]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
}

function onEnter($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var tagger = function (ev) {
    var match = ev.keyCode;
    if (match !== 13) {
      return /* None */0;
    }
    else {
      return /* Some */[msg];
    }
  };
  return Tea_html.on("keydown", /* Some */[key], tagger);
}

function viewEntry(todo, _) {
  var key = "" + todo[/* id */3];
  var b = todo[/* completed */1];
  var b$1 = todo[/* editing */2];
  var fullkey = key + ((
      b ? "true" : "false"
    ) + (
      b$1 ? "true" : "false"
    ));
  var str = todo[/* description */0];
  var str$1 = "todo-" + todo[/* id */3];
  return Tea_html.li(/* Some */[fullkey], /* None */0, /* :: */[
              Tea_html.classList(/* :: */[
                    /* tuple */[
                      "completed",
                      todo[/* completed */1]
                    ],
                    /* :: */[
                      /* tuple */[
                        "editing",
                        todo[/* editing */2]
                      ],
                      /* [] */0
                    ]
                  ]),
              /* [] */0
            ], /* :: */[
              Tea_html.div(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "view"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Tea_html.input(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "className",
                              "toggle"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "type",
                                "checkbox"
                              ]),
                            /* :: */[
                              Tea_html.checked(todo[/* completed */1]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[fullkey], /* Check */Block.__(4, [
                                        todo[/* id */3],
                                        !todo[/* completed */1]
                                      ])),
                                /* [] */0
                              ]
                            ]
                          ]
                        ], /* [] */0),
                    /* :: */[
                      Tea_html.label(/* None */0, /* None */0, /* :: */[
                            Tea_html.onDoubleClick(/* Some */[key], /* EditingEntry */Block.__(1, [
                                    todo[/* id */3],
                                    /* true */1
                                  ])),
                            /* [] */0
                          ], /* :: */[
                            /* Text */Block.__(0, [todo[/* description */0]]),
                            /* [] */0
                          ]),
                      /* :: */[
                        Tea_html.button(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "className",
                                  "destroy"
                                ]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key], /* Delete */Block.__(3, [todo[/* id */3]])),
                                /* [] */0
                              ]
                            ], /* [] */0),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "edit"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "value",
                            str
                          ]),
                        /* :: */[
                          /* RawProp */Block.__(0, [
                              "name",
                              "title"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "id",
                                str$1
                              ]),
                            /* :: */[
                              Tea_html.onInput(/* Some */[key], function (value) {
                                    return /* UpdateEntry */Block.__(2, [
                                              todo[/* id */3],
                                              value
                                            ]);
                                  }),
                              /* :: */[
                                Tea_html.onBlur(/* Some */[key], /* EditingEntry */Block.__(1, [
                                        todo[/* id */3],
                                        /* false */0
                                      ])),
                                /* :: */[
                                  onEnter(/* Some */[key], /* EditingEntry */Block.__(1, [
                                          todo[/* id */3],
                                          /* false */0
                                        ])),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewEntries(visibility, entries) {
  var isVisible = function (todo) {
    switch (visibility) {
      case "Active" : 
          return !todo[/* completed */1];
      case "Completed" : 
          return todo[/* completed */1];
      default:
        return /* true */1;
    }
  };
  var allCompleted = List.for_all(function (param) {
        return param[/* completed */1];
      }, entries);
  var cssVisibility = entries ? "visible" : "hidden";
  return Tea_html.section(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "main"
                ]),
              /* :: */[
                Vdom.style("visibility", cssVisibility),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "toggle-all"
                      ]),
                    /* :: */[
                      /* RawProp */Block.__(0, [
                          "type",
                          "checkbox"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "name",
                            "toggle"
                          ]),
                        /* :: */[
                          Tea_html.checked(allCompleted),
                          /* :: */[
                            Tea_html.onClick(/* Some */[allCompleted ? "true" : "false"], /* CheckAll */Block.__(5, [!allCompleted])),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.label(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "htmlFor",
                          "toggle-all"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Mark all as complete"]),
                      /* [] */0
                    ]),
                /* :: */[
                  Tea_html.ul(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "className",
                            "todo-list"
                          ]),
                        /* [] */0
                      ], List.rev_map(function (todo) {
                            var gen = function (param) {
                              return viewEntry(todo, param);
                            };
                            var b = todo[/* completed */1];
                            var b$1 = todo[/* editing */2];
                            var key = todo[/* id */3] + ((
                                b ? "true" : "false"
                              ) + (
                                b$1 ? "true" : "false"
                              ));
                            return Vdom.lazyGen(key, gen);
                          }, List.filter(isVisible)(entries))),
                  /* [] */0
                ]
              ]
            ]);
}

function viewInput(task, _) {
  return Tea_html.header(/* Some */[task], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "header"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["todos"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "new-todo"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "placeholder",
                            "What needs to be done?"
                          ]),
                        /* :: */[
                          Tea_html.autofocus(/* true */1),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "value",
                                task
                              ]),
                            /* :: */[
                              /* RawProp */Block.__(0, [
                                  "name",
                                  "newTodo"
                                ]),
                              /* :: */[
                                Tea_html.onInput(/* None */0, function (str) {
                                      return /* UpdateField */Block.__(0, [str]);
                                    }),
                                /* :: */[
                                  onEnter(/* None */0, /* Add */0),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewControlsCount(entriesLeft) {
  var item_ = entriesLeft === 1 ? " item" : " items";
  var left = "" + entriesLeft;
  return Tea_html.span(/* Some */[left], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todo-count"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.strong(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, [left]),
                    /* [] */0
                  ]),
              /* :: */[
                /* Text */Block.__(0, [item_ + " left"]),
                /* [] */0
              ]
            ]);
}

function visibilitySwap(uri, visibility, actualVisibility) {
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[visibility], /* ChangeVisibility */Block.__(6, [visibility])),
              /* [] */0
            ], /* :: */[
              Tea_html.a(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "href",
                        uri
                      ]),
                    /* :: */[
                      Tea_html.classList(/* :: */[
                            /* tuple */[
                              "selected",
                              +(visibility === actualVisibility)
                            ],
                            /* [] */0
                          ]),
                      /* [] */0
                    ]
                  ], /* :: */[
                    /* Text */Block.__(0, [visibility]),
                    /* [] */0
                  ]),
              /* [] */0
            ]);
}

function viewControlsFilters(visibility) {
  return Tea_html.ul(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "filters"
                ]),
              /* [] */0
            ], /* :: */[
              visibilitySwap("#/", "All", visibility),
              /* :: */[
                /* Text */Block.__(0, [" "]),
                /* :: */[
                  visibilitySwap("#/active", "Active", visibility),
                  /* :: */[
                    /* Text */Block.__(0, [" "]),
                    /* :: */[
                      visibilitySwap("#/completed", "Completed", visibility),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]);
}

function viewControlsClear(entriesCompleted) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "clear-completed"
                ]),
              /* :: */[
                Tea_html.hidden(+(entriesCompleted === 0)),
                /* :: */[
                  Tea_html.onClick(/* None */0, /* DeleteComplete */1),
                  /* [] */0
                ]
              ]
            ], /* :: */[
              /* Text */Block.__(0, ["Clear completed (" + (entriesCompleted + ")")]),
              /* [] */0
            ]);
}

function viewControls(visibility, entries) {
  var entriesCompleted = List.length(List.filter(function (param) {
              return param[/* completed */1];
            })(entries));
  var entriesLeft = List.length(entries) - entriesCompleted | 0;
  return Tea_html.footer(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "footer"
                ]),
              /* :: */[
                Tea_html.hidden(+(List.length(entries) === 0)),
                /* [] */0
              ]
            ], /* :: */[
              viewControlsCount(entriesLeft),
              /* :: */[
                viewControlsFilters(visibility),
                /* :: */[
                  viewControlsClear(entriesCompleted),
                  /* [] */0
                ]
              ]
            ]);
}

function infoFooter() {
  return Tea_html.footer(/* Some */["1"], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "info"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["Double-click to edit a todo"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                      /* Text */Block.__(0, ["Written by "]),
                      /* :: */[
                        Tea_html.a(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "href",
                                  "https://github.com/evancz"
                                ]),
                              /* [] */0
                            ], /* :: */[
                              /* Text */Block.__(0, ["Evan Czaplicki"]),
                              /* [] */0
                            ]),
                        /* :: */[
                          /* Text */Block.__(0, [" and converted by "]),
                          /* :: */[
                            Tea_html.a(/* None */0, /* None */0, /* :: */[
                                  /* RawProp */Block.__(0, [
                                      "href",
                                      "https://github.com/overminddl1"
                                    ]),
                                  /* [] */0
                                ], /* :: */[
                                  /* Text */Block.__(0, ["OvermindDL1"]),
                                  /* [] */0
                                ]),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]),
                /* :: */[
                  Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                        /* Text */Block.__(0, ["Part of "]),
                        /* :: */[
                          Tea_html.a(/* None */0, /* None */0, /* :: */[
                                /* RawProp */Block.__(0, [
                                    "href",
                                    "http://todomvc.com"
                                  ]),
                                /* [] */0
                              ], /* :: */[
                                /* Text */Block.__(0, ["TodoMVC"]),
                                /* [] */0
                              ]),
                          /* [] */0
                        ]
                      ]),
                  /* [] */0
                ]
              ]
            ]);
}

function view(model) {
  var partial_arg = model[/* field */1];
  var gen = function (param) {
    return viewInput(partial_arg, param);
  };
  var key = model[/* field */1];
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todomvc-wrapper"
                ]),
              /* :: */[
                Vdom.style("visibility", "hidden"),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.section(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "todoapp"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Vdom.lazyGen(key, gen),
                    /* :: */[
                      viewEntries(model[/* visibility */3], model[/* entries */0]),
                      /* :: */[
                        viewControls(model[/* visibility */3], model[/* entries */0]),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Vdom.lazyGen("", infoFooter),
                /* [] */0
              ]
            ]);
}

function partial_arg_003() {
  return /* NoSub */0;
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  partial_arg_003
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.emptyModel          = emptyModel;
exports.newEntry            = newEntry;
exports.init                = init;
exports.update              = update;
exports.onEnter             = onEnter;
exports.viewEntry           = viewEntry;
exports.viewEntries         = viewEntries;
exports.viewInput           = viewInput;
exports.viewControlsCount   = viewControlsCount;
exports.visibilitySwap      = visibilitySwap;
exports.viewControlsFilters = viewControlsFilters;
exports.viewControlsClear   = viewControlsClear;
exports.viewControls        = viewControls;
exports.infoFooter          = infoFooter;
exports.view                = view;
exports.main                = main;
/* Tea Not a pure module */

});

;require.register("src/main_todo_optimizedarray.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app       = require("./tea_app");
var Tea_html      = require("./tea_html");
var Block         = require("bs-platform/lib/js/block");
var Caml_array    = require("bs-platform/lib/js/caml_array");
var Tea           = require("./tea");
var $$Array       = require("bs-platform/lib/js/array");
var Vdom          = require("./vdom");
var List          = require("bs-platform/lib/js/list");
var Tea_html_cmds = require("./tea_html_cmds");

var emptyModel_000 = /* entries : array */[];

var emptyModel = /* record */[
  emptyModel_000,
  /* field */"",
  /* uid */0,
  /* visibility */"All"
];

function newEntry(desc, id) {
  return /* record */[
          /* description */desc,
          /* completed : false */0,
          /* editing : false */0,
          /* id */id
        ];
}

function init() {
  return /* tuple */[
          emptyModel,
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (typeof param === "number") {
    if (param) {
      return /* tuple */[
              /* record */[
                /* entries */$$Array.of_list(List.filter(function (param) {
                            return !param[/* completed */1];
                          })($$Array.to_list(model[/* entries */0]))),
                /* field */model[/* field */1],
                /* uid */model[/* uid */2],
                /* visibility */model[/* visibility */3]
              ],
              /* NoCmd */0
            ];
    }
    else {
      return /* tuple */[
              /* record */[
                /* entries */model[/* field */1] === "" ? model[/* entries */0] : Caml_array.caml_array_concat(/* :: */[
                        model[/* entries */0],
                        /* :: */[
                          /* array */[newEntry(model[/* field */1], model[/* uid */2])],
                          /* [] */0
                        ]
                      ]),
                /* field */"",
                /* uid */model[/* uid */2] + 1 | 0,
                /* visibility */model[/* visibility */3]
              ],
              /* NoCmd */0
            ];
    }
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */param[0],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 1 : 
          var editing = param[1];
          var id = param[0];
          var updateEntry = function (t) {
            if (t[/* id */3] === id) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */t[/* completed */1],
                      /* editing */editing,
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  editing ? Tea_html_cmds.focus("todo-" + id) : /* NoCmd */0
                ];
      case 2 : 
          var description = param[1];
          var id$1 = param[0];
          var updateEntry$1 = function (t) {
            if (t[/* id */3] === id$1) {
              return /* record */[
                      /* description */description,
                      /* completed */t[/* completed */1],
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$1, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 3 : 
          var id$2 = param[0];
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.of_list(List.filter(function (t) {
                                return +(t[/* id */3] !== id$2);
                              })($$Array.to_list(model[/* entries */0]))),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 4 : 
          var completed = param[1];
          var id$3 = param[0];
          var updateEntry$2 = function (t) {
            if (t[/* id */3] === id$3) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */completed,
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$2, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 5 : 
          var completed$1 = param[0];
          var updateEntry$3 = function (t) {
            return /* record */[
                    /* description */t[/* description */0],
                    /* completed */completed$1,
                    /* editing */t[/* editing */2],
                    /* id */t[/* id */3]
                  ];
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$3, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 6 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */param[0]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
}

function onEnter($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var tagger = function (ev) {
    var match = ev.keyCode;
    if (match !== 13) {
      return /* None */0;
    }
    else {
      return /* Some */[msg];
    }
  };
  return Tea_html.on("keydown", /* Some */[key], tagger);
}

function viewEntry(todo, _) {
  var key = "" + todo[/* id */3];
  var b = todo[/* completed */1];
  var b$1 = todo[/* editing */2];
  var fullkey = key + ((
      b ? "true" : "false"
    ) + (
      b$1 ? "true" : "false"
    ));
  var str = todo[/* description */0];
  var str$1 = "todo-" + todo[/* id */3];
  return Tea_html.li(/* Some */[fullkey], /* None */0, /* :: */[
              Tea_html.classList(/* :: */[
                    /* tuple */[
                      "completed",
                      todo[/* completed */1]
                    ],
                    /* :: */[
                      /* tuple */[
                        "editing",
                        todo[/* editing */2]
                      ],
                      /* [] */0
                    ]
                  ]),
              /* [] */0
            ], /* :: */[
              Tea_html.div(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "view"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Tea_html.input(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "className",
                              "toggle"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "type",
                                "checkbox"
                              ]),
                            /* :: */[
                              Tea_html.checked(todo[/* completed */1]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[fullkey], /* Check */Block.__(4, [
                                        todo[/* id */3],
                                        !todo[/* completed */1]
                                      ])),
                                /* [] */0
                              ]
                            ]
                          ]
                        ], /* [] */0),
                    /* :: */[
                      Tea_html.label(/* None */0, /* None */0, /* :: */[
                            Tea_html.onDoubleClick(/* Some */[key], /* EditingEntry */Block.__(1, [
                                    todo[/* id */3],
                                    /* true */1
                                  ])),
                            /* [] */0
                          ], /* :: */[
                            /* Text */Block.__(0, [todo[/* description */0]]),
                            /* [] */0
                          ]),
                      /* :: */[
                        Tea_html.button(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "className",
                                  "destroy"
                                ]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key], /* Delete */Block.__(3, [todo[/* id */3]])),
                                /* [] */0
                              ]
                            ], /* [] */0),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "edit"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "value",
                            str
                          ]),
                        /* :: */[
                          /* RawProp */Block.__(0, [
                              "name",
                              "title"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "id",
                                str$1
                              ]),
                            /* :: */[
                              Tea_html.onInput(/* Some */[key], function (value) {
                                    return /* UpdateEntry */Block.__(2, [
                                              todo[/* id */3],
                                              value
                                            ]);
                                  }),
                              /* :: */[
                                Tea_html.onBlur(/* Some */[key], /* EditingEntry */Block.__(1, [
                                        todo[/* id */3],
                                        /* false */0
                                      ])),
                                /* :: */[
                                  onEnter(/* Some */[key], /* EditingEntry */Block.__(1, [
                                          todo[/* id */3],
                                          /* false */0
                                        ])),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewEntries(visibility, entries) {
  var isVisible = function (todo) {
    switch (visibility) {
      case "Active" : 
          return !todo[/* completed */1];
      case "Completed" : 
          return todo[/* completed */1];
      default:
        return /* true */1;
    }
  };
  var allCompleted = $$Array.fold_left(function (b, param) {
        if (b) {
          return param[/* completed */1];
        }
        else {
          return /* false */0;
        }
      }, /* true */1, entries);
  var cssVisibility = entries.length ? "visible" : "hidden";
  return Tea_html.section(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "main"
                ]),
              /* :: */[
                Vdom.style("visibility", cssVisibility),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "toggle-all"
                      ]),
                    /* :: */[
                      /* RawProp */Block.__(0, [
                          "type",
                          "checkbox"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "name",
                            "toggle"
                          ]),
                        /* :: */[
                          Tea_html.checked(allCompleted),
                          /* :: */[
                            Tea_html.onClick(/* Some */[allCompleted ? "true" : "false"], /* CheckAll */Block.__(5, [!allCompleted])),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.label(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "htmlFor",
                          "toggle-all"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Mark all as complete"]),
                      /* [] */0
                    ]),
                /* :: */[
                  Tea_html.ul(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "className",
                            "todo-list"
                          ]),
                        /* [] */0
                      ], $$Array.to_list($$Array.map(function (todo) {
                                if (isVisible(todo)) {
                                  var gen = function (param) {
                                    return viewEntry(todo, param);
                                  };
                                  var b = todo[/* completed */1];
                                  var b$1 = todo[/* editing */2];
                                  var key = todo[/* id */3] + ((
                                      b ? "true" : "false"
                                    ) + (
                                      b$1 ? "true" : "false"
                                    ));
                                  return Vdom.lazyGen(key, gen);
                                }
                                else {
                                  return Tea_html.noNode;
                                }
                              }, entries))),
                  /* [] */0
                ]
              ]
            ]);
}

function viewInput(task, _) {
  return Tea_html.header(/* Some */[task], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "header"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["todos"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "new-todo"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "placeholder",
                            "What needs to be done?"
                          ]),
                        /* :: */[
                          Tea_html.autofocus(/* true */1),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "value",
                                task
                              ]),
                            /* :: */[
                              /* RawProp */Block.__(0, [
                                  "name",
                                  "newTodo"
                                ]),
                              /* :: */[
                                Tea_html.onInput(/* None */0, function (str) {
                                      return /* UpdateField */Block.__(0, [str]);
                                    }),
                                /* :: */[
                                  onEnter(/* None */0, /* Add */0),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewControlsCount(entriesLeft) {
  var item_ = entriesLeft === 1 ? " item" : " items";
  var left = "" + entriesLeft;
  return Tea_html.span(/* Some */[left], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todo-count"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.strong(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, [left]),
                    /* [] */0
                  ]),
              /* :: */[
                /* Text */Block.__(0, [item_ + " left"]),
                /* [] */0
              ]
            ]);
}

function visibilitySwap(uri, visibility, actualVisibility) {
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[visibility], /* ChangeVisibility */Block.__(6, [visibility])),
              /* [] */0
            ], /* :: */[
              Tea_html.a(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "href",
                        uri
                      ]),
                    /* :: */[
                      Tea_html.classList(/* :: */[
                            /* tuple */[
                              "selected",
                              +(visibility === actualVisibility)
                            ],
                            /* [] */0
                          ]),
                      /* [] */0
                    ]
                  ], /* :: */[
                    /* Text */Block.__(0, [visibility]),
                    /* [] */0
                  ]),
              /* [] */0
            ]);
}

function viewControlsFilters(visibility) {
  return Tea_html.ul(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "filters"
                ]),
              /* [] */0
            ], /* :: */[
              visibilitySwap("#/", "All", visibility),
              /* :: */[
                /* Text */Block.__(0, [" "]),
                /* :: */[
                  visibilitySwap("#/active", "Active", visibility),
                  /* :: */[
                    /* Text */Block.__(0, [" "]),
                    /* :: */[
                      visibilitySwap("#/completed", "Completed", visibility),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]);
}

function viewControlsClear(entriesCompleted) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "clear-completed"
                ]),
              /* :: */[
                Tea_html.hidden(+(entriesCompleted === 0)),
                /* :: */[
                  Tea_html.onClick(/* None */0, /* DeleteComplete */1),
                  /* [] */0
                ]
              ]
            ], /* :: */[
              /* Text */Block.__(0, ["Clear completed (" + (entriesCompleted + ")")]),
              /* [] */0
            ]);
}

function viewControls(visibility, entries) {
  var entriesCompleted = $$Array.fold_left(function (c, param) {
        if (param[/* completed */1]) {
          return c + 1 | 0;
        }
        else {
          return c;
        }
      }, 0, entries);
  var entriesLeft = entries.length - entriesCompleted | 0;
  return Tea_html.footer(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "footer"
                ]),
              /* :: */[
                Tea_html.hidden(+(entries.length === 0)),
                /* [] */0
              ]
            ], /* :: */[
              viewControlsCount(entriesLeft),
              /* :: */[
                viewControlsFilters(visibility),
                /* :: */[
                  viewControlsClear(entriesCompleted),
                  /* [] */0
                ]
              ]
            ]);
}

function infoFooter() {
  return Tea_html.footer(/* Some */["1"], /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "info"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["Double-click to edit a todo"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                      /* Text */Block.__(0, ["Written by "]),
                      /* :: */[
                        Tea_html.a(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "href",
                                  "https://github.com/evancz"
                                ]),
                              /* [] */0
                            ], /* :: */[
                              /* Text */Block.__(0, ["Evan Czaplicki"]),
                              /* [] */0
                            ]),
                        /* :: */[
                          /* Text */Block.__(0, [" and converted by "]),
                          /* :: */[
                            Tea_html.a(/* None */0, /* None */0, /* :: */[
                                  /* RawProp */Block.__(0, [
                                      "href",
                                      "https://github.com/overminddl1"
                                    ]),
                                  /* [] */0
                                ], /* :: */[
                                  /* Text */Block.__(0, ["OvermindDL1"]),
                                  /* [] */0
                                ]),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]),
                /* :: */[
                  Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                        /* Text */Block.__(0, ["Part of "]),
                        /* :: */[
                          Tea_html.a(/* None */0, /* None */0, /* :: */[
                                /* RawProp */Block.__(0, [
                                    "href",
                                    "http://todomvc.com"
                                  ]),
                                /* [] */0
                              ], /* :: */[
                                /* Text */Block.__(0, ["TodoMVC"]),
                                /* [] */0
                              ]),
                          /* [] */0
                        ]
                      ]),
                  /* [] */0
                ]
              ]
            ]);
}

function view(model) {
  var partial_arg = model[/* field */1];
  var gen = function (param) {
    return viewInput(partial_arg, param);
  };
  var key = model[/* field */1];
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todomvc-wrapper"
                ]),
              /* :: */[
                Vdom.style("visibility", "hidden"),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.section(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "todoapp"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Vdom.lazyGen(key, gen),
                    /* :: */[
                      viewEntries(model[/* visibility */3], model[/* entries */0]),
                      /* :: */[
                        viewControls(model[/* visibility */3], model[/* entries */0]),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Vdom.lazyGen("", infoFooter),
                /* [] */0
              ]
            ]);
}

function partial_arg_003() {
  return /* NoSub */0;
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */view,
  partial_arg_003
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.emptyModel          = emptyModel;
exports.newEntry            = newEntry;
exports.init                = init;
exports.update              = update;
exports.onEnter             = onEnter;
exports.viewEntry           = viewEntry;
exports.viewEntries         = viewEntries;
exports.viewInput           = viewInput;
exports.viewControlsCount   = viewControlsCount;
exports.visibilitySwap      = visibilitySwap;
exports.viewControlsFilters = viewControlsFilters;
exports.viewControlsClear   = viewControlsClear;
exports.viewControls        = viewControls;
exports.infoFooter          = infoFooter;
exports.view                = view;
exports.main                = main;
/* Tea Not a pure module */

});

;require.register("src/main_todoarray.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app       = require("./tea_app");
var Tea_html      = require("./tea_html");
var Block         = require("bs-platform/lib/js/block");
var Caml_array    = require("bs-platform/lib/js/caml_array");
var Tea           = require("./tea");
var $$Array       = require("bs-platform/lib/js/array");
var Vdom          = require("./vdom");
var List          = require("bs-platform/lib/js/list");
var Tea_html_cmds = require("./tea_html_cmds");

var emptyModel_000 = /* entries : array */[];

var emptyModel = /* record */[
  emptyModel_000,
  /* field */"",
  /* uid */0,
  /* visibility */"All"
];

function newEntry(desc, id) {
  return /* record */[
          /* description */desc,
          /* completed : false */0,
          /* editing : false */0,
          /* id */id
        ];
}

function init() {
  return /* tuple */[
          emptyModel,
          /* NoCmd */0
        ];
}

function update(model, param) {
  if (typeof param === "number") {
    switch (param) {
      case 0 : 
          return /* tuple */[
                  model,
                  /* NoCmd */0
                ];
      case 1 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* field */1] === "" ? model[/* entries */0] : Caml_array.caml_array_concat(/* :: */[
                            model[/* entries */0],
                            /* :: */[
                              /* array */[newEntry(model[/* field */1], model[/* uid */2])],
                              /* [] */0
                            ]
                          ]),
                    /* field */"",
                    /* uid */model[/* uid */2] + 1 | 0,
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 2 : 
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.of_list(List.filter(function (param) {
                                return !param[/* completed */1];
                              })($$Array.to_list(model[/* entries */0]))),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */param[0],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 1 : 
          var editing = param[1];
          var id = param[0];
          var updateEntry = function (t) {
            if (t[/* id */3] === id) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */t[/* completed */1],
                      /* editing */editing,
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  editing ? Tea_html_cmds.focus("todo-" + id) : /* NoCmd */0
                ];
      case 2 : 
          var description = param[1];
          var id$1 = param[0];
          var updateEntry$1 = function (t) {
            if (t[/* id */3] === id$1) {
              return /* record */[
                      /* description */description,
                      /* completed */t[/* completed */1],
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$1, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 3 : 
          var id$2 = param[0];
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.of_list(List.filter(function (t) {
                                return +(t[/* id */3] !== id$2);
                              })($$Array.to_list(model[/* entries */0]))),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 4 : 
          var completed = param[1];
          var id$3 = param[0];
          var updateEntry$2 = function (t) {
            if (t[/* id */3] === id$3) {
              return /* record */[
                      /* description */t[/* description */0],
                      /* completed */completed,
                      /* editing */t[/* editing */2],
                      /* id */t[/* id */3]
                    ];
            }
            else {
              return t;
            }
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$2, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 5 : 
          var completed$1 = param[0];
          var updateEntry$3 = function (t) {
            return /* record */[
                    /* description */t[/* description */0],
                    /* completed */completed$1,
                    /* editing */t[/* editing */2],
                    /* id */t[/* id */3]
                  ];
          };
          return /* tuple */[
                  /* record */[
                    /* entries */$$Array.map(updateEntry$3, model[/* entries */0]),
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */model[/* visibility */3]
                  ],
                  /* NoCmd */0
                ];
      case 6 : 
          return /* tuple */[
                  /* record */[
                    /* entries */model[/* entries */0],
                    /* field */model[/* field */1],
                    /* uid */model[/* uid */2],
                    /* visibility */param[0]
                  ],
                  /* NoCmd */0
                ];
      
    }
  }
}

function onEnter($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var tagger = function (ev) {
    var match = ev.keyCode;
    if (match !== 13) {
      return /* None */0;
    }
    else {
      return /* Some */[msg];
    }
  };
  return Tea_html.on("keydown", /* Some */[key], tagger);
}

function viewEntry(todo) {
  var key = "" + todo[/* id */3];
  var b = todo[/* completed */1];
  var str = todo[/* description */0];
  var str$1 = "todo-" + todo[/* id */3];
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.classList(/* :: */[
                    /* tuple */[
                      "completed",
                      todo[/* completed */1]
                    ],
                    /* :: */[
                      /* tuple */[
                        "editing",
                        todo[/* editing */2]
                      ],
                      /* [] */0
                    ]
                  ]),
              /* [] */0
            ], /* :: */[
              Tea_html.div(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "view"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    Tea_html.input(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "className",
                              "toggle"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "type",
                                "checkbox"
                              ]),
                            /* :: */[
                              Tea_html.checked(todo[/* completed */1]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key + (
                                        b ? "true" : "false"
                                      )], /* Check */Block.__(4, [
                                        todo[/* id */3],
                                        !todo[/* completed */1]
                                      ])),
                                /* [] */0
                              ]
                            ]
                          ]
                        ], /* [] */0),
                    /* :: */[
                      Tea_html.label(/* None */0, /* None */0, /* :: */[
                            Tea_html.onDoubleClick(/* Some */[key], /* EditingEntry */Block.__(1, [
                                    todo[/* id */3],
                                    /* true */1
                                  ])),
                            /* [] */0
                          ], /* :: */[
                            /* Text */Block.__(0, [todo[/* description */0]]),
                            /* [] */0
                          ]),
                      /* :: */[
                        Tea_html.button(/* None */0, /* None */0, /* :: */[
                              /* RawProp */Block.__(0, [
                                  "className",
                                  "destroy"
                                ]),
                              /* :: */[
                                Tea_html.onClick(/* Some */[key], /* Delete */Block.__(3, [todo[/* id */3]])),
                                /* [] */0
                              ]
                            ], /* [] */0),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "edit"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "value",
                            str
                          ]),
                        /* :: */[
                          /* RawProp */Block.__(0, [
                              "name",
                              "title"
                            ]),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "id",
                                str$1
                              ]),
                            /* :: */[
                              Tea_html.onInput(/* Some */[key], function (value) {
                                    return /* UpdateEntry */Block.__(2, [
                                              todo[/* id */3],
                                              value
                                            ]);
                                  }),
                              /* :: */[
                                Tea_html.onBlur(/* Some */[key], /* EditingEntry */Block.__(1, [
                                        todo[/* id */3],
                                        /* false */0
                                      ])),
                                /* :: */[
                                  onEnter(/* Some */[key], /* EditingEntry */Block.__(1, [
                                          todo[/* id */3],
                                          /* false */0
                                        ])),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewEntries(visibility, entries) {
  var isVisible = function (todo) {
    switch (visibility) {
      case "Active" : 
          return !todo[/* completed */1];
      case "Completed" : 
          return todo[/* completed */1];
      default:
        return /* true */1;
    }
  };
  var allCompleted = $$Array.fold_left(function (b, param) {
        if (b) {
          return param[/* completed */1];
        }
        else {
          return /* false */0;
        }
      }, /* true */1, entries);
  var cssVisibility = entries.length ? "visible" : "hidden";
  return Tea_html.section(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "main"
                ]),
              /* :: */[
                Vdom.style("visibility", cssVisibility),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.input(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "toggle-all"
                      ]),
                    /* :: */[
                      /* RawProp */Block.__(0, [
                          "type",
                          "checkbox"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "name",
                            "toggle"
                          ]),
                        /* :: */[
                          Tea_html.checked(allCompleted),
                          /* :: */[
                            Tea_html.onClick(/* Some */[allCompleted ? "true" : "false"], /* CheckAll */Block.__(5, [!allCompleted])),
                            /* [] */0
                          ]
                        ]
                      ]
                    ]
                  ], /* [] */0),
              /* :: */[
                Tea_html.label(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "htmlFor",
                          "toggle-all"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Mark all as complete"]),
                      /* [] */0
                    ]),
                /* :: */[
                  Tea_html.ul(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "className",
                            "todo-list"
                          ]),
                        /* [] */0
                      ], List.map(viewEntry, List.filter(isVisible)($$Array.to_list(entries)))),
                  /* [] */0
                ]
              ]
            ]);
}

function viewInput(task) {
  return Tea_html.header(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "header"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.h1(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["todos"]),
                    /* [] */0
                  ]),
              /* :: */[
                Tea_html.input(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "className",
                          "new-todo"
                        ]),
                      /* :: */[
                        /* RawProp */Block.__(0, [
                            "placeholder",
                            "What needs to be done?"
                          ]),
                        /* :: */[
                          Tea_html.autofocus(/* true */1),
                          /* :: */[
                            /* RawProp */Block.__(0, [
                                "value",
                                task
                              ]),
                            /* :: */[
                              /* RawProp */Block.__(0, [
                                  "name",
                                  "newTodo"
                                ]),
                              /* :: */[
                                Tea_html.onInput(/* None */0, function (str) {
                                      return /* UpdateField */Block.__(0, [str]);
                                    }),
                                /* :: */[
                                  onEnter(/* None */0, /* Add */1),
                                  /* [] */0
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]
                    ], /* [] */0),
                /* [] */0
              ]
            ]);
}

function viewControlsCount(entriesLeft) {
  var item_ = entriesLeft === 1 ? " item" : " items";
  return Tea_html.span(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todo-count"
                ]),
              /* [] */0
            ], /* :: */[
              Tea_html.strong(/* None */0, /* None */0, /* [] */0, /* :: */[
                    /* Text */Block.__(0, ["" + entriesLeft]),
                    /* [] */0
                  ]),
              /* :: */[
                /* Text */Block.__(0, [item_ + " left"]),
                /* [] */0
              ]
            ]);
}

function visibilitySwap(uri, visibility, actualVisibility) {
  return Tea_html.li(/* None */0, /* None */0, /* :: */[
              Tea_html.onClick(/* Some */[visibility], /* ChangeVisibility */Block.__(6, [visibility])),
              /* [] */0
            ], /* :: */[
              Tea_html.a(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "href",
                        uri
                      ]),
                    /* :: */[
                      Tea_html.classList(/* :: */[
                            /* tuple */[
                              "selected",
                              +(visibility === actualVisibility)
                            ],
                            /* [] */0
                          ]),
                      /* [] */0
                    ]
                  ], /* :: */[
                    /* Text */Block.__(0, [visibility]),
                    /* [] */0
                  ]),
              /* [] */0
            ]);
}

function viewControlsFilters(visibility) {
  return Tea_html.ul(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "filters"
                ]),
              /* [] */0
            ], /* :: */[
              visibilitySwap("#/", "All", visibility),
              /* :: */[
                /* Text */Block.__(0, [" "]),
                /* :: */[
                  visibilitySwap("#/active", "Active", visibility),
                  /* :: */[
                    /* Text */Block.__(0, [" "]),
                    /* :: */[
                      visibilitySwap("#/completed", "Completed", visibility),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]);
}

function viewControlsClear(entriesCompleted) {
  return Tea_html.button(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "clear-completed"
                ]),
              /* :: */[
                Tea_html.hidden(+(entriesCompleted === 0)),
                /* :: */[
                  Tea_html.onClick(/* None */0, /* DeleteComplete */2),
                  /* [] */0
                ]
              ]
            ], /* :: */[
              /* Text */Block.__(0, ["Clear completed (" + (entriesCompleted + ")")]),
              /* [] */0
            ]);
}

function viewControls(visibility, entries) {
  var entriesCompleted = $$Array.fold_left(function (c, param) {
        if (param[/* completed */1]) {
          return c + 1 | 0;
        }
        else {
          return c;
        }
      }, 0, entries);
  var entriesLeft = entries.length - entriesCompleted | 0;
  return Tea_html.footer(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "footer"
                ]),
              /* :: */[
                Tea_html.hidden(+(entries.length === 0)),
                /* [] */0
              ]
            ], /* :: */[
              viewControlsCount(entriesLeft),
              /* :: */[
                viewControlsFilters(visibility),
                /* :: */[
                  viewControlsClear(entriesCompleted),
                  /* [] */0
                ]
              ]
            ]);
}

var infoFooter = Tea_html.footer(/* None */0, /* None */0, /* :: */[
      /* RawProp */Block.__(0, [
          "className",
          "info"
        ]),
      /* [] */0
    ], /* :: */[
      Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
            /* Text */Block.__(0, ["Double-click to edit a todo"]),
            /* [] */0
          ]),
      /* :: */[
        Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
              /* Text */Block.__(0, ["Written by "]),
              /* :: */[
                Tea_html.a(/* None */0, /* None */0, /* :: */[
                      /* RawProp */Block.__(0, [
                          "href",
                          "https://github.com/evancz"
                        ]),
                      /* [] */0
                    ], /* :: */[
                      /* Text */Block.__(0, ["Evan Czaplicki"]),
                      /* [] */0
                    ]),
                /* :: */[
                  /* Text */Block.__(0, [" and converted by "]),
                  /* :: */[
                    Tea_html.a(/* None */0, /* None */0, /* :: */[
                          /* RawProp */Block.__(0, [
                              "href",
                              "https://github.com/overminddl1"
                            ]),
                          /* [] */0
                        ], /* :: */[
                          /* Text */Block.__(0, ["OvermindDL1"]),
                          /* [] */0
                        ]),
                    /* [] */0
                  ]
                ]
              ]
            ]),
        /* :: */[
          Tea_html.p(/* None */0, /* None */0, /* [] */0, /* :: */[
                /* Text */Block.__(0, ["Part of "]),
                /* :: */[
                  Tea_html.a(/* None */0, /* None */0, /* :: */[
                        /* RawProp */Block.__(0, [
                            "href",
                            "http://todomvc.com"
                          ]),
                        /* [] */0
                      ], /* :: */[
                        /* Text */Block.__(0, ["TodoMVC"]),
                        /* [] */0
                      ]),
                  /* [] */0
                ]
              ]),
          /* [] */0
        ]
      ]
    ]);

function view(model) {
  return Tea_html.div(/* None */0, /* None */0, /* :: */[
              /* RawProp */Block.__(0, [
                  "className",
                  "todomvc-wrapper"
                ]),
              /* :: */[
                Vdom.style("visibility", "hidden"),
                /* [] */0
              ]
            ], /* :: */[
              Tea_html.section(/* None */0, /* None */0, /* :: */[
                    /* RawProp */Block.__(0, [
                        "className",
                        "todoapp"
                      ]),
                    /* [] */0
                  ], /* :: */[
                    viewInput(model[/* field */1]),
                    /* :: */[
                      viewEntries(model[/* visibility */3], model[/* entries */0]),
                      /* :: */[
                        viewControls(model[/* visibility */3], model[/* entries */0]),
                        /* [] */0
                      ]
                    ]
                  ]),
              /* :: */[
                infoFooter,
                /* [] */0
              ]
            ]);
}

var viewNew = view

function partial_arg_003() {
  return /* NoSub */0;
}

var partial_arg = /* record */[
  /* init */init,
  /* update */update,
  /* view */viewNew,
  partial_arg_003
];

function main(param, param$1) {
  return Tea_app.standardProgram(partial_arg, param, param$1);
}

exports.emptyModel          = emptyModel;
exports.newEntry            = newEntry;
exports.init                = init;
exports.update              = update;
exports.onEnter             = onEnter;
exports.viewEntry           = viewEntry;
exports.viewEntries         = viewEntries;
exports.viewInput           = viewInput;
exports.viewControlsCount   = viewControlsCount;
exports.visibilitySwap      = visibilitySwap;
exports.viewControlsFilters = viewControlsFilters;
exports.viewControlsClear   = viewControlsClear;
exports.viewControls        = viewControls;
exports.infoFooter          = infoFooter;
exports.view                = view;
exports.viewNew             = viewNew;
exports.main                = main;
/* infoFooter Not a pure module */

});

;require.register("src/tea.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_random = require("./tea_random");

var Cmd = 0;

var Sub = 0;

var App = 0;

var Html = 0;

var Svg = 0;

var Program = 0;

var Time = 0;

var Navigation = 0;

var Random = 0;

exports.Cmd        = Cmd;
exports.Sub        = Sub;
exports.App        = App;
exports.Html       = Html;
exports.Svg        = Svg;
exports.Program    = Program;
exports.Time       = Time;
exports.Navigation = Navigation;
exports.Random     = Random;
/* Tea_random Not a pure module */

});

;require.register("src/tea_app.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Js_primitive            = require("bs-platform/lib/js/js_primitive");
var Web                     = require("./web");
var Curry                   = require("bs-platform/lib/js/curry");
var Vdom                    = require("./vdom");
var Tea_sub                 = require("./tea_sub");
var List                    = require("bs-platform/lib/js/list");
var Tea_cmd                 = require("./tea_cmd");

function programStateWrapper(initModel, pump, shutdown) {
  var model = [initModel];
  var callbacks = [/* record */[/* enqueue */function () {
        console.log("INVALID enqueue CALL!");
        return /* () */0;
      }]];
  var pumperInterface = Curry._1(pump, callbacks);
  var pending = [/* None */0];
  var handler = function (msg) {
    var match = pending[0];
    if (match) {
      pending[0] = /* Some */[/* :: */[
          msg,
          match[0]
        ]];
      return /* () */0;
    }
    else {
      pending[0] = /* Some */[/* [] */0];
      var newModel = Curry._2(pumperInterface[/* handleMsg */1], model[0], msg);
      model[0] = newModel;
      var match$1 = pending[0];
      if (match$1) {
        var msgs = match$1[0];
        if (msgs) {
          pending[0] = /* None */0;
          return List.iter(handler, List.rev(msgs));
        }
        else {
          pending[0] = /* None */0;
          return /* () */0;
        }
      }
      else {
        throw [
              Caml_builtin_exceptions.failure,
              "INVALID message queue state, should never be None during message processing!"
            ];
      }
    }
  };
  var finalizedCBs = /* record */[/* enqueue */handler];
  callbacks[0] = finalizedCBs;
  var pi_requestShutdown = function () {
    callbacks[0] = /* record */[/* enqueue */function () {
        return /* () */0;
      }];
    var cmd = Curry._1(shutdown, model[0]);
    Curry._1(pumperInterface[/* shutdown */2], cmd);
    return /* () */0;
  };
  Curry._1(pumperInterface[/* startup */0], /* () */0);
  return {
          pushMsg: handler,
          shutdown: pi_requestShutdown
        };
}

function programLoop(update, view, subscriptions, initModel, initCmd, param) {
  if (param) {
    var parentNode = param[0];
    return function (callbacks) {
      var priorRenderedVdom = [/* [] */0];
      var latestModel = [initModel];
      var nextFrameID = [/* None */0];
      var doRender = function () {
        var match = nextFrameID[0];
        if (match) {
          var newVdom_000 = Curry._1(view, latestModel[0]);
          var newVdom = /* :: */[
            newVdom_000,
            /* [] */0
          ];
          var justRenderedVdom = Vdom.patchVNodesIntoElement(callbacks, parentNode, priorRenderedVdom[0], newVdom);
          priorRenderedVdom[0] = justRenderedVdom;
          nextFrameID[0] = /* None */0;
          return /* () */0;
        }
        else {
          return /* () */0;
        }
      };
      var scheduleRender = function () {
        var match = nextFrameID[0];
        if (match) {
          return /* () */0;
        }
        else {
          nextFrameID[0] = /* Some */[-1];
          return doRender(16);
        }
      };
      var clearPnode = function () {
        while(parentNode.childNodes.length > 0) {
          var match = parentNode.firstChild;
          if (match !== null) {
            parentNode.removeChild(match);
          }
          
        };
        return /* () */0;
      };
      var oldSub = [/* NoSub */0];
      var handleSubscriptionChange = function (model) {
        var newSub = Curry._1(subscriptions, model);
        oldSub[0] = Tea_sub.run(callbacks, oldSub[0], newSub);
        return /* () */0;
      };
      var handlerStartup = function () {
        clearPnode(/* () */0);
        Tea_cmd.run(callbacks, initCmd);
        handleSubscriptionChange(latestModel[0]);
        nextFrameID[0] = /* Some */[-1];
        doRender(16);
        return /* () */0;
      };
      var handler = function (model, msg) {
        var match = Curry._2(update, model, msg);
        var newModel = match[0];
        latestModel[0] = newModel;
        Tea_cmd.run(callbacks, match[1]);
        scheduleRender(/* () */0);
        handleSubscriptionChange(newModel);
        return newModel;
      };
      var handlerShutdown = function (cmd) {
        nextFrameID[0] = /* None */0;
        Tea_cmd.run(callbacks, cmd);
        oldSub[0] = Tea_sub.run(callbacks, oldSub[0], /* NoSub */0);
        priorRenderedVdom[0] = /* [] */0;
        clearPnode(/* () */0);
        return /* () */0;
      };
      return /* record */[
              /* startup */handlerStartup,
              /* handleMsg */handler,
              /* shutdown */handlerShutdown
            ];
    };
  }
  else {
    return function (callbacks) {
      var oldSub = [/* NoSub */0];
      var handleSubscriptionChange = function (model) {
        var newSub = Curry._1(subscriptions, model);
        oldSub[0] = Tea_sub.run(callbacks, oldSub[0], newSub);
        return /* () */0;
      };
      return /* record */[
              /* startup */function () {
                Tea_cmd.run(callbacks, initCmd);
                handleSubscriptionChange(initModel);
                return /* () */0;
              },
              /* handleMsg */function (model, msg) {
                var match = Curry._2(update, model, msg);
                var newModel = match[0];
                Tea_cmd.run(callbacks, match[1]);
                handleSubscriptionChange(newModel);
                return newModel;
              },
              /* shutdown */function (cmd) {
                Tea_cmd.run(callbacks, cmd);
                oldSub[0] = Tea_sub.run(callbacks, oldSub[0], /* NoSub */0);
                return /* () */0;
              }
            ];
    };
  }
}

function program(param, pnode, flags) {
  Web.polyfills(/* () */0);
  var match = Curry._1(param[/* init */0], flags);
  var initModel = match[0];
  var opnode = Js_primitive.js_from_nullable_def(pnode);
  var pumpInterface = programLoop(param[/* update */1], param[/* view */2], param[/* subscriptions */3], initModel, match[1], opnode);
  return programStateWrapper(initModel, pumpInterface, param[/* shutdown */4]);
}

function standardProgram(param, pnode, args) {
  return program(/* record */[
              /* init */param[/* init */0],
              /* update */param[/* update */1],
              /* view */param[/* view */2],
              /* subscriptions */param[/* subscriptions */3],
              /* shutdown */function () {
                return /* NoCmd */0;
              }
            ], pnode, args);
}

function beginnerProgram(param, pnode, _) {
  var update = param[/* update */1];
  var model = param[/* model */0];
  return standardProgram(/* record */[
              /* init */function () {
                return /* tuple */[
                        model,
                        /* NoCmd */0
                      ];
              },
              /* update */function (model, msg) {
                return /* tuple */[
                        Curry._2(update, model, msg),
                        /* NoCmd */0
                      ];
              },
              /* view */param[/* view */2],
              /* subscriptions */function () {
                return /* NoSub */0;
              }
            ], pnode, /* () */0);
}

var map = Vdom.map

exports.programStateWrapper = programStateWrapper;
exports.programLoop         = programLoop;
exports.program             = program;
exports.standardProgram     = standardProgram;
exports.beginnerProgram     = beginnerProgram;
exports.map                 = map;
/* No side effect */

});

;require.register("src/tea_cmd.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");
var Curry = require("bs-platform/lib/js/curry");
var Vdom  = require("./vdom");
var List  = require("bs-platform/lib/js/list");

function batch(cmds) {
  return /* Batch */Block.__(1, [cmds]);
}

function call(call$1) {
  return /* EnqueueCall */Block.__(2, [call$1]);
}

function fnMsg(fnMsg$1) {
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              return Curry._1(enqueue, Curry._1(fnMsg$1, /* () */0));
            }]);
}

function msg(msg$1) {
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              return Curry._1(enqueue, msg$1);
            }]);
}

function run(callbacks, param) {
  if (typeof param === "number") {
    return /* () */0;
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return Curry._1(param[0], callbacks);
      case 1 : 
          return List.fold_left(function (_, cmd) {
                      return run(callbacks, cmd);
                    }, /* () */0, param[0]);
      case 2 : 
          return Curry._1(param[0], callbacks[0][/* enqueue */0]);
      
    }
  }
}

function wrapCallbacks(func, callbacks) {
  return [/* record */[/* enqueue */function (msg) {
              return Curry._1(callbacks[0][/* enqueue */0], Curry._1(func, msg));
            }]];
}

function map(func, cmd) {
  return /* Tagger */Block.__(0, [function (callbacks) {
              return run(Vdom.wrapCallbacks(func, callbacks), cmd);
            }]);
}

var none = /* NoCmd */0;

exports.none          = none;
exports.batch         = batch;
exports.call          = call;
exports.fnMsg         = fnMsg;
exports.msg           = msg;
exports.run           = run;
exports.wrapCallbacks = wrapCallbacks;
exports.map           = map;
/* No side effect */

});

;require.register("src/tea_html.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block    = require("bs-platform/lib/js/block");
var Curry    = require("bs-platform/lib/js/curry");
var Vdom     = require("./vdom");
var $$String = require("bs-platform/lib/js/string");
var List     = require("bs-platform/lib/js/list");

function text(str) {
  return /* Text */Block.__(0, [str]);
}

var lazy1 = Vdom.lazyGen

function node($staropt$star, tagName, $staropt$star$1, $staropt$star$2, props, nodes) {
  var namespace = $staropt$star ? $staropt$star[0] : "";
  var key = $staropt$star$1 ? $staropt$star$1[0] : "";
  var unique = $staropt$star$2 ? $staropt$star$2[0] : "";
  return Vdom.fullnode(namespace, tagName, key, unique, props, nodes);
}

function br(props) {
  return Vdom.fullnode("", "br", "br", "br", props, /* [] */0);
}

function br$prime($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "br", key, unique, props, nodes);
}

function div($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "div", key, unique, props, nodes);
}

function span($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "span", key, unique, props, nodes);
}

function p($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "p", key, unique, props, nodes);
}

function a($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "a", key, unique, props, nodes);
}

function section($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "section", key, unique, props, nodes);
}

function header($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "header", key, unique, props, nodes);
}

function footer($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "footer", key, unique, props, nodes);
}

function h1($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "h1", key, unique, props, nodes);
}

function strong($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "strong", key, unique, props, nodes);
}

function button($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "button", key, unique, props, nodes);
}

function input($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "input", key, unique, props, nodes);
}

function label($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "label", key, unique, props, nodes);
}

function ul($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "ul", key, unique, props, nodes);
}

function ol($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "ol", key, unique, props, nodes);
}

function li($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode("", "li", key, unique, props, nodes);
}

function id(str) {
  return /* RawProp */Block.__(0, [
            "id",
            str
          ]);
}

function href(str) {
  return /* RawProp */Block.__(0, [
            "href",
            str
          ]);
}

function class$prime(name) {
  return /* RawProp */Block.__(0, [
            "className",
            name
          ]);
}

function classList(classes) {
  var name = $$String.concat(" ", List.map(function (param) {
            return param[0];
          }, List.filter(function (param) {
                  return param[1];
                })(classes)));
  return /* RawProp */Block.__(0, [
            "className",
            name
          ]);
}

function type$prime(typ) {
  return /* RawProp */Block.__(0, [
            "type",
            typ
          ]);
}

var style = Vdom.style

function styles(s) {
  return /* Style */Block.__(4, [s]);
}

function placeholder(str) {
  return /* RawProp */Block.__(0, [
            "placeholder",
            str
          ]);
}

function autofocus(b) {
  if (b) {
    return /* RawProp */Block.__(0, [
              "autofocus",
              "autofocus"
            ]);
  }
  else {
    return /* NoProp */0;
  }
}

function value(str) {
  return /* RawProp */Block.__(0, [
            "value",
            str
          ]);
}

function name(str) {
  return /* RawProp */Block.__(0, [
            "name",
            str
          ]);
}

function checked(b) {
  if (b) {
    return /* RawProp */Block.__(0, [
              "checked",
              "checked"
            ]);
  }
  else {
    return /* NoProp */0;
  }
}

function for$prime(str) {
  return /* RawProp */Block.__(0, [
            "htmlFor",
            str
          ]);
}

function hidden(b) {
  if (b) {
    return /* RawProp */Block.__(0, [
              "hidden",
              "hidden"
            ]);
  }
  else {
    return /* NoProp */0;
  }
}

function onKeyed(typ, key, cb) {
  return /* Event */Block.__(3, [
            typ,
            key,
            cb
          ]);
}

function on(typ, $staropt$star, cb) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            typ,
            key,
            cb
          ]);
}

function onInput($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            "input",
            key,
            function (ev) {
              var match = ev.target;
              if (match !== undefined) {
                var match$1 = match.value;
                if (match$1 !== undefined) {
                  return /* Some */[Curry._1(msg, match$1)];
                }
                else {
                  return /* None */0;
                }
              }
              else {
                return /* None */0;
              }
            }
          ]);
}

function onClick($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            "click",
            key,
            function () {
              return /* Some */[msg];
            }
          ]);
}

function onDoubleClick($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            "dblclick",
            key,
            function () {
              return /* Some */[msg];
            }
          ]);
}

function onBlur($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            "blur",
            key,
            function () {
              return /* Some */[msg];
            }
          ]);
}

function onFocus($staropt$star, msg) {
  var key = $staropt$star ? $staropt$star[0] : "";
  return /* Event */Block.__(3, [
            "focus",
            key,
            function () {
              return /* Some */[msg];
            }
          ]);
}

var Cmds = 0;

var noNode = /* NoVNode */0;

exports.Cmds          = Cmds;
exports.noNode        = noNode;
exports.text          = text;
exports.lazy1         = lazy1;
exports.node          = node;
exports.br            = br;
exports.br$prime      = br$prime;
exports.div           = div;
exports.span          = span;
exports.p             = p;
exports.a             = a;
exports.section       = section;
exports.header        = header;
exports.footer        = footer;
exports.h1            = h1;
exports.strong        = strong;
exports.button        = button;
exports.input         = input;
exports.label         = label;
exports.ul            = ul;
exports.ol            = ol;
exports.li            = li;
exports.id            = id;
exports.href          = href;
exports.class$prime   = class$prime;
exports.classList     = classList;
exports.type$prime    = type$prime;
exports.style         = style;
exports.styles        = styles;
exports.placeholder   = placeholder;
exports.autofocus     = autofocus;
exports.value         = value;
exports.name          = name;
exports.checked       = checked;
exports.for$prime     = for$prime;
exports.hidden        = hidden;
exports.onKeyed       = onKeyed;
exports.on            = on;
exports.onInput       = onInput;
exports.onClick       = onClick;
exports.onDoubleClick = onDoubleClick;
exports.onBlur        = onBlur;
exports.onFocus       = onFocus;
/* No side effect */

});

;require.register("src/tea_html_cmds.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Js_primitive = require("bs-platform/lib/js/js_primitive");
var Block        = require("bs-platform/lib/js/block");

function focus(id) {
  return /* EnqueueCall */Block.__(2, [function () {
              var match = document.getElementById(id);
              if (Js_primitive.js_is_nil_undef(match)) {
                console.log(/* tuple */[
                      "Attempted to focus a non-existant element of: ",
                      id
                    ]);
                return /* () */0;
              }
              else {
                var ecb = function () {
                  return match.focus();
                };
                var cb = function () {
                  window.requestAnimationFrame(ecb);
                  return /* () */0;
                };
                window.requestAnimationFrame(cb);
                return /* () */0;
              }
            }]);
}

exports.focus = focus;
/* No side effect */

});

;require.register("src/tea_navigation.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app            = require("./tea_app");
var Web_window_history = require("./web_window_history");
var Block              = require("bs-platform/lib/js/block");
var Curry              = require("bs-platform/lib/js/curry");
var Web_location       = require("./web_location");
var Vdom               = require("./vdom");
var Tea_sub            = require("./tea_sub");
var Web_window         = require("./web_window");
var Tea_cmd            = require("./tea_cmd");

function getLocation() {
  return Web_location.asRecord(document.location);
}

var notifier = [/* None */0];

function notifyUrlChange() {
  var match = notifier[0];
  if (match) {
    var $$location = Web_location.asRecord(document.location);
    Curry._1(match[0], $$location);
    return /* () */0;
  }
  else {
    return /* () */0;
  }
}

function subscribe(tagger) {
  var enableCall = function (callbacks) {
    var notifyHandler = function ($$location) {
      return Curry._1(callbacks[/* enqueue */0], Curry._1(tagger, $$location));
    };
    notifier[0] = /* Some */[notifyHandler];
    var handler = function () {
      return notifyUrlChange(/* () */0);
    };
    Web_window.addEventListener("popstate", handler, /* false */0);
    return function () {
      return Web_window.removeEventListener("popstate", handler, /* false */0);
    };
  };
  return Tea_sub.registration("navigation", enableCall);
}

function replaceState(url) {
  return Web_window_history.replaceState(window, JSON.parse("{}"), "", url);
}

function pushState(url) {
  return Web_window_history.pushState(window, JSON.parse("{}"), "", url);
}

function modifyUrl(url) {
  return /* EnqueueCall */Block.__(2, [function () {
              replaceState(url);
              notifyUrlChange(/* () */0);
              return /* () */0;
            }]);
}

function newUrl(url) {
  return /* EnqueueCall */Block.__(2, [function () {
              pushState(url);
              notifyUrlChange(/* () */0);
              return /* () */0;
            }]);
}

function navigationProgram(parser, param) {
  var shutdown = param[/* shutdown */5];
  var subscriptions = param[/* subscriptions */4];
  var view = param[/* view */3];
  var update = param[/* update */2];
  var init = param[/* init */1];
  var urlUpdate = param[/* urlUpdate */0];
  var init$prime = function (flag) {
    var initLocation = Web_location.asRecord(document.location);
    var match = Curry._2(init, flag, Curry._1(parser, initLocation));
    return /* tuple */[
            match[0],
            Tea_cmd.map(function (msg) {
                  return /* UserMsg */Block.__(1, [msg]);
                }, match[1])
          ];
  };
  var update$prime = function (model, msg) {
    var match;
    match = msg.tag ? Curry._2(update, model, msg[0]) : Curry._2(urlUpdate, model, Curry._1(parser, msg[0]));
    return /* tuple */[
            match[0],
            Tea_cmd.map(function (msg) {
                  return /* UserMsg */Block.__(1, [msg]);
                }, match[1])
          ];
  };
  var wrapUserMsg = function (userMsg) {
    return /* UserMsg */Block.__(1, [userMsg]);
  };
  var view$prime = function (model) {
    var vdom = Curry._1(view, model);
    return Vdom.map(wrapUserMsg, vdom);
  };
  var subscriptions$prime = function (model) {
    return /* Batch */Block.__(0, [/* :: */[
                subscribe(function ($$location) {
                      return /* Change */Block.__(0, [$$location]);
                    }),
                /* :: */[
                  Tea_sub.map(function (userMsg) {
                        return /* UserMsg */Block.__(1, [userMsg]);
                      }, Curry._1(subscriptions, model)),
                  /* [] */0
                ]
              ]]);
  };
  var shutdown$prime = function (model) {
    var cmd = Curry._1(shutdown, model);
    return Tea_cmd.map(function (msg) {
                return /* UserMsg */Block.__(1, [msg]);
              }, cmd);
  };
  var partial_arg = /* record */[
    /* init */init$prime,
    /* update */update$prime,
    /* view */view$prime,
    /* subscriptions */subscriptions$prime,
    /* shutdown */shutdown$prime
  ];
  return function (param, param$1) {
    return Tea_app.program(partial_arg, param, param$1);
  };
}

exports.getLocation       = getLocation;
exports.notifier          = notifier;
exports.notifyUrlChange   = notifyUrlChange;
exports.subscribe         = subscribe;
exports.replaceState      = replaceState;
exports.pushState         = pushState;
exports.modifyUrl         = modifyUrl;
exports.newUrl            = newUrl;
exports.navigationProgram = navigationProgram;
/* No side effect */

});

;require.register("src/tea_program.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Curry = require("bs-platform/lib/js/curry");

function spawn(initState, update, shutdown) {
  var state = [/* Some */[initState]];
  return function (procMsg) {
    var match = state[0];
    if (match) {
      var model = match[0];
      if (procMsg) {
        state[0] = Curry._2(update, model, procMsg[0]);
        return /* () */0;
      }
      else {
        Curry._1(shutdown, model);
        state[0] = /* None */0;
        return /* () */0;
      }
    }
    else {
      return /* () */0;
    }
  };
}

var testing1 = 42;

exports.spawn    = spawn;
exports.testing1 = testing1;
/* No side effect */

});

;require.register("src/tea_random.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Pervasives = require("bs-platform/lib/js/pervasives");
var Block      = require("bs-platform/lib/js/block");
var Curry      = require("bs-platform/lib/js/curry");
var Random     = require("bs-platform/lib/js/random");

Random.self_init(/* () */0);

var bool = /* Generator */[function (state) {
    return Curry._1(Random.State[/* bool */9], state);
  }];

function $$int(min, max) {
  return /* Generator */[function (state) {
            return min + Curry._2(Random.State[/* int */4], state, max) | 0;
          }];
}

function $$float(min, max) {
  return /* Generator */[function (state) {
            return min + Curry._2(Random.State[/* float */8], state, max);
          }];
}

function list(count, param) {
  var genCmd = param[0];
  var buildList = function (state, i) {
    if (i > 0) {
      return /* :: */[
              Curry._1(genCmd, state),
              buildList(state, i - 1 | 0)
            ];
    }
    else {
      return /* [] */0;
    }
  };
  return /* Generator */[function (state) {
            return buildList(state, count);
          }];
}

function map(func, param) {
  var genCmd = param[0];
  return /* Generator */[function (state) {
            return Curry._1(func, Curry._1(genCmd, state));
          }];
}

function map2(func, param, param$1) {
  var genCmd2 = param$1[0];
  var genCmd1 = param[0];
  return /* Generator */[function (state) {
            var res1 = Curry._1(genCmd1, state);
            var res2 = Curry._1(genCmd2, state);
            return Curry._2(func, res1, res2);
          }];
}

function map3(func, param, param$1, param$2) {
  var genCmd3 = param$2[0];
  var genCmd2 = param$1[0];
  var genCmd1 = param[0];
  return /* Generator */[function (state) {
            var res1 = Curry._1(genCmd1, state);
            var res2 = Curry._1(genCmd2, state);
            var res3 = Curry._1(genCmd3, state);
            return Curry._3(func, res1, res2, res3);
          }];
}

function map4(func, param, param$1, param$2, param$3) {
  var genCmd4 = param$3[0];
  var genCmd3 = param$2[0];
  var genCmd2 = param$1[0];
  var genCmd1 = param[0];
  return /* Generator */[function (state) {
            var res1 = Curry._1(genCmd1, state);
            var res2 = Curry._1(genCmd2, state);
            var res3 = Curry._1(genCmd3, state);
            var res4 = Curry._1(genCmd4, state);
            return Curry._4(func, res1, res2, res3, res4);
          }];
}

function map5(func, param, param$1, param$2, param$3, param$4) {
  var genCmd5 = param$4[0];
  var genCmd4 = param$3[0];
  var genCmd3 = param$2[0];
  var genCmd2 = param$1[0];
  var genCmd1 = param[0];
  return /* Generator */[function (state) {
            var res1 = Curry._1(genCmd1, state);
            var res2 = Curry._1(genCmd2, state);
            var res3 = Curry._1(genCmd3, state);
            var res4 = Curry._1(genCmd4, state);
            var res5 = Curry._1(genCmd5, state);
            return Curry._5(func, res1, res2, res3, res4, res5);
          }];
}

function andThen(func, param) {
  var genCmd = param[0];
  return /* Generator */[function (state) {
            var res = Curry._1(genCmd, state);
            var match = Curry._1(func, res);
            return Curry._1(match[0], state);
          }];
}

function pair(gen1, gen2) {
  return map2(function (a, b) {
              return /* tuple */[
                      a,
                      b
                    ];
            }, gen1, gen2);
}

function generate(tagger, param) {
  var genCmd = param[0];
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              var state = Random.get_state(/* () */0);
              var genValue = Curry._1(genCmd, state);
              return Curry._1(enqueue, Curry._1(tagger, genValue));
            }]);
}

function step(param, param$1) {
  var newState = Curry._1(Random.State[/* copy */2], param$1[0]);
  return /* tuple */[
          Curry._1(param[0], newState),
          /* Seed */[newState]
        ];
}

function initialSeed(seed) {
  return /* Seed */[Curry._1(Random.State[/* make */0], /* int array */[seed])];
}

var minInt = Pervasives.min_int;

var maxInt = Pervasives.max_int;

var minFloat = Pervasives.min_float;

var maxFloat = Pervasives.max_float;

exports.minInt      = minInt;
exports.maxInt      = maxInt;
exports.minFloat    = minFloat;
exports.maxFloat    = maxFloat;
exports.bool        = bool;
exports.$$int       = $$int;
exports.$$float     = $$float;
exports.list        = list;
exports.map         = map;
exports.map2        = map2;
exports.map3        = map3;
exports.map4        = map4;
exports.map5        = map5;
exports.andThen     = andThen;
exports.pair        = pair;
exports.generate    = generate;
exports.step        = step;
exports.initialSeed = initialSeed;
/*  Not a pure module */

});

;require.register("src/tea_sub.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");
var Curry = require("bs-platform/lib/js/curry");
var List  = require("bs-platform/lib/js/list");

function batch(subs) {
  return /* Batch */Block.__(0, [subs]);
}

function registration(key, enableCall) {
  return /* Registration */Block.__(1, [
            key,
            function (callbacks) {
              return Curry._1(enableCall, callbacks[0]);
            },
            [/* None */0]
          ]);
}

function run(_callbacks, _oldSub, _newSub) {
  while(true) {
    var newSub = _newSub;
    var oldSub = _oldSub;
    var callbacks = _callbacks;
    var enable = function (_callbacks, _param) {
      while(true) {
        var param = _param;
        var callbacks = _callbacks;
        if (typeof param === "number") {
          return /* () */0;
        }
        else {
          switch (param.tag | 0) {
            case 0 : 
                var subs = param[0];
                if (subs) {
                  return List.fold_left((function(callbacks){
                            return function (_, sub) {
                              return enable(callbacks, sub);
                            }
                            }(callbacks)), /* () */0, subs);
                }
                else {
                  return /* () */0;
                }
            case 1 : 
                param[2][0] = /* Some */[Curry._1(param[1], callbacks)];
                return /* () */0;
            case 2 : 
                _param = param[1];
                _callbacks = Curry._1(param[0], callbacks);
                continue ;
                
          }
        }
      };
    };
    var disable = function (_param) {
      while(true) {
        var param = _param;
        if (typeof param === "number") {
          return /* () */0;
        }
        else {
          switch (param.tag | 0) {
            case 0 : 
                var subs = param[0];
                if (subs) {
                  return List.fold_left(function (_, sub) {
                              return disable(sub);
                            }, /* () */0, subs);
                }
                else {
                  return /* () */0;
                }
            case 1 : 
                var match = param[2][0];
                if (match) {
                  return Curry._1(match[0], /* () */0);
                }
                else {
                  return /* () */0;
                }
            case 2 : 
                _param = param[1];
                continue ;
                
          }
        }
      };
    };
    var exit = 0;
    if (typeof oldSub === "number") {
      if (typeof newSub === "number") {
        return newSub;
      }
      else {
        exit = 1;
      }
    }
    else {
      switch (oldSub.tag | 0) {
        case 0 : 
            if (typeof newSub === "number") {
              exit = 1;
            }
            else if (newSub.tag) {
              exit = 1;
            }
            else {
              var aux = (function(callbacks){
              return function (_idx, _oldList, _newList) {
                while(true) {
                  var newList = _newList;
                  var oldList = _oldList;
                  var idx = _idx;
                  if (oldList) {
                    var oldS = oldList[0];
                    if (newList) {
                      run(callbacks, oldS, newList[0]);
                      return /* () */0;
                    }
                    else {
                      disable(oldS);
                      _newList = oldList[1];
                      _oldList = /* [] */0;
                      _idx = idx + 1 | 0;
                      continue ;
                      
                    }
                  }
                  else if (newList) {
                    enable(callbacks, newList[0]);
                    _newList = newList[1];
                    _oldList = /* [] */0;
                    _idx = idx + 1 | 0;
                    continue ;
                    
                  }
                  else {
                    return /* () */0;
                  }
                };
              }
              }(callbacks));
              aux(0, oldSub[0], newSub[0]);
              return newSub;
            }
            break;
        case 1 : 
            if (typeof newSub === "number") {
              exit = 1;
            }
            else if (newSub.tag === 1) {
              if (oldSub[0] === newSub[0]) {
                newSub[2][0] = oldSub[2][0];
                return newSub;
              }
              else {
                exit = 1;
              }
            }
            else {
              exit = 1;
            }
            break;
        case 2 : 
            if (typeof newSub === "number") {
              exit = 1;
            }
            else if (newSub.tag === 2) {
              _newSub = newSub[1];
              _oldSub = oldSub[1];
              _callbacks = Curry._1(newSub[0], callbacks);
              continue ;
              
            }
            else {
              exit = 1;
            }
            break;
        
      }
    }
    if (exit === 1) {
      disable(oldSub);
      enable(callbacks, newSub);
      return newSub;
    }
    
  };
}

function wrapCallbacks(func, callbacks) {
  return [/* record */[/* enqueue */function (msg) {
              return Curry._1(callbacks[0][/* enqueue */0], Curry._1(func, msg));
            }]];
}

function map(func, vdom) {
  var tagger = function (callbacks) {
    return [/* record */[/* enqueue */function (msg) {
                return Curry._1(callbacks[0][/* enqueue */0], Curry._1(func, msg));
              }]];
  };
  return /* Tagger */Block.__(2, [
            tagger,
            vdom
          ]);
}

var none = /* NoSub */0;

exports.none          = none;
exports.batch         = batch;
exports.registration  = registration;
exports.run           = run;
exports.wrapCallbacks = wrapCallbacks;
exports.map           = map;
/* No side effect */

});

;require.register("src/tea_svg.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");
var Vdom  = require("./vdom");

var svgNamespace = "http://www.w3.org/2000/svg";

function text(str) {
  return /* Text */Block.__(0, [str]);
}

var lazy1 = Vdom.lazyGen

function node(tagName, $staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, tagName, key, unique, props, nodes);
}

function svg($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "svg", key, unique, props, nodes);
}

function foreignObject($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "foreignObject", key, unique, props, nodes);
}

function animate($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "animate", key, unique, props, nodes);
}

function animateColor($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "animateColor", key, unique, props, nodes);
}

function animateMotion($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "animateMotion", key, unique, props, nodes);
}

function animateTransform($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "animateTransform", key, unique, props, nodes);
}

function mpath($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "mpath", key, unique, props, nodes);
}

function set($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "set", key, unique, props, nodes);
}

function a($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "a", key, unique, props, nodes);
}

function defs($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "defs", key, unique, props, nodes);
}

function g($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "g", key, unique, props, nodes);
}

function marker($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "marker", key, unique, props, nodes);
}

function mask($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "mask", key, unique, props, nodes);
}

function missingGlyph($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "missingGlyph", key, unique, props, nodes);
}

function pattern($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "pattern", key, unique, props, nodes);
}

function $$switch($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "switch", key, unique, props, nodes);
}

function symbol($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "symbol", key, unique, props, nodes);
}

function desc($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "desc", key, unique, props, nodes);
}

function metadata($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "metadata", key, unique, props, nodes);
}

function title($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "title", key, unique, props, nodes);
}

function feBlend($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feBlend", key, unique, props, nodes);
}

function feColorMatrix($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feColorMatrix", key, unique, props, nodes);
}

function feComponentTransfer($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feComponentTransfer", key, unique, props, nodes);
}

function feComposite($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feComposite", key, unique, props, nodes);
}

function feConvolveMatrix($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feConvolveMatrix", key, unique, props, nodes);
}

function feDiffuseLighting($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feDiffuseLighting", key, unique, props, nodes);
}

function feDisplacementMap($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feDisplacementMap", key, unique, props, nodes);
}

function feFlood($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feFlood", key, unique, props, nodes);
}

function feFuncA($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feFuncA", key, unique, props, nodes);
}

function feFuncB($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feFuncB", key, unique, props, nodes);
}

function feFuncG($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feFuncG", key, unique, props, nodes);
}

function feFuncR($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feFuncR", key, unique, props, nodes);
}

function feGaussianBlur($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feGaussianBlur", key, unique, props, nodes);
}

function feImage($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feImage", key, unique, props, nodes);
}

function feMerge($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feMerge", key, unique, props, nodes);
}

function feMergeNode($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feMergeNode", key, unique, props, nodes);
}

function feMorphology($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feMorphology", key, unique, props, nodes);
}

function feOffset($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feOffset", key, unique, props, nodes);
}

function feSpecularLighting($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feSpecularLighting", key, unique, props, nodes);
}

function feTile($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feTile", key, unique, props, nodes);
}

function feTurbulence($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feTurbulence", key, unique, props, nodes);
}

function font($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "font", key, unique, props, nodes);
}

function fontFace($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fontFace", key, unique, props, nodes);
}

function fontFaceFormat($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fontFaceFormat", key, unique, props, nodes);
}

function fontFaceName($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fontFaceName", key, unique, props, nodes);
}

function fontFaceSrc($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fontFaceSrc", key, unique, props, nodes);
}

function fontFaceUri($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fontFaceUri", key, unique, props, nodes);
}

function hkern($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "hkern", key, unique, props, nodes);
}

function vkern($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "vkern", key, unique, props, nodes);
}

function linearGradient($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "linearGradient", key, unique, props, nodes);
}

function radialGradient($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "radialGradient", key, unique, props, nodes);
}

function stop($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "stop", key, unique, props, nodes);
}

function circle($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "circle", key, unique, props, nodes);
}

function ellipse($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "ellipse", key, unique, props, nodes);
}

function svgimage($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "image", key, unique, props, nodes);
}

function line($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "line", key, unique, props, nodes);
}

function path($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "path", key, unique, props, nodes);
}

function polygon($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "polygon", key, unique, props, nodes);
}

function polyline($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "polyline", key, unique, props, nodes);
}

function rect($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "rect", key, unique, props, nodes);
}

function use($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "use", key, unique, props, nodes);
}

function feDistantLight($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feDistantLight", key, unique, props, nodes);
}

function fePointLight($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "fePointLight", key, unique, props, nodes);
}

function feSpotLight($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "feSpotLight", key, unique, props, nodes);
}

function altGlyph($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "altGlyph", key, unique, props, nodes);
}

function altGlyphDef($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "altGlyphDef", key, unique, props, nodes);
}

function altGlyphItem($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "altGlyphItem", key, unique, props, nodes);
}

function glyph($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "glyph", key, unique, props, nodes);
}

function glyphRef($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "glyphRef", key, unique, props, nodes);
}

function textPath($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "textPath", key, unique, props, nodes);
}

function text$prime($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "text", key, unique, props, nodes);
}

function tref($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "tref", key, unique, props, nodes);
}

function tspan($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "tspan", key, unique, props, nodes);
}

function clipPath($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "clipPath", key, unique, props, nodes);
}

function svgcolorProfile($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "colorProfile", key, unique, props, nodes);
}

function cursor($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "cursor", key, unique, props, nodes);
}

function filter($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "filter", key, unique, props, nodes);
}

function script($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "script", key, unique, props, nodes);
}

function style($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "style", key, unique, props, nodes);
}

function view($staropt$star, $staropt$star$1, props, nodes) {
  var key = $staropt$star ? $staropt$star[0] : "";
  var unique = $staropt$star$1 ? $staropt$star$1[0] : "";
  return Vdom.fullnode(svgNamespace, "view", key, unique, props, nodes);
}

var Cmds = 0;

var Attributes = 0;

var Events = 0;

var noNode = /* NoVNode */0;

exports.Cmds                = Cmds;
exports.Attributes          = Attributes;
exports.Events              = Events;
exports.svgNamespace        = svgNamespace;
exports.noNode              = noNode;
exports.text                = text;
exports.lazy1               = lazy1;
exports.node                = node;
exports.svg                 = svg;
exports.foreignObject       = foreignObject;
exports.animate             = animate;
exports.animateColor        = animateColor;
exports.animateMotion       = animateMotion;
exports.animateTransform    = animateTransform;
exports.mpath               = mpath;
exports.set                 = set;
exports.a                   = a;
exports.defs                = defs;
exports.g                   = g;
exports.marker              = marker;
exports.mask                = mask;
exports.missingGlyph        = missingGlyph;
exports.pattern             = pattern;
exports.$$switch            = $$switch;
exports.symbol              = symbol;
exports.desc                = desc;
exports.metadata            = metadata;
exports.title               = title;
exports.feBlend             = feBlend;
exports.feColorMatrix       = feColorMatrix;
exports.feComponentTransfer = feComponentTransfer;
exports.feComposite         = feComposite;
exports.feConvolveMatrix    = feConvolveMatrix;
exports.feDiffuseLighting   = feDiffuseLighting;
exports.feDisplacementMap   = feDisplacementMap;
exports.feFlood             = feFlood;
exports.feFuncA             = feFuncA;
exports.feFuncB             = feFuncB;
exports.feFuncG             = feFuncG;
exports.feFuncR             = feFuncR;
exports.feGaussianBlur      = feGaussianBlur;
exports.feImage             = feImage;
exports.feMerge             = feMerge;
exports.feMergeNode         = feMergeNode;
exports.feMorphology        = feMorphology;
exports.feOffset            = feOffset;
exports.feSpecularLighting  = feSpecularLighting;
exports.feTile              = feTile;
exports.feTurbulence        = feTurbulence;
exports.font                = font;
exports.fontFace            = fontFace;
exports.fontFaceFormat      = fontFaceFormat;
exports.fontFaceName        = fontFaceName;
exports.fontFaceSrc         = fontFaceSrc;
exports.fontFaceUri         = fontFaceUri;
exports.hkern               = hkern;
exports.vkern               = vkern;
exports.linearGradient      = linearGradient;
exports.radialGradient      = radialGradient;
exports.stop                = stop;
exports.circle              = circle;
exports.ellipse             = ellipse;
exports.svgimage            = svgimage;
exports.line                = line;
exports.path                = path;
exports.polygon             = polygon;
exports.polyline            = polyline;
exports.rect                = rect;
exports.use                 = use;
exports.feDistantLight      = feDistantLight;
exports.fePointLight        = fePointLight;
exports.feSpotLight         = feSpotLight;
exports.altGlyph            = altGlyph;
exports.altGlyphDef         = altGlyphDef;
exports.altGlyphItem        = altGlyphItem;
exports.glyph               = glyph;
exports.glyphRef            = glyphRef;
exports.textPath            = textPath;
exports.text$prime          = text$prime;
exports.tref                = tref;
exports.tspan               = tspan;
exports.clipPath            = clipPath;
exports.svgcolorProfile     = svgcolorProfile;
exports.cursor              = cursor;
exports.filter              = filter;
exports.script              = script;
exports.style               = style;
exports.view                = view;
/* No side effect */

});

;require.register("src/tea_svg_attributes.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");

function accentHeight(param) {
  return /* Attribute */Block.__(1, [
            "",
            "accent-height",
            param
          ]);
}

function accelerate(param) {
  return /* Attribute */Block.__(1, [
            "",
            "accelerate",
            param
          ]);
}

function accumulate(param) {
  return /* Attribute */Block.__(1, [
            "",
            "accumulate",
            param
          ]);
}

function additive(param) {
  return /* Attribute */Block.__(1, [
            "",
            "additive",
            param
          ]);
}

function alphabetic(param) {
  return /* Attribute */Block.__(1, [
            "",
            "alphabetic",
            param
          ]);
}

function allowReorder(param) {
  return /* Attribute */Block.__(1, [
            "",
            "allowReorder",
            param
          ]);
}

function amplitude(param) {
  return /* Attribute */Block.__(1, [
            "",
            "amplitude",
            param
          ]);
}

function arabicForm(param) {
  return /* Attribute */Block.__(1, [
            "",
            "arabic-form",
            param
          ]);
}

function ascent(param) {
  return /* Attribute */Block.__(1, [
            "",
            "ascent",
            param
          ]);
}

function attributeName(param) {
  return /* Attribute */Block.__(1, [
            "",
            "attributeName",
            param
          ]);
}

function attributeType(param) {
  return /* Attribute */Block.__(1, [
            "",
            "attributeType",
            param
          ]);
}

function autoReverse(param) {
  return /* Attribute */Block.__(1, [
            "",
            "autoReverse",
            param
          ]);
}

function azimuth(param) {
  return /* Attribute */Block.__(1, [
            "",
            "azimuth",
            param
          ]);
}

function baseFrequency(param) {
  return /* Attribute */Block.__(1, [
            "",
            "baseFrequency",
            param
          ]);
}

function baseProfile(param) {
  return /* Attribute */Block.__(1, [
            "",
            "baseProfile",
            param
          ]);
}

function bbox(param) {
  return /* Attribute */Block.__(1, [
            "",
            "bbox",
            param
          ]);
}

function begin$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "begin",
            param
          ]);
}

function bias(param) {
  return /* Attribute */Block.__(1, [
            "",
            "bias",
            param
          ]);
}

function by(param) {
  return /* Attribute */Block.__(1, [
            "",
            "by",
            param
          ]);
}

function calcMode(param) {
  return /* Attribute */Block.__(1, [
            "",
            "calcMode",
            param
          ]);
}

function capHeight(param) {
  return /* Attribute */Block.__(1, [
            "",
            "cap-height",
            param
          ]);
}

function class$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "class",
            param
          ]);
}

function clipPathUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "clipPathUnits",
            param
          ]);
}

function contentScriptType(param) {
  return /* Attribute */Block.__(1, [
            "",
            "contentScriptType",
            param
          ]);
}

function contentStyleType(param) {
  return /* Attribute */Block.__(1, [
            "",
            "contentStyleType",
            param
          ]);
}

function cx(param) {
  return /* Attribute */Block.__(1, [
            "",
            "cx",
            param
          ]);
}

function cy(param) {
  return /* Attribute */Block.__(1, [
            "",
            "cy",
            param
          ]);
}

function d(param) {
  return /* Attribute */Block.__(1, [
            "",
            "d",
            param
          ]);
}

function decelerate(param) {
  return /* Attribute */Block.__(1, [
            "",
            "decelerate",
            param
          ]);
}

function descent(param) {
  return /* Attribute */Block.__(1, [
            "",
            "descent",
            param
          ]);
}

function diffuseConstant(param) {
  return /* Attribute */Block.__(1, [
            "",
            "diffuseConstant",
            param
          ]);
}

function divisor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "divisor",
            param
          ]);
}

function dur(param) {
  return /* Attribute */Block.__(1, [
            "",
            "dur",
            param
          ]);
}

function dx(param) {
  return /* Attribute */Block.__(1, [
            "",
            "dx",
            param
          ]);
}

function dy(param) {
  return /* Attribute */Block.__(1, [
            "",
            "dy",
            param
          ]);
}

function edgeMode(param) {
  return /* Attribute */Block.__(1, [
            "",
            "edgeMode",
            param
          ]);
}

function elevation(param) {
  return /* Attribute */Block.__(1, [
            "",
            "elevation",
            param
          ]);
}

function end$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "end",
            param
          ]);
}

function exponent(param) {
  return /* Attribute */Block.__(1, [
            "",
            "exponent",
            param
          ]);
}

function externalResourcesRequired(param) {
  return /* Attribute */Block.__(1, [
            "",
            "externalResourcesRequired",
            param
          ]);
}

function filterRes(param) {
  return /* Attribute */Block.__(1, [
            "",
            "filterRes",
            param
          ]);
}

function filterUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "filterUnits",
            param
          ]);
}

function format(param) {
  return /* Attribute */Block.__(1, [
            "",
            "format",
            param
          ]);
}

function from(param) {
  return /* Attribute */Block.__(1, [
            "",
            "from",
            param
          ]);
}

function fx(param) {
  return /* Attribute */Block.__(1, [
            "",
            "fx",
            param
          ]);
}

function fy(param) {
  return /* Attribute */Block.__(1, [
            "",
            "fy",
            param
          ]);
}

function g1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "g1",
            param
          ]);
}

function g2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "g2",
            param
          ]);
}

function glyphName(param) {
  return /* Attribute */Block.__(1, [
            "",
            "glyph-name",
            param
          ]);
}

function glyphRef(param) {
  return /* Attribute */Block.__(1, [
            "",
            "glyphRef",
            param
          ]);
}

function gradientTransform(param) {
  return /* Attribute */Block.__(1, [
            "",
            "gradientTransform",
            param
          ]);
}

function gradientUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "gradientUnits",
            param
          ]);
}

function hanging(param) {
  return /* Attribute */Block.__(1, [
            "",
            "hanging",
            param
          ]);
}

function height(param) {
  return /* Attribute */Block.__(1, [
            "",
            "height",
            param
          ]);
}

function horizAdvX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "horiz-adv-x",
            param
          ]);
}

function horizOriginX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "horiz-origin-x",
            param
          ]);
}

function horizOriginY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "horiz-origin-y",
            param
          ]);
}

function id(param) {
  return /* Attribute */Block.__(1, [
            "",
            "id",
            param
          ]);
}

function ideographic(param) {
  return /* Attribute */Block.__(1, [
            "",
            "ideographic",
            param
          ]);
}

function in$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "in",
            param
          ]);
}

function in2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "in2",
            param
          ]);
}

function intercept(param) {
  return /* Attribute */Block.__(1, [
            "",
            "intercept",
            param
          ]);
}

function k(param) {
  return /* Attribute */Block.__(1, [
            "",
            "k",
            param
          ]);
}

function k1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "k1",
            param
          ]);
}

function k2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "k2",
            param
          ]);
}

function k3(param) {
  return /* Attribute */Block.__(1, [
            "",
            "k3",
            param
          ]);
}

function k4(param) {
  return /* Attribute */Block.__(1, [
            "",
            "k4",
            param
          ]);
}

function kernelMatrix(param) {
  return /* Attribute */Block.__(1, [
            "",
            "kernelMatrix",
            param
          ]);
}

function kernelUnitLength(param) {
  return /* Attribute */Block.__(1, [
            "",
            "kernelUnitLength",
            param
          ]);
}

function keyPoints(param) {
  return /* Attribute */Block.__(1, [
            "",
            "keyPoints",
            param
          ]);
}

function keySplines(param) {
  return /* Attribute */Block.__(1, [
            "",
            "keySplines",
            param
          ]);
}

function keyTimes(param) {
  return /* Attribute */Block.__(1, [
            "",
            "keyTimes",
            param
          ]);
}

function lang(param) {
  return /* Attribute */Block.__(1, [
            "",
            "lang",
            param
          ]);
}

function lengthAdjust(param) {
  return /* Attribute */Block.__(1, [
            "",
            "lengthAdjust",
            param
          ]);
}

function limitingConeAngle(param) {
  return /* Attribute */Block.__(1, [
            "",
            "limitingConeAngle",
            param
          ]);
}

function local(param) {
  return /* Attribute */Block.__(1, [
            "",
            "local",
            param
          ]);
}

function markerHeight(param) {
  return /* Attribute */Block.__(1, [
            "",
            "markerHeight",
            param
          ]);
}

function markerUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "markerUnits",
            param
          ]);
}

function markerWidth(param) {
  return /* Attribute */Block.__(1, [
            "",
            "markerWidth",
            param
          ]);
}

function maskContentUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "maskContentUnits",
            param
          ]);
}

function maskUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "maskUnits",
            param
          ]);
}

function mathematical(param) {
  return /* Attribute */Block.__(1, [
            "",
            "mathematical",
            param
          ]);
}

function max(param) {
  return /* Attribute */Block.__(1, [
            "",
            "max",
            param
          ]);
}

function media(param) {
  return /* Attribute */Block.__(1, [
            "",
            "media",
            param
          ]);
}

function method$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "method",
            param
          ]);
}

function min(param) {
  return /* Attribute */Block.__(1, [
            "",
            "min",
            param
          ]);
}

function mode(param) {
  return /* Attribute */Block.__(1, [
            "",
            "mode",
            param
          ]);
}

function name(param) {
  return /* Attribute */Block.__(1, [
            "",
            "name",
            param
          ]);
}

function numOctaves(param) {
  return /* Attribute */Block.__(1, [
            "",
            "numOctaves",
            param
          ]);
}

function offset(param) {
  return /* Attribute */Block.__(1, [
            "",
            "offset",
            param
          ]);
}

function operator(param) {
  return /* Attribute */Block.__(1, [
            "",
            "operator",
            param
          ]);
}

function order(param) {
  return /* Attribute */Block.__(1, [
            "",
            "order",
            param
          ]);
}

function orient(param) {
  return /* Attribute */Block.__(1, [
            "",
            "orient",
            param
          ]);
}

function orientation(param) {
  return /* Attribute */Block.__(1, [
            "",
            "orientation",
            param
          ]);
}

function origin(param) {
  return /* Attribute */Block.__(1, [
            "",
            "origin",
            param
          ]);
}

function overlinePosition(param) {
  return /* Attribute */Block.__(1, [
            "",
            "overline-position",
            param
          ]);
}

function overlineThickness(param) {
  return /* Attribute */Block.__(1, [
            "",
            "overline-thickness",
            param
          ]);
}

function panose1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "panose-1",
            param
          ]);
}

function path(param) {
  return /* Attribute */Block.__(1, [
            "",
            "path",
            param
          ]);
}

function pathLength(param) {
  return /* Attribute */Block.__(1, [
            "",
            "pathLength",
            param
          ]);
}

function patternContentUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "patternContentUnits",
            param
          ]);
}

function patternTransform(param) {
  return /* Attribute */Block.__(1, [
            "",
            "patternTransform",
            param
          ]);
}

function patternUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "patternUnits",
            param
          ]);
}

function pointOrder(param) {
  return /* Attribute */Block.__(1, [
            "",
            "point-order",
            param
          ]);
}

function points(param) {
  return /* Attribute */Block.__(1, [
            "",
            "points",
            param
          ]);
}

function pointsAtX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "pointsAtX",
            param
          ]);
}

function pointsAtY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "pointsAtY",
            param
          ]);
}

function pointsAtZ(param) {
  return /* Attribute */Block.__(1, [
            "",
            "pointsAtZ",
            param
          ]);
}

function preserveAlpha(param) {
  return /* Attribute */Block.__(1, [
            "",
            "preserveAlpha",
            param
          ]);
}

function preserveAspectRatio(param) {
  return /* Attribute */Block.__(1, [
            "",
            "preserveAspectRatio",
            param
          ]);
}

function primitiveUnits(param) {
  return /* Attribute */Block.__(1, [
            "",
            "primitiveUnits",
            param
          ]);
}

function r(param) {
  return /* Attribute */Block.__(1, [
            "",
            "r",
            param
          ]);
}

function radius(param) {
  return /* Attribute */Block.__(1, [
            "",
            "radius",
            param
          ]);
}

function refX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "refX",
            param
          ]);
}

function refY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "refY",
            param
          ]);
}

function renderingIntent(param) {
  return /* Attribute */Block.__(1, [
            "",
            "rendering-intent",
            param
          ]);
}

function repeatCount(param) {
  return /* Attribute */Block.__(1, [
            "",
            "repeatCount",
            param
          ]);
}

function repeatDur(param) {
  return /* Attribute */Block.__(1, [
            "",
            "repeatDur",
            param
          ]);
}

function requiredExtensions(param) {
  return /* Attribute */Block.__(1, [
            "",
            "requiredExtensions",
            param
          ]);
}

function requiredFeatures(param) {
  return /* Attribute */Block.__(1, [
            "",
            "requiredFeatures",
            param
          ]);
}

function restart(param) {
  return /* Attribute */Block.__(1, [
            "",
            "restart",
            param
          ]);
}

function result(param) {
  return /* Attribute */Block.__(1, [
            "",
            "result",
            param
          ]);
}

function rotate(param) {
  return /* Attribute */Block.__(1, [
            "",
            "rotate",
            param
          ]);
}

function rx(param) {
  return /* Attribute */Block.__(1, [
            "",
            "rx",
            param
          ]);
}

function ry(param) {
  return /* Attribute */Block.__(1, [
            "",
            "ry",
            param
          ]);
}

function scale(param) {
  return /* Attribute */Block.__(1, [
            "",
            "scale",
            param
          ]);
}

function seed(param) {
  return /* Attribute */Block.__(1, [
            "",
            "seed",
            param
          ]);
}

function slope(param) {
  return /* Attribute */Block.__(1, [
            "",
            "slope",
            param
          ]);
}

function spacing(param) {
  return /* Attribute */Block.__(1, [
            "",
            "spacing",
            param
          ]);
}

function specularConstant(param) {
  return /* Attribute */Block.__(1, [
            "",
            "specularConstant",
            param
          ]);
}

function specularExponent(param) {
  return /* Attribute */Block.__(1, [
            "",
            "specularExponent",
            param
          ]);
}

function speed(param) {
  return /* Attribute */Block.__(1, [
            "",
            "speed",
            param
          ]);
}

function spreadMethod(param) {
  return /* Attribute */Block.__(1, [
            "",
            "spreadMethod",
            param
          ]);
}

function startOffset(param) {
  return /* Attribute */Block.__(1, [
            "",
            "startOffset",
            param
          ]);
}

function stdDeviation(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stdDeviation",
            param
          ]);
}

function stemh(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stemh",
            param
          ]);
}

function stemv(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stemv",
            param
          ]);
}

function stitchTiles(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stitchTiles",
            param
          ]);
}

function strikethroughPosition(param) {
  return /* Attribute */Block.__(1, [
            "",
            "strikethrough-position",
            param
          ]);
}

function strikethroughThickness(param) {
  return /* Attribute */Block.__(1, [
            "",
            "strikethrough-thickness",
            param
          ]);
}

function string(param) {
  return /* Attribute */Block.__(1, [
            "",
            "string",
            param
          ]);
}

function style(param) {
  return /* Attribute */Block.__(1, [
            "",
            "style",
            param
          ]);
}

function surfaceScale(param) {
  return /* Attribute */Block.__(1, [
            "",
            "surfaceScale",
            param
          ]);
}

function systemLanguage(param) {
  return /* Attribute */Block.__(1, [
            "",
            "systemLanguage",
            param
          ]);
}

function tableValues(param) {
  return /* Attribute */Block.__(1, [
            "",
            "tableValues",
            param
          ]);
}

function target(param) {
  return /* Attribute */Block.__(1, [
            "",
            "target",
            param
          ]);
}

function targetX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "targetX",
            param
          ]);
}

function targetY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "targetY",
            param
          ]);
}

function textLength(param) {
  return /* Attribute */Block.__(1, [
            "",
            "textLength",
            param
          ]);
}

function title(param) {
  return /* Attribute */Block.__(1, [
            "",
            "title",
            param
          ]);
}

function to$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "to",
            param
          ]);
}

function transform(param) {
  return /* Attribute */Block.__(1, [
            "",
            "transform",
            param
          ]);
}

function type$prime(param) {
  return /* Attribute */Block.__(1, [
            "",
            "type",
            param
          ]);
}

function u1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "u1",
            param
          ]);
}

function u2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "u2",
            param
          ]);
}

function underlinePosition(param) {
  return /* Attribute */Block.__(1, [
            "",
            "underline-position",
            param
          ]);
}

function underlineThickness(param) {
  return /* Attribute */Block.__(1, [
            "",
            "underline-thickness",
            param
          ]);
}

function unicode(param) {
  return /* Attribute */Block.__(1, [
            "",
            "unicode",
            param
          ]);
}

function unicodeRange(param) {
  return /* Attribute */Block.__(1, [
            "",
            "unicode-range",
            param
          ]);
}

function unitsPerEm(param) {
  return /* Attribute */Block.__(1, [
            "",
            "units-per-em",
            param
          ]);
}

function vAlphabetic(param) {
  return /* Attribute */Block.__(1, [
            "",
            "v-alphabetic",
            param
          ]);
}

function vHanging(param) {
  return /* Attribute */Block.__(1, [
            "",
            "v-hanging",
            param
          ]);
}

function vIdeographic(param) {
  return /* Attribute */Block.__(1, [
            "",
            "v-ideographic",
            param
          ]);
}

function vMathematical(param) {
  return /* Attribute */Block.__(1, [
            "",
            "v-mathematical",
            param
          ]);
}

function values(param) {
  return /* Attribute */Block.__(1, [
            "",
            "values",
            param
          ]);
}

function version(param) {
  return /* Attribute */Block.__(1, [
            "",
            "version",
            param
          ]);
}

function vertAdvY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "vert-adv-y",
            param
          ]);
}

function vertOriginX(param) {
  return /* Attribute */Block.__(1, [
            "",
            "vert-origin-x",
            param
          ]);
}

function vertOriginY(param) {
  return /* Attribute */Block.__(1, [
            "",
            "vert-origin-y",
            param
          ]);
}

function viewBox(param) {
  return /* Attribute */Block.__(1, [
            "",
            "viewBox",
            param
          ]);
}

function viewTarget(param) {
  return /* Attribute */Block.__(1, [
            "",
            "viewTarget",
            param
          ]);
}

function width(param) {
  return /* Attribute */Block.__(1, [
            "",
            "width",
            param
          ]);
}

function widths(param) {
  return /* Attribute */Block.__(1, [
            "",
            "widths",
            param
          ]);
}

function x(param) {
  return /* Attribute */Block.__(1, [
            "",
            "x",
            param
          ]);
}

function xHeight(param) {
  return /* Attribute */Block.__(1, [
            "",
            "x-height",
            param
          ]);
}

function x1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "x1",
            param
          ]);
}

function x2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "x2",
            param
          ]);
}

function xChannelSelector(param) {
  return /* Attribute */Block.__(1, [
            "",
            "xChannelSelector",
            param
          ]);
}

function xlinkActuate(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:actuate",
            param
          ]);
}

function xlinkArcrole(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:arcrole",
            param
          ]);
}

function xlinkHref(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:href",
            param
          ]);
}

function xlinkRole(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:role",
            param
          ]);
}

function xlinkShow(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:show",
            param
          ]);
}

function xlinkTitle(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:title",
            param
          ]);
}

function xlinkType(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/1999/xlink",
            "xlink:type",
            param
          ]);
}

function xmlBase(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/XML/1998/namespace",
            "xml:base",
            param
          ]);
}

function xmlLang(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/XML/1998/namespace",
            "xml:lang",
            param
          ]);
}

function xmlSpace(param) {
  return /* Attribute */Block.__(1, [
            "http://www.w3.org/XML/1998/namespace",
            "xml:space",
            param
          ]);
}

function y(param) {
  return /* Attribute */Block.__(1, [
            "",
            "y",
            param
          ]);
}

function y1(param) {
  return /* Attribute */Block.__(1, [
            "",
            "y1",
            param
          ]);
}

function y2(param) {
  return /* Attribute */Block.__(1, [
            "",
            "y2",
            param
          ]);
}

function yChannelSelector(param) {
  return /* Attribute */Block.__(1, [
            "",
            "yChannelSelector",
            param
          ]);
}

function z(param) {
  return /* Attribute */Block.__(1, [
            "",
            "z",
            param
          ]);
}

function zoomAndPan(param) {
  return /* Attribute */Block.__(1, [
            "",
            "zoomAndPan",
            param
          ]);
}

function alignmentBaseline(param) {
  return /* Attribute */Block.__(1, [
            "",
            "alignment-baseline",
            param
          ]);
}

function baselineShift(param) {
  return /* Attribute */Block.__(1, [
            "",
            "baseline-shift",
            param
          ]);
}

function clipPath(param) {
  return /* Attribute */Block.__(1, [
            "",
            "clip-path",
            param
          ]);
}

function clipRule(param) {
  return /* Attribute */Block.__(1, [
            "",
            "clip-rule",
            param
          ]);
}

function clip(param) {
  return /* Attribute */Block.__(1, [
            "",
            "clip",
            param
          ]);
}

function colorInterpolationFilters(param) {
  return /* Attribute */Block.__(1, [
            "",
            "color-interpolation-filters",
            param
          ]);
}

function colorInterpolation(param) {
  return /* Attribute */Block.__(1, [
            "",
            "color-interpolation",
            param
          ]);
}

function colorProfile(param) {
  return /* Attribute */Block.__(1, [
            "",
            "color-profile",
            param
          ]);
}

function colorRendering(param) {
  return /* Attribute */Block.__(1, [
            "",
            "color-rendering",
            param
          ]);
}

function color(param) {
  return /* Attribute */Block.__(1, [
            "",
            "color",
            param
          ]);
}

function cursor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "cursor",
            param
          ]);
}

function direction(param) {
  return /* Attribute */Block.__(1, [
            "",
            "direction",
            param
          ]);
}

function display(param) {
  return /* Attribute */Block.__(1, [
            "",
            "display",
            param
          ]);
}

function dominantBaseline(param) {
  return /* Attribute */Block.__(1, [
            "",
            "dominant-baseline",
            param
          ]);
}

function enableBackground(param) {
  return /* Attribute */Block.__(1, [
            "",
            "enable-background",
            param
          ]);
}

function fillOpacity(param) {
  return /* Attribute */Block.__(1, [
            "",
            "fill-opacity",
            param
          ]);
}

function fillRule(param) {
  return /* Attribute */Block.__(1, [
            "",
            "fill-rule",
            param
          ]);
}

function fill(param) {
  return /* Attribute */Block.__(1, [
            "",
            "fill",
            param
          ]);
}

function filter(param) {
  return /* Attribute */Block.__(1, [
            "",
            "filter",
            param
          ]);
}

function floodColor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "flood-color",
            param
          ]);
}

function floodOpacity(param) {
  return /* Attribute */Block.__(1, [
            "",
            "flood-opacity",
            param
          ]);
}

function fontFamily(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-family",
            param
          ]);
}

function fontSizeAdjust(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-size-adjust",
            param
          ]);
}

function fontSize(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-size",
            param
          ]);
}

function fontStretch(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-stretch",
            param
          ]);
}

function fontStyle(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-style",
            param
          ]);
}

function fontVariant(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-variant",
            param
          ]);
}

function fontWeight(param) {
  return /* Attribute */Block.__(1, [
            "",
            "font-weight",
            param
          ]);
}

function glyphOrientationHorizontal(param) {
  return /* Attribute */Block.__(1, [
            "",
            "glyph-orientation-horizontal",
            param
          ]);
}

function glyphOrientationVertical(param) {
  return /* Attribute */Block.__(1, [
            "",
            "glyph-orientation-vertical",
            param
          ]);
}

function imageRendering(param) {
  return /* Attribute */Block.__(1, [
            "",
            "image-rendering",
            param
          ]);
}

function kerning(param) {
  return /* Attribute */Block.__(1, [
            "",
            "kerning",
            param
          ]);
}

function letterSpacing(param) {
  return /* Attribute */Block.__(1, [
            "",
            "letter-spacing",
            param
          ]);
}

function lightingColor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "lighting-color",
            param
          ]);
}

function markerEnd(param) {
  return /* Attribute */Block.__(1, [
            "",
            "marker-end",
            param
          ]);
}

function markerMid(param) {
  return /* Attribute */Block.__(1, [
            "",
            "marker-mid",
            param
          ]);
}

function markerStart(param) {
  return /* Attribute */Block.__(1, [
            "",
            "marker-start",
            param
          ]);
}

function mask(param) {
  return /* Attribute */Block.__(1, [
            "",
            "mask",
            param
          ]);
}

function opacity(param) {
  return /* Attribute */Block.__(1, [
            "",
            "opacity",
            param
          ]);
}

function overflow(param) {
  return /* Attribute */Block.__(1, [
            "",
            "overflow",
            param
          ]);
}

function pointerEvents(param) {
  return /* Attribute */Block.__(1, [
            "",
            "pointer-events",
            param
          ]);
}

function shapeRendering(param) {
  return /* Attribute */Block.__(1, [
            "",
            "shape-rendering",
            param
          ]);
}

function stopColor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stop-color",
            param
          ]);
}

function stopOpacity(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stop-opacity",
            param
          ]);
}

function strokeDasharray(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-dasharray",
            param
          ]);
}

function strokeDashoffset(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-dashoffset",
            param
          ]);
}

function strokeLinecap(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-linecap",
            param
          ]);
}

function strokeLinejoin(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-linejoin",
            param
          ]);
}

function strokeMiterlimit(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-miterlimit",
            param
          ]);
}

function strokeOpacity(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-opacity",
            param
          ]);
}

function strokeWidth(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke-width",
            param
          ]);
}

function stroke(param) {
  return /* Attribute */Block.__(1, [
            "",
            "stroke",
            param
          ]);
}

function textAnchor(param) {
  return /* Attribute */Block.__(1, [
            "",
            "text-anchor",
            param
          ]);
}

function textDecoration(param) {
  return /* Attribute */Block.__(1, [
            "",
            "text-decoration",
            param
          ]);
}

function textRendering(param) {
  return /* Attribute */Block.__(1, [
            "",
            "text-rendering",
            param
          ]);
}

function unicodeBidi(param) {
  return /* Attribute */Block.__(1, [
            "",
            "unicode-bidi",
            param
          ]);
}

function visibility(param) {
  return /* Attribute */Block.__(1, [
            "",
            "visibility",
            param
          ]);
}

function wordSpacing(param) {
  return /* Attribute */Block.__(1, [
            "",
            "word-spacing",
            param
          ]);
}

function writingMode(param) {
  return /* Attribute */Block.__(1, [
            "",
            "writing-mode",
            param
          ]);
}

exports.accentHeight               = accentHeight;
exports.accelerate                 = accelerate;
exports.accumulate                 = accumulate;
exports.additive                   = additive;
exports.alphabetic                 = alphabetic;
exports.allowReorder               = allowReorder;
exports.amplitude                  = amplitude;
exports.arabicForm                 = arabicForm;
exports.ascent                     = ascent;
exports.attributeName              = attributeName;
exports.attributeType              = attributeType;
exports.autoReverse                = autoReverse;
exports.azimuth                    = azimuth;
exports.baseFrequency              = baseFrequency;
exports.baseProfile                = baseProfile;
exports.bbox                       = bbox;
exports.begin$prime                = begin$prime;
exports.bias                       = bias;
exports.by                         = by;
exports.calcMode                   = calcMode;
exports.capHeight                  = capHeight;
exports.class$prime                = class$prime;
exports.clipPathUnits              = clipPathUnits;
exports.contentScriptType          = contentScriptType;
exports.contentStyleType           = contentStyleType;
exports.cx                         = cx;
exports.cy                         = cy;
exports.d                          = d;
exports.decelerate                 = decelerate;
exports.descent                    = descent;
exports.diffuseConstant            = diffuseConstant;
exports.divisor                    = divisor;
exports.dur                        = dur;
exports.dx                         = dx;
exports.dy                         = dy;
exports.edgeMode                   = edgeMode;
exports.elevation                  = elevation;
exports.end$prime                  = end$prime;
exports.exponent                   = exponent;
exports.externalResourcesRequired  = externalResourcesRequired;
exports.filterRes                  = filterRes;
exports.filterUnits                = filterUnits;
exports.format                     = format;
exports.from                       = from;
exports.fx                         = fx;
exports.fy                         = fy;
exports.g1                         = g1;
exports.g2                         = g2;
exports.glyphName                  = glyphName;
exports.glyphRef                   = glyphRef;
exports.gradientTransform          = gradientTransform;
exports.gradientUnits              = gradientUnits;
exports.hanging                    = hanging;
exports.height                     = height;
exports.horizAdvX                  = horizAdvX;
exports.horizOriginX               = horizOriginX;
exports.horizOriginY               = horizOriginY;
exports.id                         = id;
exports.ideographic                = ideographic;
exports.in$prime                   = in$prime;
exports.in2                        = in2;
exports.intercept                  = intercept;
exports.k                          = k;
exports.k1                         = k1;
exports.k2                         = k2;
exports.k3                         = k3;
exports.k4                         = k4;
exports.kernelMatrix               = kernelMatrix;
exports.kernelUnitLength           = kernelUnitLength;
exports.keyPoints                  = keyPoints;
exports.keySplines                 = keySplines;
exports.keyTimes                   = keyTimes;
exports.lang                       = lang;
exports.lengthAdjust               = lengthAdjust;
exports.limitingConeAngle          = limitingConeAngle;
exports.local                      = local;
exports.markerHeight               = markerHeight;
exports.markerUnits                = markerUnits;
exports.markerWidth                = markerWidth;
exports.maskContentUnits           = maskContentUnits;
exports.maskUnits                  = maskUnits;
exports.mathematical               = mathematical;
exports.max                        = max;
exports.media                      = media;
exports.method$prime               = method$prime;
exports.min                        = min;
exports.mode                       = mode;
exports.name                       = name;
exports.numOctaves                 = numOctaves;
exports.offset                     = offset;
exports.operator                   = operator;
exports.order                      = order;
exports.orient                     = orient;
exports.orientation                = orientation;
exports.origin                     = origin;
exports.overlinePosition           = overlinePosition;
exports.overlineThickness          = overlineThickness;
exports.panose1                    = panose1;
exports.path                       = path;
exports.pathLength                 = pathLength;
exports.patternContentUnits        = patternContentUnits;
exports.patternTransform           = patternTransform;
exports.patternUnits               = patternUnits;
exports.pointOrder                 = pointOrder;
exports.points                     = points;
exports.pointsAtX                  = pointsAtX;
exports.pointsAtY                  = pointsAtY;
exports.pointsAtZ                  = pointsAtZ;
exports.preserveAlpha              = preserveAlpha;
exports.preserveAspectRatio        = preserveAspectRatio;
exports.primitiveUnits             = primitiveUnits;
exports.r                          = r;
exports.radius                     = radius;
exports.refX                       = refX;
exports.refY                       = refY;
exports.renderingIntent            = renderingIntent;
exports.repeatCount                = repeatCount;
exports.repeatDur                  = repeatDur;
exports.requiredExtensions         = requiredExtensions;
exports.requiredFeatures           = requiredFeatures;
exports.restart                    = restart;
exports.result                     = result;
exports.rotate                     = rotate;
exports.rx                         = rx;
exports.ry                         = ry;
exports.scale                      = scale;
exports.seed                       = seed;
exports.slope                      = slope;
exports.spacing                    = spacing;
exports.specularConstant           = specularConstant;
exports.specularExponent           = specularExponent;
exports.speed                      = speed;
exports.spreadMethod               = spreadMethod;
exports.startOffset                = startOffset;
exports.stdDeviation               = stdDeviation;
exports.stemh                      = stemh;
exports.stemv                      = stemv;
exports.stitchTiles                = stitchTiles;
exports.strikethroughPosition      = strikethroughPosition;
exports.strikethroughThickness     = strikethroughThickness;
exports.string                     = string;
exports.style                      = style;
exports.surfaceScale               = surfaceScale;
exports.systemLanguage             = systemLanguage;
exports.tableValues                = tableValues;
exports.target                     = target;
exports.targetX                    = targetX;
exports.targetY                    = targetY;
exports.textLength                 = textLength;
exports.title                      = title;
exports.to$prime                   = to$prime;
exports.transform                  = transform;
exports.type$prime                 = type$prime;
exports.u1                         = u1;
exports.u2                         = u2;
exports.underlinePosition          = underlinePosition;
exports.underlineThickness         = underlineThickness;
exports.unicode                    = unicode;
exports.unicodeRange               = unicodeRange;
exports.unitsPerEm                 = unitsPerEm;
exports.vAlphabetic                = vAlphabetic;
exports.vHanging                   = vHanging;
exports.vIdeographic               = vIdeographic;
exports.vMathematical              = vMathematical;
exports.values                     = values;
exports.version                    = version;
exports.vertAdvY                   = vertAdvY;
exports.vertOriginX                = vertOriginX;
exports.vertOriginY                = vertOriginY;
exports.viewBox                    = viewBox;
exports.viewTarget                 = viewTarget;
exports.width                      = width;
exports.widths                     = widths;
exports.x                          = x;
exports.xHeight                    = xHeight;
exports.x1                         = x1;
exports.x2                         = x2;
exports.xChannelSelector           = xChannelSelector;
exports.xlinkActuate               = xlinkActuate;
exports.xlinkArcrole               = xlinkArcrole;
exports.xlinkHref                  = xlinkHref;
exports.xlinkRole                  = xlinkRole;
exports.xlinkShow                  = xlinkShow;
exports.xlinkTitle                 = xlinkTitle;
exports.xlinkType                  = xlinkType;
exports.xmlBase                    = xmlBase;
exports.xmlLang                    = xmlLang;
exports.xmlSpace                   = xmlSpace;
exports.y                          = y;
exports.y1                         = y1;
exports.y2                         = y2;
exports.yChannelSelector           = yChannelSelector;
exports.z                          = z;
exports.zoomAndPan                 = zoomAndPan;
exports.alignmentBaseline          = alignmentBaseline;
exports.baselineShift              = baselineShift;
exports.clipPath                   = clipPath;
exports.clipRule                   = clipRule;
exports.clip                       = clip;
exports.colorInterpolationFilters  = colorInterpolationFilters;
exports.colorInterpolation         = colorInterpolation;
exports.colorProfile               = colorProfile;
exports.colorRendering             = colorRendering;
exports.color                      = color;
exports.cursor                     = cursor;
exports.direction                  = direction;
exports.display                    = display;
exports.dominantBaseline           = dominantBaseline;
exports.enableBackground           = enableBackground;
exports.fillOpacity                = fillOpacity;
exports.fillRule                   = fillRule;
exports.fill                       = fill;
exports.filter                     = filter;
exports.floodColor                 = floodColor;
exports.floodOpacity               = floodOpacity;
exports.fontFamily                 = fontFamily;
exports.fontSizeAdjust             = fontSizeAdjust;
exports.fontSize                   = fontSize;
exports.fontStretch                = fontStretch;
exports.fontStyle                  = fontStyle;
exports.fontVariant                = fontVariant;
exports.fontWeight                 = fontWeight;
exports.glyphOrientationHorizontal = glyphOrientationHorizontal;
exports.glyphOrientationVertical   = glyphOrientationVertical;
exports.imageRendering             = imageRendering;
exports.kerning                    = kerning;
exports.letterSpacing              = letterSpacing;
exports.lightingColor              = lightingColor;
exports.markerEnd                  = markerEnd;
exports.markerMid                  = markerMid;
exports.markerStart                = markerStart;
exports.mask                       = mask;
exports.opacity                    = opacity;
exports.overflow                   = overflow;
exports.pointerEvents              = pointerEvents;
exports.shapeRendering             = shapeRendering;
exports.stopColor                  = stopColor;
exports.stopOpacity                = stopOpacity;
exports.strokeDasharray            = strokeDasharray;
exports.strokeDashoffset           = strokeDashoffset;
exports.strokeLinecap              = strokeLinecap;
exports.strokeLinejoin             = strokeLinejoin;
exports.strokeMiterlimit           = strokeMiterlimit;
exports.strokeOpacity              = strokeOpacity;
exports.strokeWidth                = strokeWidth;
exports.stroke                     = stroke;
exports.textAnchor                 = textAnchor;
exports.textDecoration             = textDecoration;
exports.textRendering              = textRendering;
exports.unicodeBidi                = unicodeBidi;
exports.visibility                 = visibility;
exports.wordSpacing                = wordSpacing;
exports.writingMode                = writingMode;
/* No side effect */

});

;require.register("src/tea_svg_events.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';



/* No side effect */

});

;require.register("src/tea_task.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");

function succeed(value) {
  return /* Succeed */Block.__(0, [value]);
}

function fail(value) {
  return /* Fail */Block.__(1, [value]);
}

function andThen(_, task) {
  var handler = function () {
    return /* () */0;
  };
  return /* AndThen */Block.__(2, [
            task,
            handler
          ]);
}

function onError(fn, task) {
  return /* OnError */Block.__(3, [
            task,
            fn
          ]);
}

exports.succeed = succeed;
exports.fail    = fail;
exports.andThen = andThen;
exports.onError = onError;
/* No side effect */

});

;require.register("src/tea_time.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block      = require("bs-platform/lib/js/block");
var Curry      = require("bs-platform/lib/js/curry");
var Tea_sub    = require("./tea_sub");
var Web_window = require("./web_window");

function every(interval, tagger) {
  var key = "" + interval;
  var enableCall = function (callbacks) {
    var id = Web_window.setInterval(function () {
          return Curry._1(callbacks[/* enqueue */0], Curry._1(tagger, Date.now()));
        }, interval);
    return function () {
      return window.clearTimeout(id);
    };
  };
  return Tea_sub.registration(key, enableCall);
}

function delay(msTime, msg) {
  return /* EnqueueCall */Block.__(2, [function (enqueue) {
              Web_window.setTimeout(function () {
                    return Curry._1(enqueue, msg);
                  }, msTime);
              return /* () */0;
            }]);
}

var second = 1000.0 * 1.0;

var minute = 60.0 * second;

var hour = 60.0 * minute;

function inMilliseconds(t) {
  return t;
}

function inSeconds(t) {
  return t / second;
}

function inMinutes(t) {
  return t / minute;
}

function inHours(t) {
  return t / hour;
}

var millisecond = 1.0;

exports.every          = every;
exports.delay          = delay;
exports.millisecond    = millisecond;
exports.second         = second;
exports.minute         = minute;
exports.hour           = hour;
exports.inMilliseconds = inMilliseconds;
exports.inSeconds      = inSeconds;
exports.inMinutes      = inMinutes;
exports.inHours        = inHours;
/* No side effect */

});

;require.register("src/vdom.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Web_document            = require("./web_document");
var Block                   = require("bs-platform/lib/js/block");
var Curry                   = require("bs-platform/lib/js/curry");
var Web_node                = require("./web_node");
var $$String                = require("bs-platform/lib/js/string");
var List                    = require("bs-platform/lib/js/list");

function text(s) {
  return /* Text */Block.__(0, [s]);
}

function fullnode(namespace, tagName, key, unique, props, vdoms) {
  return /* Node */Block.__(1, [
            namespace,
            tagName,
            key,
            unique,
            props,
            vdoms
          ]);
}

function node($staropt$star, tagName, $staropt$star$1, $staropt$star$2, props, vdoms) {
  var namespace = $staropt$star ? $staropt$star[0] : "";
  var key = $staropt$star$1 ? $staropt$star$1[0] : "";
  var unique = $staropt$star$2 ? $staropt$star$2[0] : "";
  return fullnode(namespace, tagName, key, unique, props, vdoms);
}

function lazyGen(key, fn) {
  return /* LazyGen */Block.__(2, [
            key,
            fn,
            [/* NoVNode */0]
          ]);
}

function prop(key, value) {
  return /* RawProp */Block.__(0, [
            key,
            value
          ]);
}

function on(name, key, cb) {
  return /* Event */Block.__(3, [
            name,
            key,
            cb
          ]);
}

function attribute(namespace, key, value) {
  return /* Attribute */Block.__(1, [
            namespace,
            key,
            value
          ]);
}

function data(key, value) {
  return /* Data */Block.__(2, [
            key,
            value
          ]);
}

function style(key, value) {
  return /* Style */Block.__(4, [/* :: */[
              /* tuple */[
                key,
                value
              ],
              /* [] */0
            ]]);
}

function styles(s) {
  return /* Style */Block.__(4, [s]);
}

function renderToHtmlString(_param) {
  while(true) {
    var param = _param;
    if (typeof param === "number") {
      return "";
    }
    else {
      switch (param.tag | 0) {
        case 0 : 
            return param[0];
        case 1 : 
            var tagName = param[1];
            return $$String.concat("", /* :: */[
                        "<",
                        /* :: */[
                          tagName,
                          /* :: */[
                            $$String.concat("", List.map(function (p) {
                                      var param = p;
                                      if (typeof param === "number") {
                                        return "";
                                      }
                                      else {
                                        switch (param.tag | 0) {
                                          case 0 : 
                                              return $$String.concat("", /* :: */[
                                                          " ",
                                                          /* :: */[
                                                            param[0],
                                                            /* :: */[
                                                              '="',
                                                              /* :: */[
                                                                param[1],
                                                                /* :: */[
                                                                  '"',
                                                                  /* [] */0
                                                                ]
                                                              ]
                                                            ]
                                                          ]
                                                        ]);
                                          case 1 : 
                                              return $$String.concat("", /* :: */[
                                                          " ",
                                                          /* :: */[
                                                            param[1],
                                                            /* :: */[
                                                              '="',
                                                              /* :: */[
                                                                param[2],
                                                                /* :: */[
                                                                  '"',
                                                                  /* [] */0
                                                                ]
                                                              ]
                                                            ]
                                                          ]
                                                        ]);
                                          case 2 : 
                                              return $$String.concat("", /* :: */[
                                                          " data-",
                                                          /* :: */[
                                                            param[0],
                                                            /* :: */[
                                                              '="',
                                                              /* :: */[
                                                                param[1],
                                                                /* :: */[
                                                                  '"',
                                                                  /* [] */0
                                                                ]
                                                              ]
                                                            ]
                                                          ]
                                                        ]);
                                          case 3 : 
                                              return $$String.concat("", /* :: */[
                                                          " ",
                                                          /* :: */[
                                                            param[0],
                                                            /* :: */[
                                                              '="js:',
                                                              /* :: */[
                                                                typeof param[2],
                                                                /* :: */[
                                                                  '"',
                                                                  /* [] */0
                                                                ]
                                                              ]
                                                            ]
                                                          ]
                                                        ]);
                                          case 4 : 
                                              return $$String.concat("", /* :: */[
                                                          ' style="',
                                                          /* :: */[
                                                            $$String.concat(";", List.map(function (param) {
                                                                      return $$String.concat("", /* :: */[
                                                                                  param[0],
                                                                                  /* :: */[
                                                                                    ":",
                                                                                    /* :: */[
                                                                                      param[1],
                                                                                      /* :: */[
                                                                                        ";",
                                                                                        /* [] */0
                                                                                      ]
                                                                                    ]
                                                                                  ]
                                                                                ]);
                                                                    }, param[0])),
                                                            /* :: */[
                                                              '"',
                                                              /* [] */0
                                                            ]
                                                          ]
                                                        ]);
                                          
                                        }
                                      }
                                    }, param[4])),
                            /* :: */[
                              ">",
                              /* :: */[
                                $$String.concat("", List.map(renderToHtmlString, param[5])),
                                /* :: */[
                                  "</",
                                  /* :: */[
                                    tagName,
                                    /* :: */[
                                      ">",
                                      /* [] */0
                                    ]
                                  ]
                                ]
                              ]
                            ]
                          ]
                        ]
                      ]);
        case 2 : 
            _param = Curry._1(param[1], /* () */0);
            continue ;
            case 3 : 
            _param = param[1];
            continue ;
            
      }
    }
  };
}

function _handlerName(idx, typ) {
  return "_handler_" + (idx + typ);
}

function _usercb(callbacks, f, ev) {
  var match = Curry._1(f, ev);
  if (match) {
    return Curry._1(callbacks[0][/* enqueue */0], match[0]);
  }
  else {
    return /* () */0;
  }
}

function patchVNodesOnElems_PropertiesApply_Add(callbacks, elem, idx, param) {
  if (typeof param === "number") {
    return /* () */0;
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return elem[param[0]] = param[1];
      case 1 : 
          return Web_node.setAttributeNsOptional(elem, param[0], param[1], param[2]);
      case 2 : 
          console.log(/* tuple */[
                "TODO:  Add Data Unhandled",
                param[0],
                param[1]
              ]);
          throw [
                Caml_builtin_exceptions.failure,
                "TODO:  Add Data Unhandled"
              ];
      case 3 : 
          var f = param[2];
          var cb = function (param) {
            return _usercb(callbacks, f, param);
          };
          var handler = function (ev) {
            var match = ev.target;
            if (match !== undefined) {
              var userCB = elem[_handlerName(idx, "cb")];
              return userCB(ev);
            }
            else {
              throw [
                    Caml_builtin_exceptions.failure,
                    "Element Event called without being attached to an element?!  Report this with minimal test case!"
                  ];
            }
          };
          elem[_handlerName(idx, "cb")] = cb;
          elem[_handlerName(idx, "")] = handler;
          return Web_node.addEventListener(elem, param[0], handler, /* false */0);
      case 4 : 
          return List.fold_left(function (_, param) {
                      return Web_node.setStyle(elem, param[0], param[1]);
                    }, /* () */0, param[0]);
      
    }
  }
}

function patchVNodesOnElems_PropertiesApply_Remove(_, elem, idx, param) {
  if (typeof param === "number") {
    return /* () */0;
  }
  else {
    switch (param.tag | 0) {
      case 0 : 
          return elem[param[0]] = undefined;
      case 1 : 
          return Web_node.removeAttributeNsOptional(elem, param[0], param[1]);
      case 2 : 
          console.log(/* tuple */[
                "TODO:  Remove Data Unhandled",
                param[0],
                param[1]
              ]);
          throw [
                Caml_builtin_exceptions.failure,
                "TODO:  Remove Data Unhandled"
              ];
      case 3 : 
          var match = elem[function (param) {
                return _handlerName(idx, param);
              }];
          if (match !== undefined) {
            Web_node.removeEventListener(elem, param[0], match, /* false */0);
          }
          else {
            throw [
                  Caml_builtin_exceptions.failure,
                  "Something else has messed with the DOM, inconsistent state!"
                ];
          }
          elem[_handlerName(idx, "cb")] = undefined;
          elem[_handlerName(idx, "")] = undefined;
          return /* () */0;
      case 4 : 
          return List.fold_left(function (_, param) {
                      return Web_node.setStyle(elem, param[0], null);
                    }, /* () */0, param[0]);
      
    }
  }
}

function patchVNodesOnElems_PropertiesApply_RemoveAdd(callbacks, elem, idx, oldProp, newProp) {
  patchVNodesOnElems_PropertiesApply_Remove(callbacks, elem, idx, oldProp);
  patchVNodesOnElems_PropertiesApply_Add(callbacks, elem, idx, newProp);
  return /* () */0;
}

function patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, _newProp) {
  if (typeof _newProp === "number") {
    throw [
          Caml_builtin_exceptions.failure,
          "This should never be called as all entries through NoProp are gated."
        ];
  }
  else {
    switch (_newProp.tag | 0) {
      case 0 : 
          return elem[_newProp[0]] = _newProp[1];
      case 1 : 
          return Web_node.setAttributeNsOptional(elem, _newProp[0], _newProp[1], _newProp[2]);
      case 2 : 
          console.log(/* tuple */[
                "TODO:  Mutate Data Unhandled",
                _newProp[0],
                _newProp[1]
              ]);
          return /* () */0;
      case 3 : 
          var f = _newProp[2];
          var oldT;
          if (typeof oldProp === "number") {
            throw [
                  Caml_builtin_exceptions.failure,
                  "This should never be called as all entries to mutate are gated to the same types"
                ];
          }
          else if (oldProp.tag === 3) {
            oldT = oldProp[0];
          }
          else {
            throw [
                  Caml_builtin_exceptions.failure,
                  "This should never be called as all entries to mutate are gated to the same types"
                ];
          }
          if (oldT === _newProp[0]) {
            var cb = function (param) {
              return _usercb(callbacks, f, param);
            };
            elem[_handlerName(idx, "cb")] = cb;
            return /* () */0;
          }
          else {
            return patchVNodesOnElems_PropertiesApply_RemoveAdd(callbacks, elem, idx, oldProp, _newProp);
          }
          break;
      case 4 : 
          if (typeof oldProp === "number") {
            throw [
                  Caml_builtin_exceptions.failure,
                  "Passed a non-Style to a new Style as a Mutations while the old Style is not actually a style!"
                ];
          }
          else if (oldProp.tag === 4) {
            return List.fold_left2(function (_, param, param$1) {
                        var nv = param$1[1];
                        var nk = param$1[0];
                        var ok = param[0];
                        if (ok === nk) {
                          if (param[1] === nv) {
                            return /* () */0;
                          }
                          else {
                            return Web_node.setStyle(elem, nk, nv);
                          }
                        }
                        else {
                          Web_node.setStyle(elem, ok, null);
                          return Web_node.setStyle(elem, nk, nv);
                        }
                      }, /* () */0, oldProp[0], _newProp[0]);
          }
          else {
            throw [
                  Caml_builtin_exceptions.failure,
                  "Passed a non-Style to a new Style as a Mutations while the old Style is not actually a style!"
                ];
          }
          break;
      
    }
  }
}

function patchVNodesOnElems_PropertiesApply(callbacks, elem, _idx, _oldProperties, _newProperties) {
  while(true) {
    var newProperties = _newProperties;
    var oldProperties = _oldProperties;
    var idx = _idx;
    if (oldProperties) {
      var oldProp = oldProperties[0];
      var exit = 0;
      if (newProperties) {
        if (typeof oldProp === "number") {
          if (typeof newProperties[0] === "number") {
            _newProperties = newProperties[1];
            _oldProperties = oldProperties[1];
            _idx = idx + 1 | 0;
            continue ;
            
          }
          else {
            exit = 1;
          }
        }
        else {
          switch (oldProp.tag | 0) {
            case 0 : 
                var newProp = newProperties[0];
                if (typeof newProp === "number") {
                  exit = 1;
                }
                else if (newProp.tag) {
                  exit = 1;
                }
                else {
                  if (!(oldProp[0] === newProp[0] && oldProp[1] === newProp[1])) {
                    patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, newProp);
                  }
                  _newProperties = newProperties[1];
                  _oldProperties = oldProperties[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
                break;
            case 1 : 
                var newProp$1 = newProperties[0];
                if (typeof newProp$1 === "number") {
                  exit = 1;
                }
                else if (newProp$1.tag === 1) {
                  if (!(oldProp[0] === newProp$1[0] && oldProp[1] === newProp$1[1] && oldProp[2] === newProp$1[2])) {
                    patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, newProp$1);
                  }
                  _newProperties = newProperties[1];
                  _oldProperties = oldProperties[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
                else {
                  exit = 1;
                }
                break;
            case 2 : 
                var newProp$2 = newProperties[0];
                if (typeof newProp$2 === "number") {
                  exit = 1;
                }
                else if (newProp$2.tag === 2) {
                  if (!(oldProp[0] === newProp$2[0] && oldProp[1] === newProp$2[1])) {
                    patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, newProp$2);
                  }
                  _newProperties = newProperties[1];
                  _oldProperties = oldProperties[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
                else {
                  exit = 1;
                }
                break;
            case 3 : 
                var newProp$3 = newProperties[0];
                if (typeof newProp$3 === "number") {
                  exit = 1;
                }
                else if (newProp$3.tag === 3) {
                  if (!(oldProp[0] === newProp$3[0] && oldProp[1] === newProp$3[1])) {
                    patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, newProp$3);
                  }
                  _newProperties = newProperties[1];
                  _oldProperties = oldProperties[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
                else {
                  exit = 1;
                }
                break;
            case 4 : 
                var newProp$4 = newProperties[0];
                if (typeof newProp$4 === "number") {
                  exit = 1;
                }
                else if (newProp$4.tag === 4) {
                  if (!Caml_obj.caml_equal(oldProp[0], newProp$4[0])) {
                    patchVNodesOnElems_PropertiesApply_Mutate(callbacks, elem, idx, oldProp, newProp$4);
                  }
                  _newProperties = newProperties[1];
                  _oldProperties = oldProperties[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
                else {
                  exit = 1;
                }
                break;
            
          }
        }
      }
      else {
        patchVNodesOnElems_PropertiesApply_Remove(callbacks, elem, idx, oldProp);
        _newProperties = oldProperties[1];
        _oldProperties = /* [] */0;
        _idx = idx + 1 | 0;
        continue ;
        
      }
      if (exit === 1) {
        patchVNodesOnElems_PropertiesApply_RemoveAdd(callbacks, elem, idx, oldProp, newProperties[0]);
        _newProperties = newProperties[1];
        _oldProperties = oldProperties[1];
        _idx = idx + 1 | 0;
        continue ;
        
      }
      
    }
    else if (newProperties) {
      patchVNodesOnElems_PropertiesApply_Add(callbacks, elem, idx, newProperties[0]);
      _newProperties = newProperties[1];
      _oldProperties = /* [] */0;
      _idx = idx + 1 | 0;
      continue ;
      
    }
    else {
      return /* () */0;
    }
  };
}

function patchVNodesOnElems_Properties(callbacks, elem, oldProperties, newProperties) {
  return patchVNodesOnElems_PropertiesApply(callbacks, elem, 0, oldProperties, newProperties);
}

function patchVNodesOnElems_ReplaceNode(callbacks, elem, elems, idx, param) {
  if (typeof param === "number") {
    throw [
          Caml_builtin_exceptions.failure,
          "Node replacement should never be passed anything but a node itself"
        ];
  }
  else if (param.tag === 1) {
    var oldChild = elems[idx];
    var newChild = Web_document.createElementNsOptional(param[0], param[1]);
    patchVNodesOnElems_Properties(callbacks, newChild, /* [] */0, param[4]);
    var childChildren = newChild.childNodes;
    patchVNodesOnElems(callbacks, newChild, childChildren, 0, /* [] */0, param[5]);
    Web_node.insertBefore(elem, newChild, oldChild);
    elem.removeChild(oldChild);
    return /* () */0;
  }
  else {
    throw [
          Caml_builtin_exceptions.failure,
          "Node replacement should never be passed anything but a node itself"
        ];
  }
}

function patchVNodesOnElems_CreateElement(_callbacks, _param) {
  while(true) {
    var param = _param;
    var callbacks = _callbacks;
    if (typeof param === "number") {
      return document.createComment("");
    }
    else {
      switch (param.tag | 0) {
        case 0 : 
            var text = param[0];
            return document.createTextNode(text);
        case 1 : 
            var newChild = Web_document.createElementNsOptional(param[0], param[1]);
            patchVNodesOnElems_Properties(callbacks, newChild, /* [] */0, param[4]);
            var childChildren = newChild.childNodes;
            patchVNodesOnElems(callbacks, newChild, childChildren, 0, /* [] */0, param[5]);
            return newChild;
        case 2 : 
            var vdom = Curry._1(param[1], /* () */0);
            param[2][0] = vdom;
            _param = vdom;
            continue ;
            case 3 : 
            _param = param[1];
            _callbacks = Curry._1(param[0], callbacks);
            continue ;
            
      }
    }
  };
}

function patchVNodesOnElems(callbacks, elem, elems, _idx, _oldVNodes, _newVNodes) {
  while(true) {
    var newVNodes = _newVNodes;
    var oldVNodes = _oldVNodes;
    var idx = _idx;
    if (oldVNodes) {
      var oldNode = oldVNodes[0];
      var exit = 0;
      if (typeof oldNode === "number") {
        if (newVNodes) {
          if (typeof newVNodes[0] === "number") {
            _newVNodes = newVNodes[1];
            _oldVNodes = oldVNodes[1];
            _idx = idx + 1 | 0;
            continue ;
            
          }
          else {
            exit = 1;
          }
        }
        else {
          exit = 1;
        }
      }
      else {
        switch (oldNode.tag | 0) {
          case 0 : 
              if (newVNodes) {
                var match = newVNodes[0];
                if (typeof match === "number") {
                  exit = 1;
                }
                else if (match.tag) {
                  exit = 1;
                }
                else {
                  var newText = match[0];
                  if (oldNode[0] !== newText) {
                    var child = elems[idx];
                    child.nodeValue = newText;
                  }
                  _newVNodes = newVNodes[1];
                  _oldVNodes = oldVNodes[1];
                  _idx = idx + 1 | 0;
                  continue ;
                  
                }
              }
              else {
                exit = 1;
              }
              break;
          case 1 : 
              if (newVNodes) {
                var newNode = newVNodes[0];
                if (typeof newNode === "number") {
                  exit = 1;
                }
                else if (newNode.tag === 1) {
                  var newRest = newVNodes[1];
                  var newChildren = newNode[5];
                  var newProperties = newNode[4];
                  var newUnique = newNode[3];
                  var newKey = newNode[2];
                  var newTagName = newNode[1];
                  var newNamespace = newNode[0];
                  var oldRest = oldVNodes[1];
                  var oldChildren = oldNode[5];
                  var oldProperties = oldNode[4];
                  var oldUnique = oldNode[3];
                  var oldKey = oldNode[2];
                  var oldTagName = oldNode[1];
                  var oldNamespace = oldNode[0];
                  if (newKey === "" || oldKey === "") {
                    if (oldUnique === newUnique) {
                      var child$1 = elems[idx];
                      var childChildren = child$1.childNodes;
                      patchVNodesOnElems_Properties(callbacks, child$1, oldProperties, newProperties);
                      patchVNodesOnElems(callbacks, child$1, childChildren, 0, oldChildren, newChildren);
                      _newVNodes = newRest;
                      _oldVNodes = oldRest;
                      _idx = idx + 1 | 0;
                      continue ;
                      
                    }
                    else {
                      patchVNodesOnElems_ReplaceNode(callbacks, elem, elems, idx, newNode);
                      _newVNodes = newRest;
                      _oldVNodes = oldRest;
                      _idx = idx + 1 | 0;
                      continue ;
                      
                    }
                  }
                  else if (oldKey === newKey) {
                    _newVNodes = newRest;
                    _oldVNodes = oldRest;
                    _idx = idx + 1 | 0;
                    continue ;
                    
                  }
                  else {
                    var exit$1 = 0;
                    var exit$2 = 0;
                    if (oldRest) {
                      var match$1 = oldRest[0];
                      if (typeof match$1 === "number") {
                        exit$2 = 3;
                      }
                      else if (match$1.tag === 1) {
                        var olderRest = oldRest[1];
                        var olderKey = match$1[2];
                        var olderTagName = match$1[1];
                        var olderNamespace = match$1[0];
                        var exit$3 = 0;
                        if (newRest) {
                          var match$2 = newRest[0];
                          if (typeof match$2 === "number") {
                            exit$3 = 4;
                          }
                          else if (match$2.tag === 1) {
                            if (olderNamespace === newNamespace && olderTagName === newTagName && olderKey === newKey && oldNamespace === match$2[0] && oldTagName === match$2[1] && oldKey === match$2[2]) {
                              var firstChild = elems[idx];
                              var secondChild = elems[idx + 1 | 0];
                              elem.removeChild(secondChild);
                              Web_node.insertBefore(elem, secondChild, firstChild);
                              _newVNodes = newRest[1];
                              _oldVNodes = olderRest;
                              _idx = idx + 2 | 0;
                              continue ;
                              
                            }
                            else {
                              exit$3 = 4;
                            }
                          }
                          else {
                            exit$3 = 4;
                          }
                        }
                        else {
                          exit$3 = 4;
                        }
                        if (exit$3 === 4) {
                          if (olderNamespace === newNamespace && olderTagName === newTagName && olderKey === newKey) {
                            var oldChild = elems[idx];
                            elem.removeChild(oldChild);
                            _newVNodes = newRest;
                            _oldVNodes = olderRest;
                            _idx = idx + 1 | 0;
                            continue ;
                            
                          }
                          else {
                            exit$2 = 3;
                          }
                        }
                        
                      }
                      else {
                        exit$2 = 3;
                      }
                    }
                    else {
                      exit$2 = 3;
                    }
                    if (exit$2 === 3) {
                      if (newRest) {
                        var match$3 = newRest[0];
                        if (typeof match$3 === "number") {
                          exit$1 = 2;
                        }
                        else if (match$3.tag === 1) {
                          if (oldNamespace === match$3[0] && oldTagName === match$3[1] && oldKey === match$3[2]) {
                            var oldChild$1 = elems[idx];
                            var newChild = patchVNodesOnElems_CreateElement(callbacks, newNode);
                            Web_node.insertBefore(elem, newChild, oldChild$1);
                            _newVNodes = newRest;
                            _idx = idx + 1 | 0;
                            continue ;
                            
                          }
                          else {
                            exit$1 = 2;
                          }
                        }
                        else {
                          exit$1 = 2;
                        }
                      }
                      else {
                        exit$1 = 2;
                      }
                    }
                    if (exit$1 === 2) {
                      if (oldUnique === newUnique) {
                        var child$2 = elems[idx];
                        var childChildren$1 = child$2.childNodes;
                        patchVNodesOnElems_Properties(callbacks, child$2, oldProperties, newProperties);
                        patchVNodesOnElems(callbacks, child$2, childChildren$1, 0, oldChildren, newChildren);
                        _newVNodes = newRest;
                        _oldVNodes = oldRest;
                        _idx = idx + 1 | 0;
                        continue ;
                        
                      }
                      else {
                        patchVNodesOnElems_ReplaceNode(callbacks, elem, elems, idx, newNode);
                        _newVNodes = newRest;
                        _oldVNodes = oldRest;
                        _idx = idx + 1 | 0;
                        continue ;
                        
                      }
                    }
                    
                  }
                }
                else {
                  exit = 1;
                }
              }
              else {
                exit = 1;
              }
              break;
          case 2 : 
              if (newVNodes) {
                var match$4 = newVNodes[0];
                if (typeof match$4 === "number") {
                  exit = 1;
                }
                else if (match$4.tag === 2) {
                  var newRest$1 = newVNodes[1];
                  var newCache = match$4[2];
                  var newGen = match$4[1];
                  var newKey$1 = match$4[0];
                  var oldRest$1 = oldVNodes[1];
                  var oldCache = oldNode[2];
                  var oldKey$1 = oldNode[0];
                  if (oldKey$1 === newKey$1) {
                    newCache[0] = oldCache[0];
                    _newVNodes = newRest$1;
                    _oldVNodes = oldRest$1;
                    _idx = idx + 1 | 0;
                    continue ;
                    
                  }
                  else {
                    var exit$4 = 0;
                    var exit$5 = 0;
                    if (oldRest$1) {
                      var match$5 = oldRest$1[0];
                      if (typeof match$5 === "number") {
                        exit$5 = 3;
                      }
                      else if (match$5.tag === 2) {
                        var olderRest$1 = oldRest$1[1];
                        var olderKey$1 = match$5[0];
                        var exit$6 = 0;
                        if (newRest$1) {
                          var match$6 = newRest$1[0];
                          if (typeof match$6 === "number") {
                            exit$6 = 4;
                          }
                          else if (match$6.tag === 2) {
                            if (olderKey$1 === newKey$1 && oldKey$1 === match$6[0]) {
                              var firstChild$1 = elems[idx];
                              var secondChild$1 = elems[idx + 1 | 0];
                              elem.removeChild(secondChild$1);
                              Web_node.insertBefore(elem, secondChild$1, firstChild$1);
                              _newVNodes = newRest$1[1];
                              _oldVNodes = olderRest$1;
                              _idx = idx + 2 | 0;
                              continue ;
                              
                            }
                            else {
                              exit$6 = 4;
                            }
                          }
                          else {
                            exit$6 = 4;
                          }
                        }
                        else {
                          exit$6 = 4;
                        }
                        if (exit$6 === 4) {
                          if (olderKey$1 === newKey$1) {
                            var oldChild$2 = elems[idx];
                            elem.removeChild(oldChild$2);
                            var oldVdom = match$5[2][0];
                            newCache[0] = oldVdom;
                            _newVNodes = newRest$1;
                            _oldVNodes = olderRest$1;
                            _idx = idx + 1 | 0;
                            continue ;
                            
                          }
                          else {
                            exit$5 = 3;
                          }
                        }
                        
                      }
                      else {
                        exit$5 = 3;
                      }
                    }
                    else {
                      exit$5 = 3;
                    }
                    if (exit$5 === 3) {
                      if (newRest$1) {
                        var match$7 = newRest$1[0];
                        if (typeof match$7 === "number") {
                          exit$4 = 2;
                        }
                        else if (match$7.tag === 2) {
                          if (match$7[0] === oldKey$1) {
                            var oldChild$3 = elems[idx];
                            var newVdom = Curry._1(newGen, /* () */0);
                            newCache[0] = newVdom;
                            var newChild$1 = patchVNodesOnElems_CreateElement(callbacks, newVdom);
                            Web_node.insertBefore(elem, newChild$1, oldChild$3);
                            _newVNodes = newRest$1;
                            _idx = idx + 1 | 0;
                            continue ;
                            
                          }
                          else {
                            exit$4 = 2;
                          }
                        }
                        else {
                          exit$4 = 2;
                        }
                      }
                      else {
                        exit$4 = 2;
                      }
                    }
                    if (exit$4 === 2) {
                      var oldVdom$1 = oldCache[0];
                      var newVdom$1 = Curry._1(newGen, /* () */0);
                      newCache[0] = newVdom$1;
                      _newVNodes = /* :: */[
                        newVdom$1,
                        newRest$1
                      ];
                      _oldVNodes = /* :: */[
                        oldVdom$1,
                        oldRest$1
                      ];
                      continue ;
                      
                    }
                    
                  }
                }
                else {
                  exit = 1;
                }
              }
              else {
                exit = 1;
              }
              break;
          case 3 : 
              _oldVNodes = /* :: */[
                oldNode[1],
                oldVNodes[1]
              ];
              continue ;
              
        }
      }
      if (exit === 1) {
        var oldRest$2 = oldVNodes[1];
        if (newVNodes) {
          var newNode$1 = newVNodes[0];
          var exit$7 = 0;
          if (typeof newNode$1 === "number") {
            exit$7 = 2;
          }
          else if (newNode$1.tag === 3) {
            patchVNodesOnElems(Curry._1(newNode$1[0], callbacks), elem, elems, idx, /* :: */[
                  oldNode,
                  /* [] */0
                ], /* :: */[
                  newNode$1[1],
                  /* [] */0
                ]);
            _newVNodes = newVNodes[1];
            _oldVNodes = oldRest$2;
            _idx = idx + 1 | 0;
            continue ;
            
          }
          else {
            exit$7 = 2;
          }
          if (exit$7 === 2) {
            var oldChild$4 = elems[idx];
            var newChild$2 = patchVNodesOnElems_CreateElement(callbacks, newNode$1);
            Web_node.insertBefore(elem, newChild$2, oldChild$4);
            elem.removeChild(oldChild$4);
            _newVNodes = newVNodes[1];
            _oldVNodes = oldRest$2;
            _idx = idx + 1 | 0;
            continue ;
            
          }
          
        }
        else {
          var child$3 = elems[idx];
          elem.removeChild(child$3);
          _newVNodes = /* [] */0;
          _oldVNodes = oldRest$2;
          continue ;
          
        }
      }
      
    }
    else if (newVNodes) {
      var newChild$3 = patchVNodesOnElems_CreateElement(callbacks, newVNodes[0]);
      elem.appendChild(newChild$3);
      _newVNodes = newVNodes[1];
      _oldVNodes = /* [] */0;
      _idx = idx + 1 | 0;
      continue ;
      
    }
    else {
      return /* () */0;
    }
  };
}

function patchVNodesIntoElement(callbacks, elem, oldVNodes, newVNodes) {
  var elems = elem.childNodes;
  patchVNodesOnElems(callbacks, elem, elems, 0, oldVNodes, newVNodes);
  return newVNodes;
}

function patchVNodeIntoElement(callbacks, elem, oldVNode, newVNode) {
  return patchVNodesIntoElement(callbacks, elem, /* :: */[
              oldVNode,
              /* [] */0
            ], /* :: */[
              newVNode,
              /* [] */0
            ]);
}

function wrapCallbacks(func, callbacks) {
  return [/* record */[/* enqueue */function (msg) {
              return Curry._1(callbacks[0][/* enqueue */0], Curry._1(func, msg));
            }]];
}

function map(func, vdom) {
  var tagger = function (callbacks) {
    return [/* record */[/* enqueue */function (msg) {
                return Curry._1(callbacks[0][/* enqueue */0], Curry._1(func, msg));
              }]];
  };
  return /* Tagger */Block.__(3, [
            tagger,
            vdom
          ]);
}

var noNode = /* NoVNode */0;

var noProp = /* NoProp */0;

exports.noNode                                       = noNode;
exports.text                                         = text;
exports.fullnode                                     = fullnode;
exports.node                                         = node;
exports.lazyGen                                      = lazyGen;
exports.noProp                                       = noProp;
exports.prop                                         = prop;
exports.on                                           = on;
exports.attribute                                    = attribute;
exports.data                                         = data;
exports.style                                        = style;
exports.styles                                       = styles;
exports.renderToHtmlString                           = renderToHtmlString;
exports._handlerName                                 = _handlerName;
exports._usercb                                      = _usercb;
exports.patchVNodesOnElems_PropertiesApply_Add       = patchVNodesOnElems_PropertiesApply_Add;
exports.patchVNodesOnElems_PropertiesApply_Remove    = patchVNodesOnElems_PropertiesApply_Remove;
exports.patchVNodesOnElems_PropertiesApply_RemoveAdd = patchVNodesOnElems_PropertiesApply_RemoveAdd;
exports.patchVNodesOnElems_PropertiesApply_Mutate    = patchVNodesOnElems_PropertiesApply_Mutate;
exports.patchVNodesOnElems_PropertiesApply           = patchVNodesOnElems_PropertiesApply;
exports.patchVNodesOnElems_Properties                = patchVNodesOnElems_Properties;
exports.patchVNodesOnElems_ReplaceNode               = patchVNodesOnElems_ReplaceNode;
exports.patchVNodesOnElems_CreateElement             = patchVNodesOnElems_CreateElement;
exports.patchVNodesOnElems                           = patchVNodesOnElems;
exports.patchVNodesIntoElement                       = patchVNodesIntoElement;
exports.patchVNodeIntoElement                        = patchVNodeIntoElement;
exports.wrapCallbacks                                = wrapCallbacks;
exports.map                                          = map;
/* No side effect */

});

;require.register("src/web.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function polyfills() {
  ((
  // remove polyfill
  (function() {
    if (!('remove' in Element.prototype)) {
      Element.prototype.remove = function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    };
  }())
  ));
  ((
  // requestAnimationFrame polyfill
  (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
          window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
          window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                     || window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
          window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };

      if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
          };
  }())
  ));
  return /* () */0;
}

var Event = 0;

var Node = 0;

var Document = 0;

var $$Date = 0;

var Window = 0;

var Location = 0;

exports.Event     = Event;
exports.Node      = Node;
exports.Document  = Document;
exports.$$Date    = $$Date;
exports.Window    = Window;
exports.Location  = Location;
exports.polyfills = polyfills;
/* No side effect */

});

;require.register("src/web_date.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function now() {
  return Date.now();
}

exports.now = now;
/* No side effect */

});

;require.register("src/web_document.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function body() {
  return document.body;
}

function createElement(typ) {
  return document.createElement(typ);
}

function createElementNS(namespace, key) {
  return document.createElementNS(namespace, key);
}

function createComment(text) {
  return document.createComment(text);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function getElementById(id) {
  return document.getElementById(id);
}

function createElementNsOptional(namespace, tagName) {
  if (namespace === "") {
    return document.createElement(tagName);
  }
  else {
    return document.createElementNS(namespace, tagName);
  }
}

function $$location() {
  return document.location;
}

exports.body                    = body;
exports.createElement           = createElement;
exports.createElementNS         = createElementNS;
exports.createComment           = createComment;
exports.createTextNode          = createTextNode;
exports.getElementById          = getElementById;
exports.createElementNsOptional = createElementNsOptional;
exports.$$location              = $$location;
/* No side effect */

});

;require.register("src/web_event.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';



/* No side effect */

});

;require.register("src/web_location.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function getHref($$location) {
  return $$location.href;
}

function setHref($$location, value) {
  return $$location.href = value;
}

function getProtocol($$location) {
  return $$location.protocol;
}

function setProtocol($$location, value) {
  return $$location.protocol = value;
}

function getHost($$location) {
  return $$location.host;
}

function setHost($$location, value) {
  return $$location.host = value;
}

function getHostname($$location) {
  return $$location.hostname;
}

function setHostname($$location, value) {
  return $$location.hostname = value;
}

function getPort($$location) {
  return $$location.port;
}

function setPort($$location, value) {
  return $$location.port = value;
}

function getPathname($$location) {
  return $$location.pathname;
}

function setPathname($$location, value) {
  return $$location.pathname = value;
}

function getSearch($$location) {
  return $$location.search;
}

function setSearch($$location, value) {
  return $$location.search = value;
}

function getHash($$location) {
  return $$location.hash;
}

function setHash($$location, value) {
  return $$location.hash = value;
}

function getUsername($$location) {
  return $$location.username;
}

function setUsername($$location, value) {
  return $$location.username = value;
}

function getPassword($$location) {
  return $$location.password;
}

function setPassword($$location, value) {
  return $$location.password = value;
}

function getOrigin($$location) {
  return $$location.origin;
}

function asRecord($$location) {
  return /* record */[
          /* href */$$location.href,
          /* protocol */$$location.protocol,
          /* host */$$location.host,
          /* hostname */$$location.hostname,
          /* port */$$location.port,
          /* pathname */$$location.pathname,
          /* search */$$location.search,
          /* hash */$$location.hash,
          /* username */$$location.username,
          /* password */$$location.password,
          /* origin */$$location.origin
        ];
}

exports.getHref     = getHref;
exports.setHref     = setHref;
exports.getProtocol = getProtocol;
exports.setProtocol = setProtocol;
exports.getHost     = getHost;
exports.setHost     = setHost;
exports.getHostname = getHostname;
exports.setHostname = setHostname;
exports.getPort     = getPort;
exports.setPort     = setPort;
exports.getPathname = getPathname;
exports.setPathname = setPathname;
exports.getSearch   = getSearch;
exports.setSearch   = setSearch;
exports.getHash     = getHash;
exports.setHash     = setHash;
exports.getUsername = getUsername;
exports.setUsername = setUsername;
exports.getPassword = getPassword;
exports.setPassword = setPassword;
exports.getOrigin   = getOrigin;
exports.asRecord    = asRecord;
/* No side effect */

});

;require.register("src/web_node.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function style(n) {
  return n.style;
}

function getStyle(n, key) {
  return n.style[key];
}

function setStyle(n, key, value) {
  return n.style[key] = value;
}

function childNodes(n) {
  return n.childNodes;
}

function firstChild(n) {
  return n.firstChild;
}

function appendChild(n, child) {
  return n.appendChild(child);
}

function removeChild(n, child) {
  return n.removeChild(child);
}

function insertBefore(n, child, refNode) {
  return n.insertBefore(child, refNode);
}

function remove(n, child) {
  return n.remove(child);
}

function setAttributeNS(n, namespace, key, value) {
  return n.setAttributeNS(namespace, key, value);
}

function setAttribute(n, key, value) {
  return n.setAttribute(key, value);
}

function setAttributeNsOptional(n, namespace, key, value) {
  if (namespace === "") {
    return n.setAttribute(key, value);
  }
  else {
    return n.setAttributeNS(namespace, key, value);
  }
}

function removeAttributeNS(n, namespace, key) {
  return n.removeAttributeNS(namespace, key);
}

function removeAttribute(n, key) {
  return n.removeAttribute(key);
}

function removeAttributeNsOptional(n, namespace, key) {
  if (namespace === "") {
    return n.removeAttribute(key);
  }
  else {
    return n.removeAttributeNS(namespace, key);
  }
}

function addEventListener(n, typ, listener, options) {
  return n.addEventListener(typ, listener, options);
}

function removeEventListener(n, typ, listener, options) {
  return n.removeEventListener(typ, listener, options);
}

function focus(n) {
  return n.focus();
}

function set_nodeValue(n, text) {
  return n.nodeValue = text;
}

function get_nodeValue(n) {
  return n.nodeValue;
}

function remove_polyfill() {
  return (
  // remove polyfill
  (function() {
    if (!('remove' in Element.prototype)) {
      Element.prototype.remove = function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    };
  }())
  );
}

exports.style                     = style;
exports.getStyle                  = getStyle;
exports.setStyle                  = setStyle;
exports.childNodes                = childNodes;
exports.firstChild                = firstChild;
exports.appendChild               = appendChild;
exports.removeChild               = removeChild;
exports.insertBefore              = insertBefore;
exports.remove                    = remove;
exports.setAttributeNS            = setAttributeNS;
exports.setAttribute              = setAttribute;
exports.setAttributeNsOptional    = setAttributeNsOptional;
exports.removeAttributeNS         = removeAttributeNS;
exports.removeAttribute           = removeAttribute;
exports.removeAttributeNsOptional = removeAttributeNsOptional;
exports.addEventListener          = addEventListener;
exports.removeEventListener       = removeEventListener;
exports.focus                     = focus;
exports.set_nodeValue             = set_nodeValue;
exports.get_nodeValue             = get_nodeValue;
exports.remove_polyfill           = remove_polyfill;
/* No side effect */

});

;require.register("src/web_window.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function history() {
  return window.history;
}

function $$location() {
  return window.location;
}

function requestAnimationFrame(callback) {
  return window.requestAnimationFrame(callback);
}

function clearTimeout(id) {
  return window.clearTimeout(id);
}

function setInterval(cb, msTime) {
  return window.setInterval(cb, msTime);
}

function setTimeout(cb, msTime) {
  return window.setTimeout(cb, msTime);
}

function addEventListener(typ, listener, options) {
  return window.addEventListener(typ, listener, options);
}

function removeEventListener(typ, listener, options) {
  return window.removeEventListener(typ, listener, options);
}

function requestAnimationFrame_polyfill() {
  return (
  // requestAnimationFrame polyfill
  (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
          window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
          window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                     || window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
          window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };

      if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
          };
  }())
  );
}

var History = 0;

exports.History                        = History;
exports.history                        = history;
exports.$$location                     = $$location;
exports.requestAnimationFrame          = requestAnimationFrame;
exports.clearTimeout                   = clearTimeout;
exports.setInterval                    = setInterval;
exports.setTimeout                     = setTimeout;
exports.addEventListener               = addEventListener;
exports.removeEventListener            = removeEventListener;
exports.requestAnimationFrame_polyfill = requestAnimationFrame_polyfill;
/* No side effect */

});

;require.register("src/web_window_history.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function length($$window) {
  return $$window.history.length;
}

function back($$window) {
  return $$window.history.back;
}

function forward($$window) {
  return $$window.history.forward;
}

function go($$window, to$prime) {
  return $$window.history.go(to$prime);
}

function pushState($$window, state, title, url) {
  return $$window.history.pushState(state, title, url);
}

function replaceState($$window, state, title, url) {
  return $$window.history.replaceState(state, title, url);
}

function state($$window) {
  return $$window.history.state;
}

exports.length       = length;
exports.back         = back;
exports.forward      = forward;
exports.go           = go;
exports.pushState    = pushState;
exports.replaceState = replaceState;
exports.state        = state;
/* No side effect */

});

;require.alias("process/browser.js", "process");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('src/main_entry.ml');
//# sourceMappingURL=app.js.map