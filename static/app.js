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

require.register("bs-platform/lib/js/list.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Caml_builtin_exceptions = require("/bs-platform/lib/js/caml_builtin_exceptions");
var Caml_obj                = require("/bs-platform/lib/js/caml_obj");
var Pervasives              = require("/bs-platform/lib/js/pervasives");
var Curry                   = require("/bs-platform/lib/js/curry");

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

require.register("bs-platform/lib/js/string.js", function(exports, require, module) {
  require = __makeRelativeRequire(require, {}, "bs-platform");
  (function() {
    'use strict';

var Bytes       = require("/bs-platform/lib/js/bytes");
var Caml_int32  = require("/bs-platform/lib/js/caml_int32");
var Caml_string = require("/bs-platform/lib/js/caml_string");
var List        = require("/bs-platform/lib/js/list");

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
require.register("src/cmd.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


var none = /* None */0;

exports.none = none;
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

;require.register("src/main_entry.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Fib   = require("./fib");
var Block = require("bs-platform/lib/js/block");
var Vdom  = require("./vdom");

for(var i = 0; i <= 10; ++i){
  console.log(Fib.fib(i));
}

var res = /* () */0;

function Increment(M) {
  var x = M[/* x */0] + 1 | 0;
  return /* module */[/* x */x];
}

var Three = /* module */[/* x */3];

var x = 4;

var Four = /* module */[/* x */x];

var x$1 = x + 1 | 0;

var Five = /* module */[/* x */x$1];

var inc_test = x + x$1 | 0;

function init() {
  return /* record */[/* count */0];
}

function update(model, param) {
  if (typeof param === "number") {
    switch (param) {
      case 0 : 
          return /* tuple */[
                  /* record */[/* count */model[/* count */0] + 1 | 0],
                  /* None */0
                ];
      case 1 : 
          return /* tuple */[
                  /* record */[/* count */model[/* count */0] - 1 | 0],
                  /* None */0
                ];
      case 2 : 
          return /* tuple */[
                  /* record */[/* count */0],
                  /* None */0
                ];
      
    }
  }
  else {
    return /* tuple */[
            /* record */[/* count */param[0]],
            /* None */0
          ];
  }
}

function view_button(title, msg) {
  return Vdom.node("button", /* :: */[
              /* Event */Block.__(3, [
                  "click",
                  function () {
                    return msg;
                  }
                ]),
              /* [] */0
            ], /* :: */[
              /* Text */Block.__(0, [title]),
              /* [] */0
            ]);
}

function view(model) {
  return Vdom.node("div", /* [] */0, /* :: */[
              Vdom.node("span", /* :: */[
                    Vdom.style("text-weight", "bold"),
                    /* [] */0
                  ], /* :: */[
                    /* Text */Block.__(0, ["" + model[/* count */0]]),
                    /* [] */0
                  ]),
              /* :: */[
                view_button("Increment", /* Increment */0),
                /* :: */[
                  view_button("Decrement", /* Decrement */1),
                  /* :: */[
                    model[/* count */0] !== 0 ? view_button("Reset", /* Reset */2) : /* NoVNode */0,
                    /* :: */[
                      view_button("Set to 42", /* Set */[42]),
                      /* [] */0
                    ]
                  ]
                ]
              ]
            ]);
}

var view_test = view(/* record */[/* count */42]);

var renderTest = Vdom.renderToHtmlString(view_test);

console.log(Vdom.renderToHtmlString(view_test));

var elem = Vdom.createElementFromVNode(view_test);

var match = document.getElementById("content");

var attachedElem = match !== null ? (console.log(match.appendChild(elem)), /* () */0) : (console.log("Failed to attach"), /* () */0);

var main = 42;

exports.res          = res;
exports.Increment    = Increment;
exports.Three        = Three;
exports.Four         = Four;
exports.Five         = Five;
exports.inc_test     = inc_test;
exports.init         = init;
exports.update       = update;
exports.view_button  = view_button;
exports.view         = view;
exports.view_test    = view_test;
exports.renderTest   = renderTest;
exports.elem         = elem;
exports.attachedElem = attachedElem;
exports.main         = main;
/* res Not a pure module */

});

;require.register("src/tea.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


var App = 0;

exports.App = App;
/* No side effect */

});

;require.register("src/tea_app.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function Make() {
  return /* module */[];
}

exports.Make = Make;
/* No side effect */

});

;require.register("src/vdom.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';

var Block    = require("bs-platform/lib/js/block");
var Web      = require("./web");
var $$String = require("bs-platform/lib/js/string");
var List     = require("bs-platform/lib/js/list");

function text(s) {
  return /* Text */Block.__(0, [s]);
}

function node(tagName, props, vdoms) {
  return /* Node */Block.__(1, [
            /* None */0,
            /* None */0,
            tagName,
            props,
            vdoms
          ]);
}

function keyedNode(key, tagName, props, vdoms) {
  return /* Node */Block.__(1, [
            /* None */0,
            /* Some */[key],
            tagName,
            props,
            vdoms
          ]);
}

function nsNode(namespace, tagName, props, vdoms) {
  return /* Node */Block.__(1, [
            /* Some */[namespace],
            /* None */0,
            tagName,
            props,
            vdoms
          ]);
}

function nsKeyedNode(namespace, key, tagName, props, vdoms) {
  return /* Node */Block.__(1, [
            /* Some */[namespace],
            /* Some */[key],
            tagName,
            props,
            vdoms
          ]);
}

function prop(key, value) {
  return /* RawProp */Block.__(0, [
            key,
            value
          ]);
}

function on(name, cb) {
  return /* Event */Block.__(3, [
            name,
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

function renderToHtmlString(param) {
  if (typeof param === "number") {
    return "";
  }
  else if (param.tag) {
    var tagName = param[2];
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
                                                      '="func"',
                                                      /* [] */0
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
                            }, param[3])),
                    /* :: */[
                      ">",
                      /* :: */[
                        $$String.concat("", List.map(renderToHtmlString, param[4])),
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
  }
  else {
    return param[0];
  }
}

function applyProperties(elem, curProperties) {
  return List.fold_left(function (elem, param) {
              if (typeof param === "number") {
                return elem;
              }
              else {
                switch (param.tag | 0) {
                  case 0 : 
                  case 1 : 
                  case 2 : 
                  case 3 : 
                      return elem;
                  case 4 : 
                      return List.fold_left(function (elem, param) {
                                  elem.style[param[0]] = param[1];
                                  return elem;
                                }, elem, param[0]);
                  
                }
              }
            }, elem, curProperties);
}

function createElementFromVNode_addProps(_, elem) {
  return elem;
}

function createElementFromVNode_addChildren(children, elem) {
  return List.fold_left(function (n, child) {
              n.appendChild(createElementFromVNode(child));
              return n;
            }, elem, children);
}

function createElementFromVNode(param) {
  if (typeof param === "number") {
    return document.createComment();
  }
  else if (param.tag) {
    return createElementFromVNode_addChildren(param[4], Web.createElementNsOptional(param[0], param[2]));
  }
  else {
    var text = param[0];
    return document.createTextNode(text);
  }
}

function createVNodesIntoElement(vnodes, elem) {
  return List.fold_left(function (n, vnode) {
              n.appendChild(createElementFromVNode(vnode));
              return n;
            }, elem, vnodes);
}

var noNode = /* NoVNode */0;

var noProp = /* NoProp */0;

exports.noNode                             = noNode;
exports.text                               = text;
exports.node                               = node;
exports.keyedNode                          = keyedNode;
exports.nsNode                             = nsNode;
exports.nsKeyedNode                        = nsKeyedNode;
exports.noProp                             = noProp;
exports.prop                               = prop;
exports.on                                 = on;
exports.attr                               = attr;
exports.attrNS                             = attrNS;
exports.data                               = data;
exports.style                              = style;
exports.styles                             = styles;
exports.renderToHtmlString                 = renderToHtmlString;
exports.applyProperties                    = applyProperties;
exports.createElementFromVNode_addProps    = createElementFromVNode_addProps;
exports.createElementFromVNode_addChildren = createElementFromVNode_addChildren;
exports.createElementFromVNode             = createElementFromVNode;
exports.createVNodesIntoElement            = createVNodesIntoElement;
/* No side effect */

});

;require.register("src/web.ml", function(exports, require, module) {
// Generated by BUCKLESCRIPT VERSION 1.0.3 , PLEASE EDIT WITH CARE
'use strict';


function createElementNsOptional(namespace, tagName) {
  if (namespace) {
    return document.createElementNS(namespace[0], tagName);
  }
  else {
    return document.createElement(tagName);
  }
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createComment() {
  return document.createComment();
}

exports.createElementNsOptional = createElementNsOptional;
exports.createTextNode          = createTextNode;
exports.createComment           = createComment;
/* No side effect */

});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');

require('src/main_entry.ml');
//# sourceMappingURL=app.js.map