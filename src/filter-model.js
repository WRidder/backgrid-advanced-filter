"use strict";

/**
 * Filter state model definition
 *
 * @module AdvancedFilter.FilterStateModel
 */
var Backbone = require("backbone");
var Backgrid = require("backgrid");

/**
 *
 * @class FilterStateModel
 * @extends Backbone.Model
 */
Backgrid.Extension.AdvancedFilter.FilterStateModel = Backbone.Model.extend({
  defaults: {
    activeFilterId: null,
    columnCollection: null,
    dataCollection: null,
    filterCollection: null
  }
});
