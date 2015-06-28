/* global $ Backgrid Backbone*/
"use strict";

if (window.wallabyEnv) {
  require("../src/main");

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
      spyOn(AdvancedFilter.Editor.prototype, "render").and.callThrough();

      var dataCollection = new Backbone.Collection(dataHelper.data);

      var filters = new AdvancedFilter.FilterCollection({
        name: "Test filter",
        attributeFilters: new AdvancedFilter.AttributeFilterCollection()
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
      expect($(".advancedfilter-editor > button.new-attribute-filter").length).toBe(1);
    });

    it("shows a filter when the 'add filter' button is clicked", function() {
      // Add filter
      $("button.new-attribute-filter").first().click();

      // Add filter button should be gone now
      expect($(".advancedfilter-editor > button.new-attribute-filter").length).toBe(0);
    });

    it("re-renders the editor once if a new attribute filter is added", function() {
      var fsm = ed.filterStateModel;
      var filterId = fsm.get("activeFilterId");
      var activeFilter = fsm.get("filterCollection").get(filterId);

      ed.render.calls.reset();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").createNewAttributeFilter();

      expect(ed.render).toHaveBeenCalled();
      expect(ed.render.calls.count()).toEqual(5);
    });

    it("adds a 'valid' class to an attribute filter if it's valid", function() {
      var fsm = ed.filterStateModel;
      var filterId = fsm.get("activeFilterId");
      var activeFilter = fsm.get("filterCollection").get(filterId);

      ed.render.calls.reset();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").first().set({
        "columnName": "cname",
        "type": "string",
        "matcher": "eq",
        "value": "someValue"
      });

      expect(ed.render).toHaveBeenCalled();
      expect(ed.render.calls.count()).toEqual(1);

      ed.render.calls.reset();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").first().set({
        "columnName": "cname",
        "type": "integer",
        "matcher": "bt",
        "value": [10, 12]
      });

      expect(ed.render).toHaveBeenCalled();
      expect(ed.render.calls.count()).toEqual(1);

      ed.render.calls.reset();
      activeFilter.get("attributeFilters").createNewAttributeFilter();
      activeFilter.get("attributeFilters").first().set({
        "columnName": "cname",
        "type": "boolean",
        "matcher": "eq",
        "value": true
      });

      expect(ed.render).toHaveBeenCalled();
      expect(ed.render.calls.count()).toEqual(1);
    });
  });
});
