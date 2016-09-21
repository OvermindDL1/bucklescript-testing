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
    bucklescriptBrunch: {
      // binPath: "", // If empty it will look in the global path
      bscCwd: "src",
      tempOutputFolder: "tmp",
      bscParameters: [
        // "-c",
        // "-bs-main", "main_entry.ml",
        // "-o", "../static",
        // "-bs-package-name", "testering",
        // "-bs-package-output", "static",
        // "-bs-eval",
        "-bs-cross-module-opt"
      ]
    }
  },

  modules: {
    autoRequire: {
      'app.js': ['src/main_entry.ml'],
    },
  },

  npm: {
    enabled: true,
    whitelist: [
      "bs-platform"
    ]
  }
};
