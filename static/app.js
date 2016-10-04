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
/* No side effect */

});

;require.register("src/counterParts.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Caml_builtin_exceptions = require("bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("bs-platform/lib/js/caml_obj");
var Tea_html                = require("./tea_html");
var Block                   = require("bs-platform/lib/js/block");
var Curry                   = require("bs-platform/lib/js/curry");
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
  return /* EnqueueCall */Block.__(1, [function (enqueue) {
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
/* No side effect */

});

;require.register("src/effect_time.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block      = require("bs-platform/lib/js/block");
var Curry      = require("bs-platform/lib/js/curry");
var Web_window = require("./web_window");

function every(interval, tagger) {
  return /* Every */[
          interval,
          tagger
        ];
}

function delay(msTime, msg) {
  return /* EnqueueCall */Block.__(1, [function (enqueue) {
              Web_window.setTimeout(function () {
                    return Curry._1(enqueue, msg);
                  }, msTime);
              return /* () */0;
            }]);
}

exports.every = every;
exports.delay = delay;
/* No side effect */

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
/* No side effect */

});

;require.register("src/main_counter.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
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
/* No side effect */

});

;require.register("src/main_embeddedCounters.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");
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
/* No side effect */

});

;require.register("src/main_embeddedCountersParts.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app      = require("./tea_app");
var Tea_html     = require("./tea_html");
var Block        = require("bs-platform/lib/js/block");
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
/* No side effect */

});

;require.register("src/main_entry.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Main_todo_optimized = require("./main_todo_optimized");

var load = Main_todo_optimized.main(document.getElementById("content"), /* () */0);

exports.load = load;
/* load Not a pure module */

});

;require.register("src/main_field.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Bytes       = require("bs-platform/lib/js/bytes");
var Tea_app     = require("./tea_app");
var Tea_html    = require("./tea_html");
var Block       = require("bs-platform/lib/js/block");
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
/* No side effect */

});

;require.register("src/main_form.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app  = require("./tea_app");
var Tea_html = require("./tea_html");
var Block    = require("bs-platform/lib/js/block");

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
/* No side effect */

});

;require.register("src/main_todo.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Tea_app       = require("./tea_app");
var Tea_html      = require("./tea_html");
var Pervasives    = require("bs-platform/lib/js/pervasives");
var Block         = require("bs-platform/lib/js/block");
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
/* No side effect */

});

;require.register("src/tea.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


var Cmd = 0;

var Sub = 0;

var App = 0;

var Html = 0;

var Program = 0;

var Time = 0;

exports.Cmd     = Cmd;
exports.Sub     = Sub;
exports.App     = App;
exports.Html    = Html;
exports.Program = Program;
exports.Time    = Time;
/* No side effect */

});

