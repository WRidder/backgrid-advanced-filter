/* global $ Backgrid Backbone*/
"use strict";

if (window.wallabyEnv) {
  require("../src/main");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Main", function () {
  describe("on initialize", function() {
    it("throws an error if no data collection is defined", function() {
      var createMain = function () {
        return new AdvancedFilter.Main();
      };

      expect(createMain).toThrowError(Error, "AdvancedFilter: data collection is required.");
    });

    it("throws an error if no column collection is defined", function() {
      var createMain = function () {
        return new AdvancedFilter.Main({
          collection: new Backbone.Collection()
        });
      };

      expect(createMain).toThrowError(Error, "AdvancedFilter: columns are required.");
    });

    it("creates a new filter collection if none is provided", function() {
      var main = new AdvancedFilter.Main({
        collection: new Backbone.Collection(),
        columns: new Backgrid.Columns()
      });

      expect(main.options.filters instanceof AdvancedFilter.FilterCollection).toBe(true);
      expect(main.options.filters.length).toEqual(0);
    });

    it("binds to filter state events", function() {
      spyOn(AdvancedFilter.Main.prototype, "bindFilterStateEvents").and.callThrough();
      var main = new AdvancedFilter.Main({
        collection: new Backbone.Collection(),
        columns: new Backgrid.Columns()
      });

      expect(main.bindFilterStateEvents).toHaveBeenCalled();
      expect(main.bindFilterStateEvents.calls.count()).toEqual(1);
    });

    it("sets an active filter if valid and provided", function() {
      var filters = new AdvancedFilter.FilterCollection();
      filters.createNewFilter();
      var activeFilter = filters.createNewFilter();

      var main = new AdvancedFilter.Main({
        collection: new Backbone.Collection(),
        columns: new Backgrid.Columns(),
        filters: filters,
        activeFilterId: activeFilter.cid
      });

      expect(main.filterStateModel.get("activeFilterId")).toEqual(activeFilter.cid);
    });

    it("doesn't set an active filter if provided but invalid", function() {
      var filters = new AdvancedFilter.FilterCollection();
      filters.createNewFilter();

      var main = new AdvancedFilter.Main({
        collection: new Backbone.Collection(),
        columns: new Backgrid.Columns(),
        filters: filters,
        activeFilterId: "dd"
      });

      expect(main.filterStateModel.get("activeFilterId")).toEqual(null);
    });
  });

  describe("when initialized", function() {
    var main;
    beforeEach(function() {
      spyOn(AdvancedFilter.Main.prototype, "evtNewFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtSaveFilter").and.callThrough();
      //spyOn(AdvancedFilter.Main.prototype, "evtChangeFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtApplyFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtResetFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtCancelFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtRemoveFilter").and.callThrough();
      spyOn(AdvancedFilter.Main.prototype, "evtCloseFilter").and.callThrough();

      var filters = new AdvancedFilter.FilterCollection([
        {
          name: "Test filter",
          attributeFilters: [
            {
              column: "testcol",
              type: "string",
              matcher: "eq",
              value: "someValue"
            },
            {
              column: "testcol1",
              type: "string",
              matcher: "eq",
              value: "thisValue"
            }
          ]
        },
        {
          name: "Test filter",
          attributeFilters: {
            column: "testcol",
            type: "string",
            matcher: "eq",
            value: "someValue"
          }
        }
      ]);

      var columns = new Backgrid.Columns([
        {
          name: "nameCol",
          label: "Name",
          cell: "string",
          filterType: "string"
        },
        {
          name: "numberCol",
          label: "Number",
          cell: "number",
          filterType: "number"
        },
        {
          name: "intCol",
          label: "Integer",
          cell: "integer",
          filterType: "integer"
        },
        {
          name: "pctCol",
          label: "Percent",
          cell: "percent",
          filterType: "percent"
        },
        {
          name: "boolCol",
          label: "Boolean",
          cell: "boolean",
          filterType: "boolean"
        }
      ]);

      main = new AdvancedFilter.Main({
        collection: new Backbone.Collection(),
        columns: columns,
        filters: filters,
        activeFilterId: filters.first().cid
      }).render();
    });

    afterEach(function() {
      if (main) {
        main.remove();
        main = null;
      }
    });

    it("binds to the filter:new event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:new", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:new");
      expect(main.evtNewFilter).toHaveBeenCalled();
      expect(main.evtNewFilter.calls.count()).toEqual(1);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });

    it("binds to the filter:save event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:save", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:save");
      expect(main.evtSaveFilter).toHaveBeenCalled();
      expect(main.evtSaveFilter.calls.count()).toEqual(1);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });

    it("binds to the filter:apply event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:apply", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:apply");
      expect(main.evtApplyFilter).toHaveBeenCalled();
      expect(main.evtApplyFilter.calls.count()).toEqual(1);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });

    it("binds to the filter:close event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:close", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:close");
      expect(main.evtCloseFilter).toHaveBeenCalled();
      expect(main.evtCloseFilter.calls.count()).toEqual(1);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });

