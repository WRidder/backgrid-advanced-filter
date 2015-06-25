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

/**
 * Matchers
 * @property matchers
 */
var matchers = {
  "gt": {
    name: "greater than"
  },
  "gte": {
    name: "greater than or equal"
  },
  "lt": {
    name: "lower than"
  },
  "lte": {
    name: "lower than or equal"
  },
  "eq": {
    name: "equals"
  },
  "neq": {
    name: "does not equal"
  },
  "sw": {
    name: "starts with"
  },
  "ew": {
    name: "ends with"
  },
  "bt": {
    name: "between"
  }
};

/**
 * Types
 * @property types
 */
var types = {
  "text": {
    parser: function(value) {
      return value;
    },
    validation: function(value) {
      return _.isString(value);
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["sw", "ew", "eq", "neq"]
  },
  "number": {
    parser: function(value) {
      return parseFloat(value);
    },
    validation: function(value) {
      return !isNaN(value);
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "eq", "neq"]
  },
  "percent": {
    parser: function(value) {
      return parseFloat(value);
    },
    validation: function(value) {
      return !isNaN(value) && value >= 0 && value <= 100;
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["gt", "gte", "lt", "lte", "bt", "eq", "neq"]
  },
  "boolean": {
    parser: function(value) {
      return !!value;
    },
    validation: function(value) {
      return _.isBoolean(value);
    },
    postProcess: function(value) {
      return value;
    },
    matchers: ["eq", "neq"]
  }
};

/**
 * @class NewFilterButtonView
 * @extends Backbone.View
 */
var NewFilterButtonView = Backbone.View.extend({
  template: _.template("<button class=\"new-attribute-filter\"><%-addFilterText%></button>"),
  defaults: {
    addFilterText: "+"
  },
  events: {
    "click": "newAttributeFilter"
  },
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

    self.$el.append(self.template({
      addFilterText: self.options.addFilterText
    }));

    return self;
  },

  newAttributeFilter: function(e) {
    var self = this;
    self.stopPropagation(e);

    // Get current filter
    var fsm = self.filterStateModel;
    var activeFilter = fsm.getActiveFilter();
    activeFilter.get("attributeFilters").createNewAttributeFilter();

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

var RemoveFilterButtonView = Backbone.View.extend({
  template: _.template("<button class=\"remove-attribute-filter\"><%-removeFilterText%></button>"),
  defaults: {
    removeFilterText: "-"
  },
  events: {
    "click": "removeAttributeFilter"
  },
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter model provided");
    }
    self.filter = self.options.filter;
  },
  render: function() {
    var self = this;
    self.$el.empty();

    self.$el.append(self.template({
      removeFilterText: self.options.removeFilterText
    }));

    return self;
  },

  removeAttributeFilter: function(e) {
    var self = this;
    self.stopPropagation(e);

    // Get current filter
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var activeFilter = fsm.get("filterCollection").get(filterId);
    activeFilter.get("attributeFilters").remove(self.filter);

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
  template: _.template("" +
    "<div class=\"filter-editor-column\">" +
    "<div class=\"filter-editor-matcher\">" +
    "<div class=\"filter-editor-value\">" +
    "<div class=\"filter-editor-addremove\">" +
  ""),
  defaults: {
    ColumnSelectorView: ColumnSelector,
    NewFilterButtonView: NewFilterButtonView,
    RemoveFilterButtonView: RemoveFilterButtonView,
    matchers: matchers,
    types: types
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;

    // Events
    self.listenTo(self.filter, "change:column change:type", self.render);
  },
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.append(self.template());

    // Add column selector
    var selectorView = new this.options.ColumnSelectorView();
    self.$el.find(".filter-editor-column").append(selectorView.render().$el);

    // Add attribute filter view
    var addAttributeFilterView = new this.options.NewFilterButtonView({
      filterStateModel: self.filterStateModel
    });
    self.$el.find(".filter-editor-addremove").append(addAttributeFilterView.render().$el);

    var removeAttributeFilterView = new this.options.RemoveFilterButtonView({
      filterStateModel: self.filterStateModel,
      filter: self.filter
    });
    self.$el.find(".filter-editor-addremove").append(removeAttributeFilterView.render().$el);

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
  defaults: {
    NewFilterButtonView: NewFilterButtonView
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

    self.listenTo(self.filterStateModel, "change:activeFilterId", self.bindFilter);

    self.bindFilter();
  },

  bindFilter: function() {
    var self = this;

    // Get current filter
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");

    // Unbind from previous filter if necessary
    if (self.activeFilter && fsm.get("filterCollection").contains(self.activeFilter)) {
      self.stopListening(self.activeFilter.get("attributeFilters"));
    }

    if (filterId) {
      self.activeFilter = fsm.get("filterCollection").get(filterId);

      // Add event listener to attribute filter collection
      self.listenTo(self.activeFilter.get("attributeFilters"), "add remove reset", self.render);
    }
    else {
      self.activeFilter = null;
    }

    self.render();
  },

  /**
   * @method render
   * @return {AdvancedFilter.Editor}
   * @chainable
   */
  render: function() {
    var self = this;
    self.$el.empty();

    if (self.activeFilter) {
      var af = self.activeFilter;

      // Loop filters
      if (af.get("attributeFilters").length > 0) {
        af.get("attributeFilters").each(function(filter) {
          var filterView = new Backgrid.Extension.AdvancedFilter.SubComponents.FilterView({
            filterStateModel: self.filterStateModel,
            filter: filter
          });

          self.$el.append(filterView.render().$el);
        });
      }
      else {
        // No filters available, render single 'add filter' button
        var newFilterButtonView = new self.options.NewFilterButtonView({
          filterStateModel: self.filterStateModel
        });
        self.$el.append(newFilterButtonView.render().$el);
      }
    }

    return self;
  }
});
