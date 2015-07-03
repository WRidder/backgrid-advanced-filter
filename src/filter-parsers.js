"use strict";

/**
 * Filter collection definition
 *
 * @module AdvancedFilter.FilterParsers
 */
var _ = require("underscore");
var Backgrid = require("backgrid");
var FilterTypes = Backgrid.Extension.AdvancedFilter.FilterOptions.Types;

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
    var attrFilterJson = attrFilter.toJSON();

    // Parse and post-process values
    var typeFilter = FilterTypes[attrFilterJson.type];
    var processedValue;
    if (_.isArray(attrFilterJson.value)) {
      processedValue = [];
      _.each(attrFilterJson.value, function(val) {
        processedValue.push(typeFilter.postProcessor(typeFilter.parser(val)));
      });
    }
    else {
      processedValue = typeFilter.postProcessor(typeFilter.parser(attrFilterJson.value));
    }

    // Create parse object
    var attrFilterToParse = {
      matcher: attrFilterJson.matcher,
      column: attrFilterJson.column,
      type: attrFilterJson.type,
      value: processedValue
    };

    // Create style filter
    result.push(self.parseAttributeFilter(attrFilterToParse));
  });

  if (_.isEmpty(result)) {
    return {};
  }
  else {
    return {
      "$and": result
    };
  }
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
        "$regex": "(?i)^" + attributeFilter.value
      };
      break;
    case "ew":
      // Ends with
      result[attributeFilter.column] = {
        "$regex": "(?i)" + attributeFilter.value + "$"
      };
      break;
    case "ct":
      // Contains
      result[attributeFilter.column] = {
        "$regex": "(?i)" + attributeFilter.value
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
        "$or": [
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
        "$ne": attributeFilter.value
      };
      break;
  }
  return result;
};

/**
 * @class MongoParser
 * @constructor
 */
var SimpleParser = Backgrid.Extension.AdvancedFilter.FilterParsers.SimpleParser = function() {};

/**
 * @method parse
 * @return {Object}
 */
SimpleParser.prototype.parse = function(filter) {
  var self = this;

  // Input argument checking
  if (!filter ||
    !filter instanceof Backgrid.Extension.AdvancedFilter.FilterModel) {
    throw new Error("SimpleParser: No (valid) filter collection provided");
  }

  // Get array of valid filters
  var validAttributeFilters = self.getValidOnly(filter);

  // Parse filters
  var result = [];
  _.each(validAttributeFilters, function(attrFilter) {
    var attrFilterJson = attrFilter.toJSON();

    // Parse and post-process values
    var typeFilter = FilterTypes[attrFilterJson.type];
    var processedValue;
    if (_.isArray(attrFilterJson.value)) {
      processedValue = [];
      _.each(attrFilterJson.value, function(val) {
        processedValue.push(typeFilter.postProcessor(typeFilter.parser(val)));
      });
    }
    else {
      processedValue = typeFilter.postProcessor(typeFilter.parser(attrFilterJson.value));
    }

    // Create parse object
    var attrFilterToParse = {
      matcher: attrFilterJson.matcher,
      column: attrFilterJson.column,
      type: attrFilterJson.type,
      value: processedValue
    };

    // Create style filter
    result.push(self.parseAttributeFilter(attrFilterToParse));
  });

  return result;
};

/**
 * @method getValidOnly
 * @param {Backgrid.Extension.AdvancedFilter.FilterModel} filter
 * @return {Array} valid attribute filter models
 * @private
 */
SimpleParser.prototype.getValidOnly = function(filter) {
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
SimpleParser.prototype.parseAttributeFilter = function(attributeFilter) {
  var result = {};
  switch(attributeFilter.matcher) {
    // String only
    case "sw":
      // Starts with
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "regex",
          value: "^" + attributeFilter.value
        }
      };
      break;
    case "ew":
      // Ends with
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "regex",
          value: attributeFilter.value + "$"
        }
      };
      break;
    case "ct":
      // Contains
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "regex",
          value: attributeFilter.value
        }
      };
      break;

    // Numerical
    case "gt":
      // Greater than
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "gt",
          value: attributeFilter.value
        }
      };
      break;
    case "gte":
      // Greater than or equal
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "gte",
          value: attributeFilter.value
        }
      };
      break;
    case "lt":
      // Lower than
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "lt",
          value: attributeFilter.value
        }
      };
      break;
    case "lte":
      // Lower than or equal
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "lte",
          value: attributeFilter.value
        }
      };
      break;
    case "bt":
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "bt",
          value: attributeFilter.value
        }
      };
      break;
    case "nbt":
      // Outside (x < value1 OR x > value2)
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "nbt",
          value: attributeFilter.value
        }
      };
      break;

    // General
    case "eq":
      // Equals
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "eq",
          value: attributeFilter.value
        }
      };
      break;
    case "neq":
      // Does not equal
      result = {
        "column": attributeFilter.column,
        "matcher": {
          type: "neq",
          value: attributeFilter.value
        }
      };
      break;
  }
  return result;
};
