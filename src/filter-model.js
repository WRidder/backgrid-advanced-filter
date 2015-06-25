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
  },

  /**
   * @method getActiveFilter
   * @return {Backgrid.Extension.AdvancedFilter.FilterModel}
   */
  getActiveFilter: function() {
    var self = this;
    var filterId = self.get("activeFilterId");
    return self.get("filterCollection").get(filterId);
  }
});