;require.register("src/tea_app.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Js_primitive = require("bs-platform/lib/js/js_primitive");
var Web          = require("./web");
var Curry        = require("bs-platform/lib/js/curry");
var Vdom         = require("./vdom");
var Tea_sub      = require("./tea_sub");
var Tea_cmd      = require("./tea_cmd");

function programStateWrapper(initModel, pump, shutdown) {
  var model = [initModel];
  var callbacks = [/* record */[/* enqueue */function () {
        console.log("INVALID enqueue CALL!");
        return /* () */0;
      }]];
  var pumperInterface = Curry._1(pump, callbacks);
  var handler = function (msg) {
    var newModel = Curry._2(pumperInterface[/* handleMsg */1], model[0], msg);
    model[0] = newModel;
    return /* () */0;
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
          Vdom.patchVNodesIntoElement(callbacks, parentNode, priorRenderedVdom[0], newVdom);
          priorRenderedVdom[0] = newVdom;
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
          var id = window.requestAnimationFrame(doRender);
          nextFrameID[0] = /* Some */[id];
          return /* () */0;
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
        Tea_cmd.run(callbacks, match[1]);
        latestModel[0] = newModel;
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

exports.programStateWrapper = programStateWrapper;
exports.programLoop         = programLoop;
exports.program             = program;
exports.standardProgram     = standardProgram;
exports.beginnerProgram     = beginnerProgram;
/* No side effect */

});

;require.register("src/tea_cmd.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block = require("bs-platform/lib/js/block");
var Curry = require("bs-platform/lib/js/curry");
var List  = require("bs-platform/lib/js/list");

function batch(cmds) {
  return /* Batch */Block.__(0, [cmds]);
}

function call(call$1) {
  return /* EnqueueCall */Block.__(1, [call$1]);
}

function fnMsg(fnMsg$1) {
  return /* EnqueueCall */Block.__(1, [function (enqueue) {
              return Curry._1(enqueue, Curry._1(fnMsg$1, /* () */0));
            }]);
}

function msg(msg$1) {
  return /* EnqueueCall */Block.__(1, [function (enqueue) {
              return Curry._1(enqueue, msg$1);
            }]);
}

function run(callbacks, param) {
  if (typeof param === "number") {
    return /* () */0;
  }
  else if (param.tag) {
    return Curry._1(param[0], callbacks[0][/* enqueue */0]);
  }
  else {
    return List.fold_left(function (_, cmd) {
                return run(callbacks, cmd);
              }, /* () */0, param[0]);
  }
}

var none = /* NoCmd */0;

exports.none  = none;
exports.batch = batch;
exports.call  = call;
exports.fnMsg = fnMsg;
exports.msg   = msg;
exports.run   = run;
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
  return /* EnqueueCall */Block.__(1, [function () {
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

function run(callbacks, oldSub, newSub) {
  var enable = function (param) {
    if (typeof param === "number") {
      return /* () */0;
    }
    else if (param.tag) {
      param[2][0] = /* Some */[Curry._1(param[1], callbacks)];
      return /* () */0;
    }
    else {
      var subs = param[0];
      if (subs) {
        return List.fold_left(function (_, sub) {
                    return enable(sub);
                  }, /* () */0, subs);
      }
      else {
        return /* () */0;
      }
    }
  };
  var disable = function (param) {
    if (typeof param === "number") {
      return /* () */0;
    }
    else if (param.tag) {
      var match = param[2][0];
      if (match) {
        return Curry._1(match[0], /* () */0);
      }
      else {
        return /* () */0;
      }
    }
    else {
      var subs = param[0];
      if (subs) {
        return List.fold_left(function (_, sub) {
                    return disable(sub);
                  }, /* () */0, subs);
      }
      else {
        return /* () */0;
      }
    }
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
  else if (oldSub.tag) {
    if (typeof newSub === "number") {
      exit = 1;
    }
    else if (newSub.tag) {
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
  }
  else if (typeof newSub === "number") {
    exit = 1;
  }
  else if (newSub.tag) {
    exit = 1;
  }
  else {
    var aux = function (_idx, _oldList, _newList) {
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
          enable(newList[0]);
          _newList = newList[1];
          _oldList = /* [] */0;
          _idx = idx + 1 | 0;
          continue ;
          
        }
        else {
          return /* () */0;
        }
      };
    };
    aux(0, oldSub[0], newSub[0]);
    return newSub;
  }
  if (exit === 1) {
    disable(oldSub);
    enable(newSub);
    return newSub;
  }
  
}

var none = /* NoSub */0;

exports.none         = none;
exports.batch        = batch;
exports.registration = registration;
exports.run          = run;
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
    console.log(/* tuple */[
          "Time.every",
          "enable",
          interval,
          tagger,
          callbacks
        ]);
    return function () {
      console.log(/* tuple */[
            "Time.every",
            "disable",
            id,
            interval,
            tagger,
            callbacks
          ]);
      return window.clearTimeout(id);
    };
  };
  return Tea_sub.registration(key, enableCall);
}

function delay(msTime, msg) {
  return /* EnqueueCall */Block.__(1, [function (enqueue) {
              Web_window.setTimeout(function () {
                    return Curry._1(enqueue, msg);
                  }, msTime);
              return /* () */0;
            }]);
}

exports.every = every;
exports.delay = delay;
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

function attr(key, value) {
  return /* Attribute */Block.__(1, [
            /* None */0,
            key,
            value
          ]);
}

function attrNS(namespace, key, value) {
  return /* tuple */[
          /* Some */[namespace],
          key,
          value
        ];
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
          console.log(/* tuple */[
                "TODO:  Add Attribute Unhandled",
                param[0],
                param[1],
                param[2]
              ]);
          throw [
                Caml_builtin_exceptions.failure,
                "TODO:  Add Attribute Unhandled"
              ];
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
          console.log(/* tuple */[
                "TODO:  Remove Attribute Unhandled",
                param[0],
                param[1],
                param[2]
              ]);
          throw [
                Caml_builtin_exceptions.failure,
                "TODO:  Remove Attribute Unhandled"
              ];
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
          console.log(/* tuple */[
                "TODO:  Mutate Attribute Unhandled",
                _newProp[0],
                _newProp[1],
                _newProp[2]
              ]);
          return /* () */0;
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
                  if (!(Caml_obj.caml_equal(oldProp[0], newProp$1[0]) && oldProp[1] === newProp$1[1] && oldProp[2] === newProp$1[2])) {
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

function patchVNodesOnElems_CreateElement(callbacks, _param) {
  while(true) {
    var param = _param;
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
            
      }
    }
  };
}

function patchVNodesOnElems(callbacks, elem, elems, _idx, _oldVNodes, _newVNodes) {
  while(true) {
    var newVNodes = _newVNodes;
    var oldVNodes = _oldVNodes;
    var idx = _idx;
    var exit = 0;
    if (oldVNodes) {
      var oldVnode = oldVNodes[0];
      var exit$1 = 0;
      if (newVNodes) {
        if (typeof oldVnode === "number") {
          var $js = newVNodes[0];
          if (typeof $js === "number") {
            _newVNodes = newVNodes[1];
            _oldVNodes = oldVNodes[1];
            _idx = idx + 1 | 0;
            continue ;
            
          }
          else {
            switch ($js.tag | 0) {
              case 0 : 
              case 1 : 
                  exit$1 = 2;
                  break;
              case 2 : 
                  exit = 1;
                  break;
              
            }
          }
        }
        else {
          switch (oldVnode.tag | 0) {
            case 0 : 
                var match = newVNodes[0];
                if (typeof match === "number") {
                  exit$1 = 2;
                }
                else {
                  switch (match.tag | 0) {
                    case 0 : 
                        var newText = match[0];
                        if (oldVnode[0] !== newText) {
                          var child = elems[idx];
                          child.nodeValue = newText;
                        }
                        _newVNodes = newVNodes[1];
                        _oldVNodes = oldVNodes[1];
                        _idx = idx + 1 | 0;
                        continue ;
                        case 1 : 
                        exit$1 = 2;
                        break;
                    case 2 : 
                        exit = 1;
                        break;
                    
                  }
                }
                break;
            case 1 : 
                var newNode = newVNodes[0];
                var oldRest = oldVNodes[1];
                var oldChildren = oldVnode[5];
                var oldProperties = oldVnode[4];
                var oldUnique = oldVnode[3];
                var oldKey = oldVnode[2];
                if (typeof newNode === "number") {
                  exit$1 = 2;
                }
                else {
                  switch (newNode.tag | 0) {
                    case 0 : 
                        exit$1 = 2;
                        break;
                    case 1 : 
                        var newRest = newVNodes[1];
                        var newChildren = newNode[5];
                        var newProperties = newNode[4];
                        var newUnique = newNode[3];
                        var newKey = newNode[2];
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
                          var exit$2 = 0;
                          var exit$3 = 0;
                          if (oldRest) {
                            var match$1 = oldRest[0];
                            if (typeof match$1 === "number") {
                              exit$3 = 4;
                            }
                            else if (match$1.tag === 1) {
                              if (match$1[0] === newNode[0] && match$1[1] === newNode[1] && match$1[2] === newKey) {
                                var oldChild = elems[idx];
                                elem.removeChild(oldChild);
                                _newVNodes = newRest;
                                _oldVNodes = oldRest[1];
                                _idx = idx + 1 | 0;
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
                            if (newRest) {
                              var match$2 = newRest[0];
                              if (typeof match$2 === "number") {
                                exit$2 = 3;
                              }
                              else if (match$2.tag === 1) {
                                if (oldVnode[0] === match$2[0] && oldVnode[1] === match$2[1] && oldKey === match$2[2]) {
                                  var oldChild$1 = elems[idx];
                                  var newChild = patchVNodesOnElems_CreateElement(callbacks, newNode);
                                  Web_node.insertBefore(elem, newChild, oldChild$1);
                                  _newVNodes = newRest;
                                  _idx = idx + 1 | 0;
                                  continue ;
                                  
                                }
                                else {
                                  exit$2 = 3;
                                }
                              }
                              else {
                                exit$2 = 3;
                              }
                            }
                            else {
                              exit$2 = 3;
                            }
                          }
                          if (exit$2 === 3) {
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
                        break;
                    case 2 : 
                        exit = 1;
                        break;
                    
                  }
                }
                break;
            case 2 : 
                var match$3 = newVNodes[0];
                if (typeof match$3 === "number") {
                  exit$1 = 2;
                }
                else if (match$3.tag === 2) {
                  var newRest$1 = newVNodes[1];
                  var newCache = match$3[2];
                  var newGen = match$3[1];
                  var newKey$1 = match$3[0];
                  var oldRest$1 = oldVNodes[1];
                  var oldCache = oldVnode[2];
                  var oldKey$1 = oldVnode[0];
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
                      var match$4 = oldRest$1[0];
                      if (typeof match$4 === "number") {
                        exit$5 = 4;
                      }
                      else if (match$4.tag === 2) {
                        if (match$4[0] === newKey$1) {
                          var oldChild$2 = elems[idx];
                          elem.removeChild(oldChild$2);
                          var oldVdom = match$4[2][0];
                          newCache[0] = oldVdom;
                          _newVNodes = newRest$1;
                          _oldVNodes = oldRest$1[1];
                          _idx = idx + 1 | 0;
                          continue ;
                          
                        }
                        else {
                          exit$5 = 4;
                        }
                      }
                      else {
                        exit$5 = 4;
                      }
                    }
                    else {
                      exit$5 = 4;
                    }
                    if (exit$5 === 4) {
                      if (newRest$1) {
                        var match$5 = newRest$1[0];
                        if (typeof match$5 === "number") {
                          exit$4 = 3;
                        }
                        else if (match$5.tag === 2) {
                          if (match$5[0] === oldKey$1) {
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
                            exit$4 = 3;
                          }
                        }
                        else {
                          exit$4 = 3;
                        }
                      }
                      else {
                        exit$4 = 3;
                      }
                    }
                    if (exit$4 === 3) {
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
                  exit$1 = 2;
                }
                break;
            
          }
        }
      }
      else {
        var child$3 = elems[idx];
        elem.removeChild(child$3);
        _newVNodes = /* [] */0;
        _oldVNodes = oldVNodes[1];
        continue ;
        
      }
      if (exit$1 === 2) {
        var match$6 = newVNodes[0];
        var oldRest$2 = oldVNodes[1];
        if (typeof match$6 === "number") {
          var child$4 = elems[idx];
          var newChild$2 = document.createComment("");
          Web_node.insertBefore(elem, newChild$2, child$4);
          elem.removeChild(child$4);
          _newVNodes = newVNodes[1];
          _oldVNodes = oldRest$2;
          _idx = idx + 1 | 0;
          continue ;
          
        }
        else if (match$6.tag) {
          var oldChild$4 = elems[idx];
          var newChild$3 = Web_document.createElementNsOptional(match$6[0], match$6[1]);
          patchVNodesOnElems_Properties(callbacks, newChild$3, /* [] */0, match$6[4]);
          var childChildren$2 = newChild$3.childNodes;
          patchVNodesOnElems(callbacks, newChild$3, childChildren$2, 0, /* [] */0, match$6[5]);
          Web_node.insertBefore(elem, newChild$3, oldChild$4);
          elem.removeChild(oldChild$4);
          _newVNodes = newVNodes[1];
          _oldVNodes = oldRest$2;
          _idx = idx + 1 | 0;
          continue ;
          
        }
        else {
          var child$5 = elems[idx];
          var newChild$4 = document.createTextNode(match$6[0]);
          Web_node.insertBefore(elem, newChild$4, child$5);
          elem.removeChild(child$5);
          _newVNodes = newVNodes[1];
          _oldVNodes = oldRest$2;
          _idx = idx + 1 | 0;
          continue ;
          
        }
      }
      
    }
    else if (newVNodes) {
      var newChild$5 = patchVNodesOnElems_CreateElement(callbacks, newVNodes[0]);
      elem.appendChild(newChild$5);
      _newVNodes = newVNodes[1];
      _oldVNodes = /* [] */0;
      _idx = idx + 1 | 0;
      continue ;
      
    }
    else {
      return /* () */0;
    }
    if (exit === 1) {
      var match$7 = newVNodes[0];
      var vdom = Curry._1(match$7[1], /* () */0);
      match$7[2][0] = vdom;
      _newVNodes = /* :: */[
        vdom,
        newVNodes[1]
      ];
      continue ;
      
    }
    
  };
}

function patchVNodesIntoElement(callbacks, elem, oldVNodes, newVNodes) {
  var elems = elem.childNodes;
  return patchVNodesOnElems(callbacks, elem, elems, 0, oldVNodes, newVNodes);
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
exports.attr                                         = attr;
exports.attrNS                                       = attrNS;
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

exports.Event     = Event;
exports.Node      = Node;
exports.Document  = Document;
exports.$$Date    = $$Date;
exports.Window    = Window;
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

exports.body                    = body;
exports.createElement           = createElement;
exports.createElementNS         = createElementNS;
exports.createComment           = createComment;
exports.createTextNode          = createTextNode;
exports.getElementById          = getElementById;
exports.createElementNsOptional = createElementNsOptional;
/* No side effect */

});

;require.register("src/web_event.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';



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

function removeAttributeNS(n, namespace, key) {
  return n.removeAttributeNS(namespace, key);
}

function removeAttribute(n, key) {
  return n.removeAttribute(key);
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

exports.style               = style;
exports.getStyle            = getStyle;
exports.setStyle            = setStyle;
exports.childNodes          = childNodes;
exports.firstChild          = firstChild;
exports.appendChild         = appendChild;
exports.removeChild         = removeChild;
exports.insertBefore        = insertBefore;
exports.remove              = remove;
exports.setAttributeNS      = setAttributeNS;
exports.setAttribute        = setAttribute;
exports.removeAttributeNS   = removeAttributeNS;
exports.removeAttribute     = removeAttribute;
exports.addEventListener    = addEventListener;
exports.removeEventListener = removeEventListener;
exports.focus               = focus;
exports.set_nodeValue       = set_nodeValue;
exports.get_nodeValue       = get_nodeValue;
exports.remove_polyfill     = remove_polyfill;
/* No side effect */

});

;require.register("src/web_window.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


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

exports.requestAnimationFrame          = requestAnimationFrame;
exports.clearTimeout                   = clearTimeout;
exports.setInterval                    = setInterval;
exports.setTimeout                     = setTimeout;
exports.requestAnimationFrame_polyfill = requestAnimationFrame_polyfill;
/* No side effect */

});

;require.alias("process/browser.js", "process");require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('src/main_entry.ml');
//# sourceMappingURL=app.js.map