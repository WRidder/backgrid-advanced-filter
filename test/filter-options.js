/* global Backgrid _ */
"use strict";
if (window.wallabyEnv) {
  require("../src/main");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;
var FilterTypes = AdvancedFilter.FilterOptions.Types;
var Matchers = AdvancedFilter.FilterOptions.Matchers;
var MatchersValueTypeValidator = AdvancedFilter.FilterOptions.MatchersValueTypeValidator;

describe("A Backgrid.AdvancedFilter Matcher value type validator", function () {
  describe("of type Single", function () {
    it("checks if input is a single value", function() {
      var singleTypeValidator = MatchersValueTypeValidator.single;

      expect(singleTypeValidator(1)).toBe(true);
      expect(singleTypeValidator("string")).toBe(true);

      expect(singleTypeValidator(null)).toBe(false);
      expect(singleTypeValidator([])).toBe(false);
      expect(singleTypeValidator([1, 1])).toBe(false);
      expect(singleTypeValidator(["val1", "val2"])).toBe(false);
      expect(singleTypeValidator(function() {})).toBe(false);
    });
  });

  describe("of type Array2", function () {
    it("checks if input is a non-empty array", function() {
      var arrayTypeValidator = MatchersValueTypeValidator.array2;

      expect(arrayTypeValidator([1, 1])).toBe(true);
      expect(arrayTypeValidator(["val1", "val2"])).toBe(true);

      expect(arrayTypeValidator([])).toBe(false);
      expect(arrayTypeValidator([1])).toBe(false);
      expect(arrayTypeValidator(["val1"])).toBe(false);
      expect(arrayTypeValidator([1, 1, 1])).toBe(false);
      expect(arrayTypeValidator(["val1", "val2", "val3"])).toBe(false);
      expect(arrayTypeValidator(1)).toBe(false);
      expect(arrayTypeValidator("string")).toBe(false);
      expect(arrayTypeValidator(null)).toBe(false);
    });
  });
});

describe("A Backgrid.AdvancedFilter filter", function () {
  describe("of type Text", function () {
    var typeFilter = FilterTypes.text;
    var typeMatchers = typeFilter.matchers.sort();

    it("has matchers which are defined in the Matchers list", function () {
      expect(_.intersection(typeMatchers, _.keys(Matchers)).length).toEqual(typeMatchers.length);
    });

    it("supports 'starts with', 'ends with', 'equals' and 'does not equal'", function(){
      expect(typeMatchers).toEqual(["ct", "eq", "ew", "neq", "sw"]);
    });

    it("has a parser which just returns the same value", function () {
      var testValue = " A test string!";
      expect(typeFilter.parser(testValue)).toEqual(testValue);
    });

    it("has a validator for strings", function () {
      expect(typeFilter.validator(123)).toBe(false);
      expect(typeFilter.validator(parseInt("bla"))).toBe(false);
      expect(typeFilter.validator({})).toBe(false);
      expect(typeFilter.validator("A string")).toBe(true);
    });

    it("has a post processor which trims the string", function () {
      var testValue = " A test string!";
      var testValuePost = "A test string!";
      expect(typeFilter.postProcessor(testValue)).toEqual(testValuePost);
    });
  });

  describe("of type Number", function () {
    var typeFilter = FilterTypes.number;
    var typeMatchers = typeFilter.matchers.sort();

    it("has matchers which are defined in the Matchers list", function () {
      expect(_.intersection(typeMatchers, _.keys(Matchers)).length).toEqual(typeMatchers.length);
    });

    it("supports 'greater than', 'greater than or equals', 'lower than', " +
      "'lower than or equals', 'between', 'equals' and 'does not equal'", function(){
      expect(typeMatchers).toEqual(["bt", "eq", "gt", "gte", "lt", "lte", "nbt", "neq"]);
    });

    it("has a parser which parses the value as a float", function () {
      expect(typeFilter.parser(1)).toEqual(1.0);
      expect(typeFilter.parser(0)).toEqual(0);
      expect(typeFilter.parser("0.1")).toEqual(0.1);
      expect(typeFilter.parser("999")).toEqual(999);
      expect(typeFilter.parser("bla")).toEqual(NaN);
    });

    it("has a validator for numbers", function () {
      expect(typeFilter.validator(123)).toBe(true);
      expect(typeFilter.validator(0.001)).toBe(true);
      expect(typeFilter.validator(1.0)).toBe(true);
      expect(typeFilter.validator(parseInt("bla"))).toBe(false);
      expect(typeFilter.validator({})).toBe(false);
      expect(typeFilter.validator("A string")).toBe(false);
    });

    it("has a post processor which returns the same value", function () {
      var testValue = 12.1;
      var testValuePost = 12.1;
      expect(typeFilter.postProcessor(testValue)).toEqual(testValuePost);
    });
  });

  describe("of type Percent", function () {
    var typeFilter = FilterTypes.percent;
    var typeMatchers = typeFilter.matchers.sort();

    it("has matchers which are defined in the Matchers list", function () {
      expect(_.intersection(typeMatchers, _.keys(Matchers)).length).toEqual(typeMatchers.length);
    });

    it("supports 'greater than', 'greater than or equals', 'lower than', " +
      "'lower than or equals', 'between', 'equals' and 'does not equal'", function(){
      expect(typeMatchers).toEqual(["bt", "eq", "gt", "gte", "lt", "lte", "nbt", "neq"]);
    });

    it("has a parser which parses the value as a float", function () {
      expect(typeFilter.parser(1)).toEqual(1.0);
      expect(typeFilter.parser(0)).toEqual(0);
      expect(typeFilter.parser("0.1")).toEqual(0.1);
      expect(typeFilter.parser("999")).toEqual(999);
      expect(typeFilter.parser("bla")).toEqual(NaN);
    });

    it("has a validator for percent values 0 <= x <= 100", function () {
      // Numerical values
      expect(typeFilter.validator(0)).toBe(true);
      expect(typeFilter.validator(100)).toBe(true);
      expect(typeFilter.validator(50)).toBe(true);
      expect(typeFilter.validator(-1)).toBe(false);
      expect(typeFilter.validator(101)).toBe(false);

      // Other values
      expect(typeFilter.validator(parseInt("bla"))).toBe(false);
      expect(typeFilter.validator({})).toBe(false);
      expect(typeFilter.validator("A string")).toBe(false);
    });

    it("has a post processor which divides the value by 100 to change the range to 0 <= x <= 1", function () {
      expect(typeFilter.postProcessor(100)).toEqual(1);
      expect(typeFilter.postProcessor(0)).toEqual(0);
      expect(typeFilter.postProcessor(50)).toEqual(0.5);
      expect(typeFilter.postProcessor(1)).toEqual(0.01);
    });
  });

  describe("of type Boolean", function () {
    var typeFilter = FilterTypes.boolean;
    var typeMatchers = typeFilter.matchers;

    it("has matchers which are defined in the Matchers list", function () {
      expect(_.intersection(typeMatchers, _.keys(Matchers)).length).toEqual(typeMatchers.length);
    });

    it("supports 'equals' and 'does not equal'", function(){
      expect(typeMatchers).toEqual(["eq", "neq"]);
    });

    it("has a parser which parses values to true or false", function () {
      expect(typeFilter.parser(true)).toEqual(true);
      expect(typeFilter.parser(false)).toEqual(false);
      expect(typeFilter.parser(0)).toEqual(false);
      expect(typeFilter.parser(1)).toEqual(true);
      expect(typeFilter.parser("")).toEqual(false);
      expect(typeFilter.parser("non-empty string")).toEqual(true);
    });

    it("has a validator for boolean values", function () {
      expect(typeFilter.validator(true)).toBe(true);
      expect(typeFilter.validator(false)).toBe(true);

      expect(typeFilter.validator(123)).toBe(false);
      expect(typeFilter.validator(parseInt("bla"))).toBe(false);
      expect(typeFilter.validator({})).toBe(false);
      expect(typeFilter.validator("A string")).toBe(false);
    });

    it("has a post processor which returns the same value", function () {
      expect(typeFilter.postProcessor(true)).toEqual(true);
      expect(typeFilter.postProcessor(false)).toEqual(false);
    });
  });
});
