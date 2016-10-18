// -*- js-indent-level: 2 -*-
// See http://brunch.io for documentation.
module.exports = {
  files: {
    javascripts: {
      joinTo: 'app.js'
    },
    stylesheets: {joinTo: 'app.css'},
    templates: {joinTo: 'app.js'}
  },

  paths: {
    watched: [
      "src"
    ],
    public: "static"
  },

  plugins: {
    closurecompiler: {
      compilationLevel: 'SIMPLE', //'ADVANCED', // 'SIMPLE', // 'WHITESPACE_ONLY',
      createSourceMap: true
    },
    bucklescriptBrunch: {
      // binPaths: {}, // If empty it will look in the node_modules then the global path
      bscCwd: "src",
      tempOutputFolder: "tmp",
      compileAllAtOnce: process.platform == 'win32',
      bscParameters: [
        "-bs-cross-module-opt",
        "-safe-string",
        "-w", "+a-4-29-42"
      ],
      ppxs: [
        // "ppx_deriving",
      //   "ppx_compare",
      //   "ppx_variants_conv",
      //   "ppx_fields_conv",
      //   "ppx_here",
      //   "ppx_fail",
      //   "ppx_pipebang"
      ],
      verbosity: 1
    }
  },

  modules: {
    autoRequire: {
      'app.js': ['src/main_entry.ml']
    }
  },

  npm: {
    enabled: true,
    whitelist: [
      "bs-platform"
    ]
  }
};
