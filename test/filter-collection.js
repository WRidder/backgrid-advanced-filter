/* global Backgrid _ Backbone */
"use strict";
if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Filter model", function () {
  var fm;
  beforeEach(function() {
    fm = new AdvancedFilter.FilterModel();
  });

  it("is an instance of Backbone.Model", function() {
    expect(fm instanceof Backbone.Model).toBe(true);
  });

  it("has three predefined attributes", function() {
    var modelKeys = _.keys(fm.attributes);
    modelKeys.sort();

    expect(modelKeys.length).toBe(2);
    expect(modelKeys).toEqual(["attributeFilters", "name"]);
  });

  it("has an empty attributeFilter collection when none is provided on init", function() {
    var newFM = new AdvancedFilter.FilterModel();
    var newAttrFilters = newFM.get("attributeFilters");
    expect(newAttrFilters instanceof Backgrid.Extension.AdvancedFilter.AttributeFilterCollection);
  });

  it("resets the model with resetFilter()", function() {
    fm.set("name", "Test filter 1");
    fm.set("attributeFilters", new AdvancedFilter.AttributeFilterCollection({
      column: "firstColumn",
      type: "text",
      settings: {
        matcher: "contains",
        value: "anything"
      }
    }));

    fm.resetFilter();
    expect(fm.toJSON().name).toEqual("Test filter 1");
    expect(fm.toJSON().attributeFilters.length).toEqual(0);
  });

  it("saves the model with saveFilter()", function() {
    fm.set("name", "Test filter 1");
    fm.set("attributeFilters", new AdvancedFilter.AttributeFilterCollection({
      column: "firstColumn",
      type: "text",
      settings: {
        matcher: "contains",
        value: "anything"
      }
    }));

    // Save current state
    fm.saveFilter();

    expect(fm.lastSavedState).toEqual({
      name: "Test filter 1",
      attributeFilters: [{
        column: "firstColumn",
        type: "text",
        settings: {
          matcher: "contains",
          value: "anything"
        }
      }]
    });
  });

  it("cancels edits and reverts to the last saved state to the model with cancelFilter()", function() {
    fm.set("name", "Test filter 1");
    fm.set("attributeFilters", new AdvancedFilter.AttributeFilterCollection({
      column: "firstColumn",
      type: "text",
      settings: {
        matcher: "contains",
        value: "anything"
      }
    }));

    // Save current state
    fm.saveFilter();

    expect(fm.lastSavedState).toEqual({
      name: "Test filter 1",
      attributeFilters: [{
        column: "firstColumn",
        type: "text",
        settings: {
          matcher: "contains",
          value: "anything"
        }
      }]
    });

    // Update filter
    fm.set("name", "Another name");
    fm.get("attributeFilters").first().set("column", "secondColumn");

    expect({
      name: fm.get("name"),
      attributeFilters: fm.get("attributeFilters").toJSON()
    }).toEqual({
      name: "Another name",
      attributeFilters: [{
        column: "secondColumn",
        type: "text",
        settings: {
          matcher: "contains",
          value: "anything"
        }
      }]
    });

    // Cancel edits
    fm.cancelFilter();

    // Check if reverted
    expect({
      name: fm.get("name"),
      attributeFilters: fm.get("attributeFilters").toJSON()
    }).toEqual({
      name: "Test filter 1",
      attributeFilters: [{
        column: "firstColumn",
        type: "text",
        settings: {
          matcher: "contains",
          value: "anything"
        }
      }]
    });
  });

  it("resets the model with resetFilter()", function() {
    fm.set("name", "Test filter 1");
    fm.set("attributeFilters", new AdvancedFilter.AttributeFilterCollection({
      column: "firstColumn",
      type: "text",
      settings: {
        matcher: "contains",
        value: "anything"
      }
    }));

    // Save current state
    fm.resetFilter();
    expect(fm.toJSON().name).toEqual("Test filter 1");
    expect(fm.toJSON().attributeFilters.length).toEqual(0);
  });
});

describe("A Backgrid.AdvancedFilter Filter collection", function () {
  var fc;
  beforeEach(function() {
    fc = new AdvancedFilter.FilterCollection();
  });

  it("is an instance of Backbone.Collection", function() {
    expect(fc instanceof Backbone.Collection).toBe(true);
  });

  it("uses a configurable partial for new filter names", function() {
    expect(fc.newFilterName.indexOf(fc.filterNamePartial)).toBeGreaterThan(-1);
  });

  it("creates a new filtername for a given count", function() {
    expect(fc.getNewFilterName(2)).toEqual("New Filter #2");

    // Set new filter hash and partial
    fc.newFilterName = "Test {nameCount}";
    fc.filterNamePartial = "{nameCount}";
    expect(fc.getNewFilterName(2)).toEqual("Test 2");
  });

  it("creates a new filter on request", function() {
    var newFilter = fc.createNewFilter();

    // Should be an instance of AdvancedFilter.FilterModel
    expect(newFilter instanceof AdvancedFilter.FilterModel).toBe(true);

    // Should have a correct name
    expect(newFilter.get("name")).toEqual("New Filter #1");

    // Should be part of the collection
    expect(fc.length).toEqual(1);
  });

  it("increments new filter count when creating multiple filters", function() {
    fc.createNewFilter();
    fc.createNewFilter();
    fc.createNewFilter();

    // Check if numbers have correctly been incremented
    expect(fc.last().get("name")).toEqual("New Filter #3");

    // Set last name to other name and check if filter is still correctly incremented
    fc.last().set("name", "New Filter #bla");

    fc.createNewFilter();
    expect(fc.last().get("name")).toEqual("New Filter #4");

    fc.createNewFilter();
    expect(fc.last().get("name")).toEqual("New Filter #5");
  });


  it("should not retain the state of a previously deleted model", function() {
    fc.createNewFilter();
    fc.createNewFilter();
    fc.createNewFilter();
    expect(fc.length).toBe(3);

    // Set filter values
    var lastFilter = fc.last();
    lastFilter.get("attributeFilters").add([
      {
      column: "testcol",
      type: "text",
      settings: {
        value: "test"
      }
    },
      {
        column: "testcol",
        type: "text",
        settings: {
          value: "test"
        }
      }
    ]);
    expect(lastFilter.get("attributeFilters").length).toBe(2);

    fc.remove(lastFilter);
    fc.createNewFilter();
    lastFilter = fc.last();

    expect(lastFilter.get("attributeFilters").length).toBe(0);
  });
});

describe("A Backgrid.AdvancedFilter Attribute filter model", function () {
  var afm;
  beforeEach(function() {
    afm = new AdvancedFilter.AttributeFilterModel();
  });

  it("is an instance of Backbone.Model", function() {
    expect(afm instanceof Backbone.Model).toBe(true);
  });

  it("has three predefined attributes", function() {
    var modelKeys = _.keys(afm.attributes);
    modelKeys.sort();

    expect(modelKeys.length).toBe(3);
    expect(modelKeys).toEqual(["column", "settings", "type"]);
  });
});

describe("A Backgrid.AdvancedFilter Attribute filter collection", function () {
  var afc;
  beforeEach(function() {
    afc = new AdvancedFilter.AttributeFilterCollection();
  });

  it("is an instance of Backbone.Collection", function() {
    expect(afc instanceof Backbone.Collection).toBe(true);
  });
});
