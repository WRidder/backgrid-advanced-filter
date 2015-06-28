"use strict";

/**
 * Filter collection definition
 *
 * @module AdvancedFilter.FilterOptions
 */
var Backgrid = require("backgrid");
var _ = require("underscore");
Backgrid.Extension.AdvancedFilter.FilterOptions = {};

/**
 * MatchersValueTypeValidator
 * @property MatchersValueTypeValidator
 */
Backgrid.Extension.AdvancedFilter.FilterOptions.MatchersValueTypeValidator = {
  single: function(value) {
    return !_.isUndefined(value) && !_.isNull(value)
      && !_.isArray(value) && !_.isFunction(value);
  },
  array2: function(value) {
    return _.isArray(value) && value.length === 2;
  }
};

/**
 * Matchers
 * @property Matchers
 */
Backgrid.Extension.AdvancedFilter.FilterOptions.Matchers = {
  "gt": {
    name: "greater than",
    valueType: "single"
  },
  "gte": {
    name: "greater than or equal",
    valueType: "single"
  },
  "lt": {
    name: "lower than",
    valueType: "single"
  },
  "lte": {
    name: "lower than or equal",
    valueType: "single"
  },
  "eq": {
    name: "equals",
    valueType: "single"
  },
  "neq": {
    name: "does not equal",
    valueType: "single"
  },
  "sw": {
    name: "starts with",
    valueType: "single"
  },
  "ew": {
    name: "ends with",
    valueType: "single"
  },
  "ct": {
    name: "contains",
    valueType: "single"
  },
  "bt": {
    name: "between",
    valueType: "array2"
  },
  "nbt": {
    name: "outside",
    valueType: "array2"
  }
};

/**
 * Types
 * @property Types
 */
Backgrid.Extension.AdvancedFilter.FilterOptions.Types = {
  "text": {
    parser: function(value) {
      return value;
    },
    validator: function(value) {
      return _.isString(value);
    },
    postProcessor: function(value) {
      return value.trim();
    },
    matchers: ["sw", "ew", "eq", "neq", "ct"]
  },
  "number": {
    parser: function(value) {
      return parseFloat(value);
    },
    validator: function(value) {
      return !isNaN(value);
    },
    postProcessor: function(value) {
      return value;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "nbt", "eq", "neq"]
  },
  "percent": {
    parser: function(value) {
      return parseFloat(value);
    },
    validator: function(value) {
      return !isNaN(value) && value >= 0 && value <= 100;
    },
    postProcessor: function(value) {
      return value / 100;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "nbt", "eq", "neq"]
  },
  "boolean": {
    parser: function(value) {
      return !!value;
    },
    validator: function(value) {
      return _.isBoolean(value);
    },
    postProcessor: function(value) {
      return value;
    },
    matchers: ["eq", "neq"]
  }
};
