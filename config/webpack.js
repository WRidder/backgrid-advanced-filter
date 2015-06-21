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
    entry: "./src/Backgrid.AdvancedFilter.js",

    output: {
      filename: (release) ? "lib/Backgrid.AdvancedFilter.min.js" : "lib/Backgrid.AdvancedFilter.js",

      // Library settings
      library: "Backgrid.Extension.AdvancedFilter",
      libraryTarget: "umd"
    },
    externals: {
      "jquery": "jQuery",
      "backbone": "Backbone",
      "underscore": "_",
      "backgrid": "Backgrid"
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
