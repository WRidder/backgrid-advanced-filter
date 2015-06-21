"use strict";

/**
 * A column manager for backgrid
 *
 * @module AdvancedFilter.Editor
 */
var _ = require("underscore");
var $ = require("jquery");
var Backbone = require("backbone");
var Backgrid = require("backgrid");

var ColumnSelector = Backbone.View.extend({
  className: "column-selector",
  tagName: "select",
  events: {
    "change": "columnUpdate"
  },

  render: function() {
    var self = this;
    self.$el.empty();

    // Add select options
    self.$el.append($("<option></option>")
      .attr("value", "test")
      .text("test!"));

    self.$el.append($("<option></option>")
      .attr("value", "test2")
      .text("test2!"));

    return self;
  },

  columnUpdate: function() {
    console.log("column change!");
  }
});

Backgrid.Extension.AdvancedFilter.SubComponents.FilterView = Backbone.View.extend({
  className: "filter-editor",
  tagName: "div",
  allowedFilterTypes: [
    "text",
    "percent",
    "boolean",
    "number"
  ],

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;
  },

  render: function() {
    var self = this;
    self.$el.empty();

    var selector = new ColumnSelector();
    self.$el.append(selector.render().$el);

    return self;
  }

});

/**
 *
 * @class AdvancedFilter.Editor
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.Editor = Backbone.View.extend({
  className: "advancedfilter-editor",
  tagName: "div",
  templates: {
    emptyFilters: _.template("<button class=\"new-attribute-filter\"><%-addFilterText%></button>")
  },
  defaults: {
    addFilterText: "+"
  },
  events: {
    "click button.new-attribute-filter": "newAttributeFilter"
  },

  /**
   * @method initialize
   * @param options
   */
  initialize: function (options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    self.listenTo(self.filterStateModel, "change:activeFilterId", self.render);
  },

  /**
   * @method render
   * @return {AdvancedFilter.Editor}
   * @chainable
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Get current filter
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");

    if (filterId) {
      var activeFilter = fsm.get("filterCollection").get(filterId);

      // Add event listener to attribute filter collection
      self.listenTo(activeFilter.get("attributeFilters"), "add remove", self.render);

      // Loop filters
      if (activeFilter.get("attributeFilters").length > 0) {
        activeFilter.get("attributeFilters").each(function(filter) {
          var filterView = new Backgrid.Extension.AdvancedFilter.SubComponents.FilterView({
            filterStateModel: fsm,
            filter: filter
          });

          self.$el.append(filterView.render().$el);
        });
      }
      else {
        // No filters available, render single 'add filter' button
        self.$el.append(self.templates.emptyFilters({
          addFilterText: self.options.addFilterText
        }));
      }
    }

    return self;
  },

  newAttributeFilter: function(e) {
    var self = this;
    self.stopPropagation(e);

    // Get current filter
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var activeFilter = fsm.get("filterCollection").get(filterId);
    activeFilter.get("attributeFilters").createNewFilter();

    // Rerender
    self.render();
  },

  /**
   * Convenience function to stop event propagation
   *
   * @method stopPropagation
   * @param {object} e
   * @private
   */
  stopPropagation: function (e) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});
