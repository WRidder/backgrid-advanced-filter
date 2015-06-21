/* global $ Backgrid Backbone*/
"use strict";

if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");

  // Helper functions
  var dataHelper = require("./helpers/data.js");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Filter Dropdown", function () {
  describe("on initialization", function () {
    it("throws an error when no filter state model is provided", function () {
      var createNewFilterDropdown = function () {
        return new AdvancedFilter.SubComponents.FilterDropdown();
      };

      expect(createNewFilterDropdown).toThrowError(Error, "No (valid) filter state model provided");
    });
  });

  describe("when initialized", function () {
    var dd;
    beforeEach(function () {
      var dataCollection = new Backbone.Collection(dataHelper.data);

      // Create state model
      var stateModel = new AdvancedFilter.FilterStateModel({
        dataCollection: dataCollection,
        columnCollection: new Backgrid.Columns(),
        filterCollection: new AdvancedFilter.FilterCollection({
          name: "testFilter",
          filter: new AdvancedFilter.AttributeFilterCollection()
        })
      });

      // Create selector
      dd = new AdvancedFilter.SubComponents.FilterDropdown({
        filterStateModel: stateModel
      }).render();
      $(document.body).append(dd.$el);
    });

    afterEach(function () {
      if (dd.$el) {
        dd.remove();
      }
      dd = null;
    });

    it("render a filter dropdown button", function () {
      expect($("button.dropdown-button").length).toBe(1);
    });

    it("is disabled when no filters are present", function() {
      dd.filterStateModel.get("filterCollection")
        .remove(dd.filterStateModel.get("filterCollection").first());

      expect($("button.dropdown-button[disabled=\"disabled\"]").length).toBe(1);
    });

    it("re-enables when a filter is added after empty", function() {
      dd.filterStateModel.get("filterCollection")
        .remove(dd.filterStateModel.get("filterCollection").first());

      expect($("button.dropdown-button[disabled=\"disabled\"]").length).toBe(1);

      dd.filterStateModel.get("filterCollection").add({
        name: "test-filter1",
        filter: new AdvancedFilter.AttributeFilterCollection()
      });
      expect($("button.dropdown-button[disabled=\"disabled\"]").length).toBe(0);

      dd.filterStateModel.get("filterCollection")
        .remove(dd.filterStateModel.get("filterCollection").first());

      expect($("button.dropdown-button[disabled=\"disabled\"]").length).toBe(1);
    });

    it("presents a dropdown with filters when clicked", function() {
      dd.filterStateModel.get("filterCollection").add({
        name: "test-filter2",
        filter: new AdvancedFilter.AttributeFilterCollection()
      });
      dd.filterStateModel.set("activeFilterId",
        dd.filterStateModel.get("filterCollection").first().cid);

      $("button.dropdown-button").click();
      expect($("button.dropdown-button[disabled=\"disabled\"]").length).toBe(0);
    });
  });
});
