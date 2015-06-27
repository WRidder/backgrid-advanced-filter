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
 * Matchers
 * @property Matchers
 */
Backgrid.Extension.AdvancedFilter.FilterOptions.Matchers = {
  "gt": {
    name: "greater than"
  },
  "gte": {
    name: "greater than or equal"
  },
  "lt": {
    name: "lower than"
  },
  "lte": {
    name: "lower than or equal"
  },
  "eq": {
    name: "equals"
  },
  "neq": {
    name: "does not equal"
  },
  "sw": {
    name: "starts with"
  },
  "ew": {
    name: "ends with"
  },
  "bt": {
    name: "between"
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
    validation: function(value) {
      return _.isString(value);
    },
    postProcess: function(value) {
      return value.trim();
    },
    matchers: ["sw", "ew", "eq", "neq"]
  },
  "number": {
    parser: function(value) {
      return parseFloat(value);
    },
    validation: function(value) {
      return !isNaN(value);
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "eq", "neq"]
  },
  "percent": {
    parser: function(value) {
      return parseFloat(value);
    },
    validation: function(value) {
      return !isNaN(value) && value >= 0 && value <= 100;
    },
    postProcess: function(value) {
      return value / 100;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "eq", "neq"]
  },
  "boolean": {
    parser: function(value) {
      return !!value;
    },
    validation: function(value) {
      return _.isBoolean(value);
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["eq", "neq"]
  }
};
