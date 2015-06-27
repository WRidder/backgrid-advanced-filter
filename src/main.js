"use strict";

/**
 * A column manager for backgrid
 *
 * @module AdvancedFilter
 */
var Backgrid = require("backgrid");

// Setup root object
Backgrid.Extension.AdvancedFilter = {
  SubComponents: {}
};

// Require submodules
require("./filter-options");
require("./filter-parsers");
require("./filter-model");
require("./filter-collection");
require("./filter-editor");
require("./filter-saver");
require("./filter-dropdown");
require("./filter-selector");
require("./filter-main");
