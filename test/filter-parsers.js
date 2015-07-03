/* global Backgrid */
"use strict";
if (window.wallabyEnv) {
  require("../src/main");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Mongo filter parser", function () {
  var mongoParser;
  var simpleParser;
  beforeEach(function() {
    // Create parser
    mongoParser = new AdvancedFilter.FilterParsers.MongoParser();
    simpleParser = new AdvancedFilter.FilterParsers.SimpleParser();
  });

  var textFilter = new AdvancedFilter.FilterModel({
    name: "Test filter #1",
    attributeFilters: [
      {
        column: "name",
        type: "string",
        matcher: "sw",
        value: "James",
        valid: true
      },
      {
        column: "name",
        type: "string",
        matcher: "ew",
        value: "Root",
        valid: true
      },
      {
        column: "name",
        type: "string",
        matcher: "ct",
        value: "William",
        valid: true
      },
      {
        column: "name",
        type: "string",
        matcher: "eq",
        value: "James William Root",
        valid: true
      },
      {
        column: "name",
        type: "string",
        matcher: "neq",
        value: "Corey Tailor",
        valid: true
      }
    ]
  });

  var numberFilter = new AdvancedFilter.FilterModel({
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

  var percentFilter = new AdvancedFilter.FilterModel({
    name: "Test filter #3",
    attributeFilters: [
      {
        column: "pctActive",
        type: "percent",
        matcher: "gt",
        value: 5,
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "gte",
        value: 10,
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "lt",
        value: 50,
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "lte",
        value: 40,
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "bt",
        value: [25, 45],
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "nbt",
        value: [33, 66],
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "eq",
        value: 30,
        valid: true
      },
      {
        column: "pctActive",
        type: "percent",
        matcher: "neq",
        value: 20,
        valid: true
      }
    ]
  });

  // Create filter
  var booleanFilter = new AdvancedFilter.FilterModel({
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

  // Create filter
  var emptyFilter = new AdvancedFilter.FilterModel({
    name: "Test filter #1"
  });

  it("creates a MongoDB query style json object when parsing a filter model", function() {
    describe("for text type attribute filters", function() {
      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(textFilter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          // Starts with
          {
            "name": {
              "$regex": "(?i)^James"
            }
          },

          // Ends with
          {
            "name": {
              "$regex": "(?i)Root$"
            }
          },

          // Contains
          {
            "name": {
              "$regex": "(?i)William"
            }
          },

          // Equals
          {
            "name": {
              "$eq": "James William Root"
            }
          },

          // Does not equal
          {
            "name": {
              "$ne": "Corey Tailor"
            }
          }
        ]
      });
    });

    describe("for number type attribute filters", function() {

      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(numberFilter);

      // Compare results
      expect(mongoStyleFilter).toEqual({
        "$and": [
          // Greater than
          {
            "age": {
              "$gt": 5
            }
          },

          // Greater than or equal
          {
            "age": {
              "$gte": 10
            }
          },

          // Lower than
          {
            "age": {
              "$lt": 50
            }
          },

          // Lower than or equal
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
            "$or": [
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

          // Does not equal
          {
            "age": {
              "$ne": 20
            }
          }
        ]
      });
    });

    describe("for percent type attribute filters", function() {
      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(percentFilter);

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
            "$or": [
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
              "$ne": 0.20
            }
          }
        ]
      });
    });

    describe("for boolean type attribute filters", function() {
      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(booleanFilter);

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
              "$ne": false
            }
          }
        ]
      });
    });

    describe("for empty attribute filters", function() {
      // Parse the filter
      var mongoStyleFilter = mongoParser.parse(emptyFilter);

      // Compare results
      expect(mongoStyleFilter).toEqual({});
    });
  });

  it("creates a Simple query style json object when parsing a filter model", function() {
    describe("for text type attribute filters", function() {
      // Parse the filter
      var simpleStyleFilter = simpleParser.parse(textFilter);

      // Compare results
      expect(simpleStyleFilter).toEqual([
          // Starts with
          {
            column: "name",
            matcher: {
              type: "regex",
              value: "^James"
            }
          },

          // Ends with
          {
            column: "name",
            matcher: {
              type: "regex",
              value: "Root$"
            }
          },

          // Contains
          {
            column: "name",
            matcher: {
              type: "regex",
              value: "William"
            }
          },

          // Equals
          {
            column: "name",
            matcher: {
              type: "eq",
              value: "James William Root"
            }
          },

          // Does not equal
          {
            column: "name",
            matcher: {
              type: "neq",
              value: "Corey Tailor"
            }
          }
      ]);
    });

    describe("for number type attribute filters", function() {
      // Parse the filter
      var simpleStyleFilter = simpleParser.parse(numberFilter);

      // Compare results
      expect(simpleStyleFilter).toEqual([
        // Greater than
        {
          column: "age",
          matcher: {
            type: "gt",
            value: 5
          }
        },

        // Greater than or equal
        {
          column: "age",
          matcher: {
            type: "gte",
            value: 10
          }
        },

        // Lower than
        {
          column: "age",
          matcher: {
            type: "lt",
            value: 50
          }
        },

        // Lower than or equal
        {
          column: "age",
          matcher: {
            type: "lte",
            value: 40
          }
        },

        // Between
        {
          column: "age",
          matcher: {
            type: "bt",
            value: [25, 45]
          }
        },

        // Outside
        {
          column: "age",
          matcher: {
            type: "nbt",
            value: [33, 66]
          }
        },

        // Equals
        {
          column: "age",
          matcher: {
            type: "eq",
            value: 30
          }
        },

        // Does not equal
        {
          column: "age",
          matcher: {
            type: "neq",
            value: 20
          }
        }
      ]);
    });

    describe("for percent type attribute filters", function() {
      // Parse the filter
      var simpleStyleFilter = simpleParser.parse(percentFilter);

      // Compare results
      expect(simpleStyleFilter).toEqual([
        {
          column: "pctActive",
          matcher: {
            type: "gt",
            value: 0.05
          }
        },
        {
          column: "pctActive",
          matcher: {
            type: "gte",
            value: 0.10
          }
        },
        {
          column: "pctActive",
          matcher: {
            type: "lt",
            value: 0.50
          }
        },
        {
          column: "pctActive",
          matcher: {
            type: "lte",
            value: 0.40
          }
        },
        // Between
        {
          column: "pctActive",
          matcher: {
            type: "bt",
            value: [0.25, 0.45]
          }
        },
        // Outside
        {
          column: "pctActive",
          matcher: {
            type: "nbt",
            value: [0.33, 0.66]
          }
        },
        // Equals
        {
          column: "pctActive",
          matcher: {
            type: "eq",
            value: 0.30
          }
        },

        // Not equal
        {
          column: "pctActive",
          matcher: {
            type: "neq",
            value: 0.20
          }
        }
      ]);
    });

    describe("for text type attribute filters", function() {
      // Parse the filter
      var simpleStyleFilter = simpleParser.parse(booleanFilter);

      // Compare results
      expect(simpleStyleFilter).toEqual([
        {
          column: "isMarried",
          matcher: {
            type: "eq",
            value: true
          }
        },
        {
          column: "isChild",
          matcher: {
            type: "neq",
            value: false
          }
        }
      ]);
    });
  });
});
