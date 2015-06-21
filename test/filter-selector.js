/* global $ Backgrid Backbone*/
"use strict";

if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");

  // Helper functions
  var dataHelper = require("./helpers/data.js");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Selector - LabelView", function () {
  describe("on initialization", function () {
    it("throws an error when no filter state model is provided", function () {
      var createNewLabelView = function () {
        return new AdvancedFilter.SubComponents.LabelView();
      };

      expect(createNewLabelView).toThrowError(Error, "No (valid) filter state model provided");
    });
  });

  describe("when initialized", function () {
    var lv;
    beforeEach(function () {
      var LabelView = AdvancedFilter.Selector.prototype.defaults.LabelComponent;
      var dataCollection = new Backbone.Collection(dataHelper.data);

      // Create state model
      var stateModel = new AdvancedFilter.FilterStateModel({
        dataCollection: dataCollection
      });

      // Add callback spies
      spyOn(LabelView.prototype, "labelClick").and.callThrough();
      spyOn(LabelView.prototype, "removeClick").and.callThrough();

      // Create selector
      lv = new LabelView({
        filterStateModel: stateModel
      }).render();
      $(document.body).append(lv.$el);
    });

    afterEach(function () {
      lv.remove();
      lv = null;
    });

    it("triggers an event filter:new when clicked", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      lv.filterStateModel.on("filter:new", triggerSpy);

      // Simulate click
      lv.$el.click();

      expect(lv.labelClick).toHaveBeenCalled();
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
    });

    it("triggers an event new:filter when clicked", function () {
      // Set model data
      lv.filterStateModel.set("filterCollection", new Backbone.Collection());
      lv.filterStateModel.get("filterCollection").add({
        id: 1
      });
      lv.filterStateModel.set("activeFilterId", 1, {silent: true});
      lv.render();

      var triggerSpy = jasmine.createSpy("triggerSpy");
      lv.filterStateModel.on("change:activeFilterId", triggerSpy);

      var triggerNewFilterSpy = jasmine.createSpy("triggerNewFilterSpy");
      lv.on("new:filter", triggerNewFilterSpy);

      // Simulate click
      lv.$el.find(".remove-filter").click();

      expect(lv.removeClick).toHaveBeenCalled();
      expect(lv.labelClick).not.toHaveBeenCalled();
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerNewFilterSpy).not.toHaveBeenCalled();
    });
  });
});

describe("A Backgrid.AdvancedFilter Selector", function () {
  describe("on initialization", function () {
    it("throws an error when no data collection is provided", function () {
      var createNewSelector = function () {
        return new AdvancedFilter.Selector();
      };

      expect(createNewSelector).toThrowError(Error, "No (valid) filter state model provided");
    });
  });

  describe("when initialized", function () {
    var sel;
    beforeEach(function () {
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
      sel = new AdvancedFilter.Selector({
        filterStateModel: stateModel
      }).render();
      $(document.body).append(sel.$el);
    });

    afterEach(function () {
      if (sel.$el) {
        sel.remove();
      }
      sel = null;
    });

    it("creates an components object", function () {
    expect(sel.components).toBeTruthy();
  });

    it("renders a container with three subdivs", function () {
      expect($(".advancedfilter-selector > div").length).toBe(3);
      expect($(".filter-dropdown").length).toBe(1);
      expect($(".filter-label").length).toBe(1);
      expect($(".filter-search").length).toBe(1);

      expect(sel.ui.$dropdown.length).toBe(1);
      expect(sel.ui.$label.length).toBe(1);
      expect(sel.ui.$search.length).toBe(1);
    });

    it("adds the backgrid-filter component", function () {
      expect($(".advancedfilter-selector form.backgrid-filter").length).toBe(1);
    });

    it("removes the content of it's element on remove", function () {
      sel.remove();
      expect($(".advancedfilter-selector").length).toBe(0);
    });

    describe("the label component", function () {
      it("updates the title when an active filter updates the name", function() {
        var filterModel = sel.filterStateModel.get("filterCollection")
          .get(sel.filterStateModel.get("activeFilterId"));
        expect(sel.$el.find("span.remove").text().trim()).toEqual("Test filter");

        // Update name
        filterModel.set("name", "New name");
        expect(sel.$el.find("span.remove").text().trim()).toEqual("New name");
      });
    });
  });
});
