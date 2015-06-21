"use strict";
module.exports = function (grunt) {
  grunt.initConfig({
    jasmine: {
      test: {
        src: [
            "lib/Backgrid.AdvancedFilter.js",
            "test/helpers/*.js"
          ],
        options: {
          specs: "test/*.js",
          vendor: [
            "node_modules/jquery/dist/jquery.min.js",
            "node_modules/underscore/underscore-min.js",
            "node_modules/backbone/backbone-min.js",
            "node_modules/backgrid/lib/backgrid.js"
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jasmine");
  grunt.registerTask("test", "jasmine");
};