/*    it("binds to the filter:change event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:change", triggerSpy);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);
      var attributeFilter = filter.get("attributeFilters").first();

      // Update attribute filter
      attributeFilter.set("column", "anothercolumn")

      expect(main.evtChangeFilter).toHaveBeenCalled();
      expect(main.evtChangeFilter.calls.count()).toEqual(1);
      console.log("halp!");
      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });*/

    it("binds to the filter:reset event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:reset", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:reset");
      expect(main.evtResetFilter).toHaveBeenCalled();
      expect(main.evtResetFilter.calls.count()).toEqual(1);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filter = main.filterStateModel.get("filterCollection").get(filterId);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filter
      );
    });

    it("binds to the filter:cancel event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:cancel", triggerSpy);

      // Trigger event
      main.filterStateModel.trigger("filter:cancel");
      expect(main.evtCancelFilter).toHaveBeenCalled();
      expect(main.evtCancelFilter.calls.count()).toEqual(1);

      // Get filter
      var filter = main.filterStateModel.getActiveFilter();
      var stateBeforeCancel = {
        name: filter.get("name"),
        attributeFilters: filter.get("attributeFilters").toJSON()
      };

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filter.cid,
        filter,
        stateBeforeCancel
      );

      filter.get("attributeFilters").reset([]);

      main.filterStateModel.trigger("filter:cancel");
      var currentState1 = {
        name: filter.get("name"),
        attributeFilters: []
      };

      expect(triggerSpy).toHaveBeenCalledWith(
        filter.cid,
        filter,
        currentState1
      );
    });

    it("binds to the filter:remove event on the filter state model", function () {
      var triggerSpy = jasmine.createSpy("triggerSpy");
      main.on("filter:remove", triggerSpy);

      // Get filter
      var filterId = main.filterStateModel.get("activeFilterId");
      var filterName = main.filterStateModel.get("filterCollection").get(filterId).get("name");

      // Trigger event
      main.filterStateModel.trigger("filter:remove");

      expect(main.evtRemoveFilter).toHaveBeenCalled();
      expect(main.evtRemoveFilter.calls.count()).toEqual(1);
      expect(main.filterStateModel.get("filterCollection").length).toEqual(1);

      // Check if events are triggered on the main component
      expect(triggerSpy).toHaveBeenCalled();
      expect(triggerSpy.calls.count()).toEqual(1);
      expect(triggerSpy).toHaveBeenCalledWith(
        filterId,
        filterName
      );
    });

    it("invokes the sub plugins on render", function () {
      $(document.body).append(main.$el);
      expect($(".advancedfilter-selector").length).toBe(1);
      expect($(".advancedfilter-editor").length).toBe(1);
      expect($(".advancedfilter-saver").length).toBe(1);
    });

    it("cleans up on remove", function () {
      $(document.body).append(main.$el);
      expect($(".advancedfilter-selector").length).toBe(1);
      expect($(".advancedfilter-editor").length).toBe(1);
      expect($(".advancedfilter-saver").length).toBe(1);
      expect($(".advancedfilter").length).toBe(1);

      // Remove grid
      main.remove();
      main = null;

      // Check if everything is gone
      expect($(".advancedfilter-selector").length).toBe(0);
      expect($(".advancedfilter-editor").length).toBe(0);
      expect($(".advancedfilter-saver").length).toBe(0);
      expect($(".advancedfilter").length).toBe(0);
    });
  });
});
