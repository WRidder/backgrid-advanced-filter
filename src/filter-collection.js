"use strict";

/**
 * Filter collection definition
 *
 * @module AdvancedFilter.FilterCollection
 */
var Backbone = require("backbone");
var Backgrid = require("backgrid");
var _ = require("underscore");
var Matchers = Backgrid.Extension.AdvancedFilter.FilterOptions.Matchers;
var FilterTypes = Backgrid.Extension.AdvancedFilter.FilterOptions.Types;
var MatchersValueTypeValidator = Backgrid.Extension.AdvancedFilter.FilterOptions.MatchersValueTypeValidator;

/**
 *
 * @class AdvancedFilter.AttributeFilterModel
 * @extends Backbone.Model
 */
var attributeFilterModel = Backgrid.Extension.AdvancedFilter.AttributeFilterModel = Backbone.Model.extend({
  defaults: {
    column: null,
    type: null,
    matcher: null,
    value: null,
    valid: false
  },

  initialize: function() {
    var self = this;

    // Events
    self.listenTo(self, "change:column change:type change:matcher change:value", self.checkValidity);
  },

  checkValidity: function() {
    var self = this;
    var valid = false;

    // Check if type exists
    var type = self.get("type");
    var matcher = self.get("matcher");
    var value = self.get("value");
    if (_.has(FilterTypes, type)) {

      // Check if matcher belongs to type
      if (!_.contains(FilterTypes[type].matchers)) {

        // Check if the type of value is valid for current matcher
        var matcherValueType = Matchers[matcher].valueType;
        if (MatchersValueTypeValidator[matcherValueType](value)) {
          // Validate the value
          valid = FilterTypes[type].validator(value);
        }
      }
    }
    self.set("valid", valid);
  }
});

/**
 *
 * @class AdvancedFilter.AttributeFilterCollection
 * @extends Backbone.Collection
 */
Backgrid.Extension.AdvancedFilter.AttributeFilterCollection = Backbone.Collection.extend({
  model: attributeFilterModel,

  /**
   * @method createNewFilter
   */
  createNewAttributeFilter: function() {
    var self = this;

    self.add({});
  }
});

/**
 *
 * @class AdvancedFilter.FilterModel
 * @extends Backbone.Model
 */
