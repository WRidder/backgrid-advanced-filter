"use strict";

// Column definition
var columns = [
  {
    "name": "name",
    "label": "Name",
    "cell": "string"
  },
  {
    "name": "pop",
    "label": "Population",
    "cell": "integer"
  },
  {
    "name": "percentage",
    "label": "% of World Population",
    "cell": "number"
  },
  {
    "name": "date",
    "label": "Date",
    "cell": "date"
  },
  {
    "name": "url",
    "label": "URL",
    "cell": "uri"
  }
];

window.columnsHelper = {
  "columns": columns
};

if (window.wallabyEnv) {
  module.exports = window.columnsHelper;
}
