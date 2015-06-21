"use strict";
var wallabyWebpack = require("wallaby-webpack");
var webpackConfig = require("./config/webpack.wallaby");
var webpackPostprocessor = wallabyWebpack(webpackConfig());

module.exports = function () {
  return {
    files: [
      // Css files
      "node_modules/bootstrap/dist/css/bootstrap.css",
      "node_modules/backgid/lib/backgrid.css",
      "node_modules/backgid-filter/backgrid-filter.css",
      "./lib/Backgrid.AdvancedFilter.css",
      {
        pattern: "node_modules/jquery/dist/jquery.min.js",
        instrument: false
      },
      {
        pattern: "node_modules/underscore/underscore-min.js",
        instrument: false
      },
      {
        pattern: "node_modules/backbone/backbone-min.js",
        instrument: false
      },
      {
        pattern: "node_modules/backgrid/lib/backgrid.js",
        instrument: false
      },
      {
        pattern: "node_modules/backgrid-filter/backgrid-filter.js",
        instrument: false
      },
      {
        pattern: "node_modules/bootstrap/dist/js/bootstrap.js",
        instrument: false
      },
      {
        pattern: "src/*.js",
        load: false
      },
      {
        pattern: "test/helpers/*.js",
        load: false
      }
    ],

    tests: [
      {
        pattern: "test/*.js",
        load: false
      }
    ],
    //debug: true,
    postprocessor: webpackPostprocessor,
    bootstrap: function () {
      // Specify wallaby environment
      window.wallabyEnv = true;

      // Execute tests
      window.__moduleBundler.loadTests();
    }
  };
};
