/* global Backgrid _ */
"use strict";
if (window.wallabyEnv) {
  require("../src/main");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Mongo filter parser", function () {
  var mongoParser;
  beforeEach(function() {
    // Create parser
    mongoParser = new AdvancedFilter.FilterParsers.MongoParser();
  });

  it("creates a mongo style json object when parsing a filter model", function() {
    describe("for text type attribute filters", function() {
      // Create filter
      var filter = new AdvancedFilter.FilterModel({
        name: "Test filter #1",
        attributeFilters: [
          {
            column: "name",
            type: "text",
            matcher: "sw",
            value: "James",
            valid: true
          },
          {
            column: "name",
            type: "text",
            matcher: "ew",
            value: "Root",
            valid: true
          },
          {
            column: "name",
            type: "text",
            matcher: "ct",
            value: "William",
            valid: true
          },
          {
            column: "name",
            type: "text",
            matcher: "eq",
            value: "James William Root",
            valid: true
          },
          {
            column: "name",
            type: "text",
            matcher: "neq",
            value: "Corey Tailor",
            valid: true
          }
        ]
      });

      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(filter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          {
            "name": /^James/
          },
          {
            "name": /Root$/
          },
          {
            "name": /William/
          },
          {
            "name": {
              "$eq": "James William Root"
            }
          },
          {
            "name": {
              "$neq": "Corey Tailor"
            }
          }
        ]
      });
    });

    describe("for number type attribute filters", function() {
      // Create filter
      var filter = new AdvancedFilter.FilterModel({
        name: "Test filter #1",
        attributeFilters: [
          {
            column: "age",
            type: "number",
            matcher: "gt",
            value: 5,
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "gte",
            value: 10,
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "lt",
            value: 50,
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "lte",
            value: 40,
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "bt",
            value: [25, 45],
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "nbt",
            value: [33, 66],
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "eq",
            value: 30,
            valid: true
          },
          {
            column: "age",
            type: "number",
            matcher: "neq",
            value: 20,
            valid: true
          }
        ]
      });

      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(filter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          {
            "age": {
              "$gt": 5
            }
          },
          {
            "age": {
              "$gte": 10
            }
          },
          {
            "age": {
              "$lt": 50
            }
          },
          {
            "age": {
              "$lte": 40
            }
          },
          // Between
          {
            "$and": [
              {
                "age": {
                  "$gte": 25
                }
              },
              {
                "age": {
                  "$lte": 45
                }
              }
            ]
          },
          // Outside
          {
            "$and": [
              {
                "age": {
                  "$lt": 33
                }
              },
              {
                "age": {
                  "$gt": 66
                }
              }
            ]
          },
          // Equals
          {
            "age": {
              "$eq": 30
            }
          },

          // Not equal
          {
            "age": {
              "$neq": 20
            }
          }
        ]
      });
    });

    describe("for percent type attribute filters", function() {
      // Create filter
      var filter = new AdvancedFilter.FilterModel({
        name: "Test filter #3",
        attributeFilters: [
          {
            column: "pctActive",
            type: "percent",
            matcher: "gt",
            value: 0.05,
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "gte",
            value: 0.1,
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "lt",
            value: 0.5,
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "lte",
            value: 0.4,
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "bt",
            value: [0.25, 0.45],
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "nbt",
            value: [0.33, 0.66],
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "eq",
            value: 0.30,
            valid: true
          },
          {
            column: "pctActive",
            type: "percent",
            matcher: "neq",
            value: 0.20,
            valid: true
          }
        ]
      });

      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(filter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          {
            "pctActive": {
              "$gt": 0.05
            }
          },
          {
            "pctActive": {
              "$gte": 0.10
            }
          },
          {
            "pctActive": {
              "$lt": 0.50
            }
          },
          {
            "pctActive": {
              "$lte": 0.40
            }
          },
          // Between
          {
            "$and": [
              {
                "pctActive": {
                  "$gte": 0.25
                }
              },
              {
                "pctActive": {
                  "$lte": 0.45
                }
              }
            ]
          },
          // Outside
          {
            "$and": [
              {
                "pctActive": {
                  "$lt": 0.33
                }
              },
              {
                "pctActive": {
                  "$gt": 0.66
                }
              }
            ]
          },
          // Equals
          {
            "pctActive": {
              "$eq": 0.30
            }
          },

          // Not equal
          {
            "pctActive": {
              "$neq": 0.20
            }
          }
        ]
      });
    });

    describe("for text type attribute filters", function() {
      // Create filter
      var filter = new AdvancedFilter.FilterModel({
        name: "Test filter #1",
        attributeFilters: [
          {
            column: "isMarried",
            type: "boolean",
            matcher: "eq",
            value: true,
            valid: true
          },
          {
            column: "isChild",
            type: "boolean",
            matcher: "neq",
            value: false,
            valid: true
          }
        ]
      });

      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(filter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          {
            "isMarried": {
              "$eq": true
            }
          },
          {
            "isChild": {
              "$neq": false
            }
          }
        ]
      });
    });
  });
});
