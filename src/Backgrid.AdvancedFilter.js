"use strict";

/**
 * A column manager for backgrid
 *
 * @module AdvancedFilter
 */
var _ = require("underscore");
var Backbone = require("backbone");
var Backgrid = require("backgrid");

// Setup root object
Backgrid.Extension.AdvancedFilter = {
  SubComponents: {}
};

// Require submodules
require("./filter-model");
require("./filter-collection");
require("./filter-editor");
require("./filter-saver");
require("./filter-dropdown");
require("./filter-selector");

/**
 * Parent class of the advanced filter.
 * @class AdvancedFilter.Main
 */

Backgrid.Extension.AdvancedFilter.Main = Backbone.View.extend({
  className: "advancedfilter",
  defaults: {
    SelectorView: Backgrid.Extension.AdvancedFilter.Selector,
    FilterView: Backgrid.Extension.AdvancedFilter.Editor,
    SaverView: Backgrid.Extension.AdvancedFilter.Saver
  },

  /**
   * @method initialize
   * @param options
   */
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});
    self.components = {};

    if (!self.options.collection || !self.options.collection instanceof Backbone.Collection) {
      throw new Error("AdvancedFilter: data collection is required.");
    }

    if (!self.options.columns || !self.options.columns instanceof Backgrid.Columns) {
      throw new Error("AdvancedFilter: columns are required.");
    }

    if (!self.options.filters) {
      // No filters provided, create empty collection
      self.options.filters = new Backgrid.Extension.AdvancedFilter.FilterCollection();
    }

    // Create filter state model
    self.createFilterStateModel(self.options);
  },

  /**
   * @method render
   * @return {Main}
   * @chainable
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Add selector
    var selector = self.components.selector = new self.options.SelectorView({
      filterStateModel: self.filterStateModel
    });
    self.$el.append(selector.render().$el);

    // Add editor
    var editor = self.components.editor = new self.options.FilterView({
      filterStateModel: self.filterStateModel
    });
    self.$el.append(editor.render().$el);

    // Add saver
    var saver = self.components.saver = new self.options.SaverView({
      filterStateModel: self.filterStateModel
    });
    self.$el.append(saver.render().$el);

    return self;
  },

  /**
   * Verifies whether a given id is valid for the current filter collection.
   * @method verifyFilterId
   * @param {AdvancedFilter.FilterCollection} filters
   * @param id
   * @return {boolean}
   */
  verifyFilterId: function(filters, id) {
    return filters.get(id) ? true : false;
  },

  /**
   * @method createFilterStateModel
   * @param options
   */
  createFilterStateModel: function(options) {
    var self = this;

    // Check if active filter is valid
    var validFilter = self.verifyFilterId(options.filters, options.activeFilterId);

    // Create filter state model
    self.filterStateModel = new Backgrid.Extension.AdvancedFilter.FilterStateModel({
      dataCollection: options.collection,
      columnCollection: options.columns,
      filterCollection: options.filters,
      activeFilterId: (validFilter) ?
        options.filters.get(options.activeFilterId).cid
        : null
    });

    // Bind events
    self.bindFilterStateEvents();
  },

  /**
   * @method bindFilterStateEvents
   */
  bindFilterStateEvents: function() {
    var self = this;
    var fsm = self.filterStateModel;
    self.listenTo(fsm, "filter:new", self.evtNewFilter);
    self.listenTo(fsm, "filter:save", self.evtSaveFilter);
    self.listenTo(fsm, "filter:reset", self.evtResetFilter);
    self.listenTo(fsm, "filter:cancel", self.evtCancelFilter);
    self.listenTo(fsm, "filter:remove", self.evtRemoveFilter);
  },

  /**
   * Event handler for filter:new (fsm)
   * @method evtNewFilter
   */
  evtNewFilter: function() {
    var self = this;
    var fsm = self.filterStateModel;

    var newFilter = fsm.get("filterCollection").createNewFilter();
    fsm.set("activeFilterId", newFilter.cid);
  },

  /**
   * Event handler for filter:save (fsm)
   * @method evtSaveFilter
   */
  evtSaveFilter: function() {
    var self = this;
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var filter = fsm.get("filterCollection").get(filterId);
    filter.saveFilter();

    self.trigger("filter:save", filterId, filter);
  },

  /**
   * Event handler for filter:reset (fsm)
   * @method evtResetFilter
   */
  evtResetFilter: function() {
    var self = this;
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var filter = fsm.get("filterCollection").get(filterId);
    filter.resetFilter();

    self.trigger("filter:reset", filterId, filter);
  },

  /**
   * Event handler for filter:cancel (fsm)
   * @method evtCancelFilter
   */
  evtCancelFilter: function() {
    var self = this;
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var filter = fsm.get("filterCollection").get(filterId);
    var currentState = {
      name: filter.get("name"),
      filters: filter.get("filters") ? filter.get("filters").toJSON() : null
    };

    filter.cancelFilter();

    self.trigger("filter:cancel", filterId, filter, currentState);
  },

  /**
   * Event handler for filter:remove (fsm)
   * @method evtRemoveFilter
   */
  evtRemoveFilter: function() {
    var self = this;
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var filter = fsm.get("filterCollection").get(filterId);
    var filterName = filter.get("name");

    fsm.set("activeFilterId", null);
    fsm.get("filterCollection").remove(filter);
    self.trigger("filter:remove", filterId, filterName);
  },

  /**
   * Clean up this control
   *
   * @method remove
   * @chainable
   */
  remove: function () {
    var self = this;

    // Remove sub components
    self.components.selector.remove();
    self.components.editor.remove();
    self.components.saver.remove();

    // Invoke original backbone methods
    return Backbone.View.prototype.remove.apply(self, arguments);
  }
});
