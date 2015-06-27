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
    result.push(self.parseAttributeFilter(attrFilter));
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

MongoParser.prototype.parseAttributeFilter = function(attributeFilter) {
  var self = this;

  var result = {};
  switch (attributeFilter.get("type")) {
    case "text":
      result = self.parseTextFilter(attributeFilter.toJSON());
          break;
    case "number":
      result = self.parseNumberFilter(attributeFilter.toJSON());
          break;
    case "percent":
      result = self.parseNumberFilter(attributeFilter.toJSON());
          break;
    case "boolean":
      result = self.parseBooleanFilter(attributeFilter.toJSON());
          break;
  }

  return result;
};

MongoParser.prototype.parseTextFilter = function(attributeFilter) {
  var result = {};
  switch(attributeFilter.matcher) {
    case "eq":
      result[attributeFilter.column] = {
        "$eq": attributeFilter.value
      };
      break;
    case "neq":
      result[attributeFilter.column] = {
        "$neq": attributeFilter.value
      };
      break;
    case "sw":
      result[attributeFilter.column] = new RegExp("^" + attributeFilter.value);
      break;
    case "ew":
      result[attributeFilter.column] = new RegExp(attributeFilter.value + "$");
      break;
    case "ct":
      result[attributeFilter.column] = new RegExp(attributeFilter.value);
      break;
  }

  return result;
};

MongoParser.prototype.parseNumberFilter = function(attributeFilter) {
  var result = {};
  switch(attributeFilter.matcher) {
    case "eq":
      result[attributeFilter.column] = {
        "$eq": attributeFilter.value
      };
      break;
    case "neq":
      result[attributeFilter.column] = {
        "$neq": attributeFilter.value
      };
      break;
    case "gt":
      result[attributeFilter.column] = {
        "$gt": attributeFilter.value
      };
      break;
    case "gte":
      result[attributeFilter.column] = {
        "$gte": attributeFilter.value
      };
      break;
    case "lt":
      result[attributeFilter.column] = {
        "$lt": attributeFilter.value
      };
      break;
    case "lte":
      result[attributeFilter.column] = {
        "$lte": attributeFilter.value
      };
      break;
    case "bt":
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
  }

  return result;
};

MongoParser.prototype.parseBooleanFilter = function(attributeFilter) {
  var result = {};
  switch(attributeFilter.matcher) {
    case "eq":
      result[attributeFilter.column] = {
        "$eq": attributeFilter.value
      };
      break;
    case "neq":
      result[attributeFilter.column] = {
        "$neq": attributeFilter.value
      };
      break;
  }

  return result;
};
