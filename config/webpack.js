"use strict";

var webpack = require("webpack");
/**
 * Configuration for Webpack
 * @param {boolean} release True if configuration is intended to be used in
 * a release mode, false otherwise
 * @return {object} Webpack configuration
 */
module.exports = function (release) {
  return {
    entry: "./src/main.js",

    output: {
      filename: (release) ? "lib/Backgrid.AdvancedFilter.min.js" : "lib/Backgrid.AdvancedFilter.js",

      // Library settings
      library: "Backgrid.Extension.AdvancedFilter",
      libraryTarget: "umd"
    },
    externals: {
      "jquery": {
        root: "jQuery",
        amd: "jquery",
        commonjs: "jquery",
        commonjs2: "jquery"
      },
      "backbone": {
        root: "Backbone",
        amd: "backbone",
        commonjs: "backbone",
        commonjs2: "backbone"
      },
      "underscore": {
        root: "_",
        amd: "underscore",
        commonjs: "underscore",
        commonjs2: "underscore"
      },
      "backgrid": {
        root: "Backgrid",
        amd: "backgrid",
        commonjs: "backgrid",
        commonjs2: "backgrid"
      }
    },

    stats: {
      colors: true,
      reasons: !release
    },

    plugins: release ? [
      new webpack.DefinePlugin({"process.env.NODE_ENV": "production"}),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({sourceMap: false}),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin()
    ] : [],

    resolve: {
      extensions: ["", ".js"],
      modulesDirectories: ["node_modules"]
    }
  };
};
