"use strict";

/**
 * Filter collection definition
 *
 * @module AdvancedFilter.FilterParsers
 */
var _ = require("underscore");
var Backgrid = require("backgrid");
Backgrid.Extension.AdvancedFilter.FilterParsers = {};

/**
 * @class MongoParser
 * @constructor
 */
var MongoParser = Backgrid.Extension.AdvancedFilter.FilterParsers.MongoParser = function() {};

/**
 * @method parse
 * @return {Object}
 */
MongoParser.prototype.parse = function(filter) {
  var self = this;

  // Input argument checking
  if (!filter ||
    !filter instanceof Backgrid.Extension.AdvancedFilter.FilterModel) {
    throw new Error("MongoParser: No (valid) filter collection provided");
  }

  // Get array of valid filters
  var validAttributeFilters = self.getValidOnly(filter);

  // Parse filters
  var result = [];
  _.each(validAttributeFilters, function(attrFilter) {
    result.push(self.parseAttributeFilter(attrFilter.toJSON()));
  });

  return {
    "$and": result
  };
};

/**
 * @method getValidOnly
 * @param {Backgrid.Extension.AdvancedFilter.FilterModel} filter
 * @return {Array} valid attribute filter models
 * @private
 */
MongoParser.prototype.getValidOnly = function(filter) {
  // Get attribute filters
  var attributeFilters = filter.get("attributeFilters");

  // Return array of valid filters
  return attributeFilters.where({valid: true});
};

/**
 * @method parseAttributeFilter
 * @param {Object} attributeFilter
 * @return {Object} mongo style filter
 * @private
 */
MongoParser.prototype.parseAttributeFilter = function(attributeFilter) {
  var result = {};
  switch(attributeFilter.matcher) {
    // String only
    case "sw":
      // Starts with
      result[attributeFilter.column] = {
        "$regex": "^" + attributeFilter.value
      };
      break;
    case "ew":
      // Ends with
      result[attributeFilter.column] = {
        "$regex": attributeFilter.value + "$"
      };
      break;
    case "ct":
      // Contains
      result[attributeFilter.column] = {
        "$regex": attributeFilter.value
      };
      break;

    // Numerical
    case "gt":
      // Greater than
      result[attributeFilter.column] = {
        "$gt": attributeFilter.value
      };
      break;
    case "gte":
      // Greater than or equal
      result[attributeFilter.column] = {
        "$gte": attributeFilter.value
      };
      break;
    case "lt":
      // Lower than
      result[attributeFilter.column] = {
        "$lt": attributeFilter.value
      };
      break;
    case "lte":
      // Lower than or equal
      result[attributeFilter.column] = {
        "$lte": attributeFilter.value
      };
      break;
    case "bt":
      // Between (value1 <= x <= value2)
      var firstVal = {};
      var secondVal = {};

      firstVal[attributeFilter.column] = {
        "$gte": attributeFilter.value[0]
      };

      secondVal[attributeFilter.column] = {
        "$lte": attributeFilter.value[1]
      };

      result = {
        "$and": [
          firstVal, secondVal
        ]
      };
      break;

    case "nbt":
      // Outside (x < value1 OR x > value2)
      var firstValnbt = {};
      var secondValnbt = {};

      firstValnbt[attributeFilter.column] = {
        "$lt": attributeFilter.value[0]
      };

      secondValnbt[attributeFilter.column] = {
        "$gt": attributeFilter.value[1]
      };

      result = {
        "$and": [
          firstValnbt, secondValnbt
        ]
      };
      break;

    // General
    case "eq":
      // Equals
      result[attributeFilter.column] = {
        "$eq": attributeFilter.value
      };
      break;
    case "neq":
      // Does not equal
      result[attributeFilter.column] = {
        "$neq": attributeFilter.value
      };
      break;
  }
  return result;
};
