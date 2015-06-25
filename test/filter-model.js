/* global Backgrid _ Backbone */
"use strict";
if (window.wallabyEnv) {
  require("../src/Backgrid.AdvancedFilter");
}

// Convenience variables
var AdvancedFilter = Backgrid.Extension.AdvancedFilter;

describe("A Backgrid.AdvancedFilter Filter State model", function () {
  var fsm;
  beforeEach(function() {
    fsm = new AdvancedFilter.FilterStateModel();
  });

  it("is an instance of Backbone.Model", function() {
    expect(fsm instanceof Backbone.Model).toBe(true);
  });

  it("has three predefined attributes", function() {
    var modelKeys = _.keys(fsm.attributes);
    modelKeys.sort();

    expect(modelKeys.length).toBe(4);
    expect(modelKeys).toEqual(["activeFilterId", "columnCollection", "dataCollection", "filterCollection"]);
  });

  it("returns the active filter using getActiveFilter()", function() {
    fsm.set("filterCollection", new AdvancedFilter.FilterCollection());
    var newFilter = fsm.get("filterCollection").createNewFilter();
    fsm.set("activeFilterId", newFilter.cid);

    expect(fsm.getActiveFilter()).toBe(newFilter);
  });
});
