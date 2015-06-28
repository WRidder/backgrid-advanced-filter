"use strict";

/**
 * Filter state model definition
 *
 * @module AdvancedFilter.FilterStateModel
 */
var _ = require("underscore");
var Backbone = require("backbone");
var Backgrid = require("backgrid");
var FilterTypes = Backgrid.Extension.AdvancedFilter.FilterOptions.Types;
var FilterMatchers = Backgrid.Extension.AdvancedFilter.FilterOptions.Matchers;

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
  },

  /**
   * @method setActiveFilter
   * @param filterToActivate
   */
  setActiveFilter: function(filterToActivate) {
    var self = this;

    // Remove saved state from current filter
    self.trigger("filter:save");

    var filterId;
    if (filterToActivate instanceof Backgrid.Extension.AdvancedFilter.FilterModel) {
      filterId = filterToActivate.cid;
    }
    else {
      filterId = filterToActivate;
    }

    if (self.get("filterCollection").get(filterId)) {
      self.set("activeFilterId", filterId);
    }
  },

  /**
   * @method getFilterableColumns
   */
  getFilterableColumns: function() {
    var self = this;
    var columns = self.get("columnCollection");
    if (!columns) {
      return {};
    }

    var filterAbleColumns = columns.filter(function(col) {
      return _.has(FilterTypes, col.get("filterType"));
    });

    var result = {};
    _.each(filterAbleColumns, function(col) {
      result[col.get("name")] = {
        label: col.get("label"),
        filterType: col.get("filterType")
      };
    });

    return result;
  },

  /**
   * @method getMatchers
   * @param {String} type
   */
  getMatchers: function(type) {
    var filterType = FilterTypes[type];

    if (!filterType) {
      return {};
    }

    var result = {};
    _.each(filterType.matchers, function(matcher) {
      result[matcher] = {
        label: FilterMatchers[matcher].name
      };
    });

    return result;
  },

  /**
   * @method getInputTypeInfoForMatcher
   * @param matcher
   * @return {string}
   */
  getInputTypeInfoForMatcher: function(matcher, filterType) {
    return {
      valueType: FilterMatchers[matcher].valueType,
      inputType: FilterTypes[filterType].inputType
    };
  },

  /**
   * @method getValueParser
   * @param filterType
   * @return {Function}
   */
  getValueParser: function(filterType) {
    return FilterTypes[filterType].parser;
  }
});
