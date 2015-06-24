/* global $ Backgrid Backbone*/
"use strict";

if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");

  // Helper functions
  var dataHelper = require("./helpers/data.js");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Editor", function () {
  it("throws an error when no filter state model is provided", function () {
    var createNewEditor = function () {
      return new AdvancedFilter.Editor();
    };

    expect(createNewEditor).toThrowError(Error, "No (valid) filter state model provided");
  });

  describe("when initialized", function() {
    var ed;
    beforeEach(function () {
      var dataCollection = new Backbone.Collection(dataHelper.data);

      var filters = new AdvancedFilter.FilterCollection({
        name: "Test filter",
        filters: new AdvancedFilter.AttributeFilterCollection()
      });

      // Create state model
      var stateModel = new AdvancedFilter.FilterStateModel({
        dataCollection: dataCollection,
        columnCollection: new Backgrid.Columns(),
        filterCollection: filters,
        activeFilterId: filters.first().cid
      });

      // Create selector
      ed = new AdvancedFilter.Editor({
        filterStateModel: stateModel
      }).render();
      $(document.body).append(ed.$el);
    });

    afterEach(function () {
      ed.remove();
      ed = null;
    });

    it("adds a filter container", function() {
      expect($(".advancedfilter-editor").length).toBe(1);
    });

    it("shows an 'add filter' button if attribute filter collection is empty", function() {
      expect($(".advancedfilter-editor > div > button.new-attribute-filter").length).toBe(1);
    });

    it("shows a filter when the 'add filter' button is clicked", function() {
      // Add filter
      $("button.new-attribute-filter").first().click();

      // Add filter button should be gone now
      expect($(".advancedfilter-editor > div > button.new-attribute-filter").length).toBe(0);
    });
  });
});