var FilterModel = Backgrid.Extension.AdvancedFilter.FilterModel = Backbone.Model.extend({
  defaults: {
    name: null,
    attributeFilters: null
  },
  lastSavedState: null,
  filterChanged: false,

  /**
   * @method initialize
   */
  initialize: function () {
    var self = this;

    // Save the initial state so we can cancel changes later.
    self.saveState();

    // Update events
    self.listenTo(self.get("attributeFilters"), "change add remove", self.evtFilterChanged);
    self.listenTo(self, "change:name", self.evtFilterChanged);
  },

  /**
   * @method evtFilterChanged
   */
  evtFilterChanged: function () {
    var self = this;
    self.filterChanged = true;

    self.trigger("filter:changed");
  },

  /**
   * @method saveFilter
   */
  saveFilter: function () {
    var self = this;
    self.saveState();
  },

  /**
   * @method resetFilter
   */
  resetFilter: function () {
    var self = this;
    self.get("attributeFilters").reset([]);
  },

  /**
   * @method cancelFilter
   */
  cancelFilter: function () {
    var self = this;
    self.loadSavedState();
  },

  /**
   * @method saveState
   * @private
   */
  saveState: function () {
    var self = this;

    var name = self.get("name");
    var attributeFilters = self.get("attributeFilters");

    if (attributeFilters && attributeFilters.length > 0) {
      attributeFilters = attributeFilters.toJSON();
    }
    else {
      attributeFilters = null;
    }

    self.lastSavedState = {
      name: name,
      attributeFilters: attributeFilters
    };

    self.filterChanged = false;
  },

  /**
   * @method loadSavedState
   * @private
   */
  loadSavedState: function () {
    var self = this;
    if (self.lastSavedState) {
      self.set("name", self.lastSavedState.name);
      self.get("attributeFilters").reset(self.lastSavedState.attributeFilters);
    }
  },

  /**
   * @method removeSavedState
   */
  removeSavedState: function () {
    var self = this;
    self.lastSavedState = null;
  },

  /**
   * Set override
   * Makes sure the attributeFilters are set as a collection.
   *
   * @method set
   * @param {Object} attributes
   * @param {Object} options
   * @return {*}
   */
  set: function (attributes, options) {
    var AttrCollection = Backgrid.Extension.AdvancedFilter.AttributeFilterCollection;
    if (attributes.attributeFilters !== undefined && !(attributes.attributeFilters instanceof AttrCollection)) {
      attributes.attributeFilters = new AttrCollection(attributes.attributeFilters);
    }
    return Backbone.Model.prototype.set.call(this, attributes, options);
  },

  /**
   * Export the filter for a given style
   * @method exportFilter
   * @param {String} style. Values: "(mongo|mongodb), ..."
   * @param {boolean} exportAsString exports as a string if true.
   * @return {Object}
   */
  exportFilter: function (style, exportAsString) {
    var self = this;

    var result;
    switch (style) {
      case "mongo":
      case "mongodb":
      default:
        var mongoParser = new Backgrid.Extension.AdvancedFilter.FilterParsers.MongoParser();
        result = mongoParser.parse(self);

        if (exportAsString) {
          result = self.stringifyFilterJson(result);
        }
    }
    return result;
  },

  /**
   * @method stringifyFilterJson
   * @param {Object} filterObj
   * @param {String} style. Values: "(mongo|mongodb), ..."
   */
  stringifyFilterJson: function(filterObj, style) {
    var result;
    switch (style) {
      case "mongo":
      case "mongodb":
      default:
        result = JSON.stringify(filterObj);
    }
    return result;
  }
});

/**
 *
 * @class AdvancedFilter.FilterCollection
 * @extends Backbone.Collection
 */
Backgrid.Extension.AdvancedFilter.FilterCollection = Backbone.Collection.extend({
  /**
   * Partial in newFilterName which is replaced by a number.
   * @property filterNamePartial
   */
  filterNamePartial: "{count}",

  /**
   *  Template for new filter names. Beware: partial should be located at the end!
   *  @property newFilterName
   */
  newFilterName: "New Filter #{count}",
  newFilterCount: 0,
  model: FilterModel,

  /**
   * @method createNewFilter
   * @return {Backbone.Model} newFilter
   */
  createNewFilter: function() {
    var self = this;

    var newFilter = new FilterModel({
      name: self.getNewFilterName(self.getNewFilterNumber())
    });

    // Add to the collection
    self.add(newFilter);

    // Return the filter
    return newFilter;
  },

  /**
   * Retrieves a new filter number.
   * @method getNewFilterNumber
   * @return {int}
   * @private
   */
  getNewFilterNumber: function() {
    var self = this;
    self.newFilterCount += 1;

    if (self.length === 0) {
      return self.newFilterCount;
    }
    else {
      var newFilterName = self.newFilterName.replace(self.filterNamePartial, "");
      var results = self.filter(function(fm) {
        return fm.get("name").indexOf(newFilterName) === 0;
      }).map(function(fm) {
        return fm.get("name");
      });

      if (_.isArray(results) && results.length > 0) {
        // Sort results
        results.sort();

        // Get highest count
        var highestCount = parseInt(results[results.length - 1].replace(newFilterName, ""));
        if (_.isNaN(highestCount)) {
          highestCount = self.newFilterCount;
        }
        else {
          highestCount += 1;
        }
      }
      else {
        highestCount = self.newFilterCount;
      }

      return highestCount;
    }
  },

  /**
   *
   * @method getNewFilterName
   * @param {int} count
   * @return {string}
   * @private
   */
  getNewFilterName: function(count) {
    return this.newFilterName.replace(this.filterNamePartial, count);
  }
});
