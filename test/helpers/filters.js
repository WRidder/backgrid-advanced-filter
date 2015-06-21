"use strict";

// Filters definition
var filters = {
  "1": {
    "name": "First filter",
    "filters": [
      {
        "column": "test",

      }
    ]
  }
};

window.filtersHelper = {
  "filters": filters
};

if (window.wallabyEnv) {
  module.exports = window.filtersHelper;
}
