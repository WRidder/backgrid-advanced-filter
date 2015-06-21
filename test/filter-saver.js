/* global $ Backgrid Backbone */
"use strict";

if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");

  // Helper functions
  var dataHelper = require("./helpers/data.js");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Save component", function () {
  describe("when initialized", function () {
    var sc;
    beforeEach(function () {
      var Saver = AdvancedFilter.Saver;
      var dataCollection = new Backbone.Collection(dataHelper.data);
      var filterCollection = new AdvancedFilter.FilterCollection({
        name: "Test filter",
        filter: new AdvancedFilter.AttributeFilterCollection()
      });

      // Create state model
      var stateModel = new AdvancedFilter.FilterStateModel({
        dataCollection: dataCollection,
        columnCollection: new Backgrid.Columns(),
        filterCollection: filterCollection,
        activeFilterId: filterCollection.first().cid
      });

      // Spies
      spyOn(Saver.prototype, "resetFilter").and.callThrough();
      spyOn(Saver.prototype, "saveFilter").and.callThrough();
      spyOn(Saver.prototype, "cancelFilter").and.callThrough();
      spyOn(Saver.prototype, "removeFilter").and.callThrough();

      // Create selector
      sc = new Saver({
        filterStateModel: stateModel
      }).render();
      $(document.body).append(sc.$el);
    });

    afterEach(function () {
      sc.remove();
      sc = null;
    });

    it("creates a container with an input and three buttons", function () {
      expect($(".advancedfilter-saver-input").length).toBe(1);
      expect($(".advancedfilter-saver-buttons").length).toBe(1);
      expect($(".advancedfilter-saver-buttons > button").length).toBe(4);
    });

    it("hides when no active filter is present", function () {
      sc.filterStateModel.set("activeFilterId", null);

      expect($(".advancedfilter-saver").length).toBe(1);
      expect($(".advancedfilter-saver-input").length).toBe(0);
      expect($(".advancedfilter-saver-buttons").length).toBe(0);
      expect($(".advancedfilter-saver-buttons > button").length).toBe(0);
    });

    it("listens to click events on the buttons", function () {
      $(".advancedfilter-saver-buttons > button.reset").click();
      $(".advancedfilter-saver-buttons > button.cancel").click();
      $(".advancedfilter-saver-buttons > button.save").click();
      $(".advancedfilter-saver-buttons > button.remove").click();

      expect(sc.resetFilter).toHaveBeenCalled();
      expect(sc.resetFilter.calls.count()).toEqual(1);
      expect(sc.saveFilter).toHaveBeenCalled();
      expect(sc.saveFilter.calls.count()).toEqual(1);
      expect(sc.cancelFilter).toHaveBeenCalled();
      expect(sc.cancelFilter.calls.count()).toEqual(1);
      expect(sc.removeFilter).toHaveBeenCalled();
      expect(sc.removeFilter.calls.count()).toEqual(1);
    });

    it("updates the name of the current filter on save", function() {
      var activeFilter = sc.filterStateModel.get("filterCollection").first();
      expect(activeFilter.get("name")).toEqual("Test filter");

      var $filterNameInput = $(".advancedfilter-saver input");

      // Set new filter name
      $filterNameInput.val("Updated filter name");

      // Save filter
      $(".advancedfilter-saver-buttons > button.save").click();
      expect(activeFilter.get("name")).toEqual("Updated filter name");
    });

    it("doesn't update the name of the current filter on save for empty input", function() {
      var activeFilter = sc.filterStateModel.get("filterCollection").first();
      expect(activeFilter.get("name")).toEqual("Test filter");

      var $filterNameInput = $(".advancedfilter-saver input");

      // Set new filter name
      $filterNameInput.val("");

      // Save filter
      $(".advancedfilter-saver-buttons > button.save").click();
      expect(activeFilter.get("name")).toEqual("Test filter");
      expect($filterNameInput.val()).toEqual("Test filter");
    });
  });
});
