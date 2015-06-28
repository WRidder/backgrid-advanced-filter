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

var ButtonView = Backbone.View.extend({
  template: _.template("<button class=\"<%-buttonClass%>\"><%-buttonText%></button>"),
  defaults: {
    buttonText: "+",
    buttonClass: ""
  },
  events: {
    "click": "clickHandler"
  },
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("ButtonView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;
  },
  render: function() {
    var self = this;
    self.$el.empty();

    self.$el.append(self.template({
      buttonText: self.options.buttonText,
      buttonClass: self.options.buttonClass
    }));

    return self;
  },

  clickHandler: function(e) {
    var self = this;
    self.stopPropagation(e);
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

/**
 * @class NewFilterButtonView
 * @extends Backbone.View
 */
var NewFilterButtonView = ButtonView.extend({
  defaults: {
    buttonText: "+",
    buttonClass: "new-attribute-filter"
  },
  clickHandler: function(e) {
    var self = this;
    self.stopPropagation(e);

    // Get current filter
    var fsm = self.filterStateModel;
    var activeFilter = fsm.getActiveFilter();
    activeFilter.get("attributeFilters").createNewAttributeFilter();

    // Rerender
    self.render();
  }
});

/**
 * @class RemoveFilterButtonView
 * @extends Backbone.View
 */
var RemoveFilterButtonView = ButtonView.extend({
  defaults: {
    buttonText: "-",
    buttonClass: "remove-attribute-filter"
  },
  clickHandler: function(e) {
    var self = this;
    self.stopPropagation(e);

    // Get current filter
    var fsm = self.filterStateModel;
    var filterId = fsm.get("activeFilterId");
    var activeFilter = fsm.get("filterCollection").get(filterId);
    activeFilter.get("attributeFilters").remove(self.filter);

    // Rerender
    self.render();
  }
});

var ColumnSelectorView = Backbone.View.extend({
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

var MatcherSelectorView = Backbone.View.extend({
  className: "matcher-selector",
  tagName: "select",
  events: {
    "change": "matcherUpdate"
  },
  defaults: {},

  /**
   * @method initialize
   * @param options
   */
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;
  },

  /**
   * @method render
   * @return {MatcherSelectorView}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Add select options
    _.each(self.options.selectValues, function(selectValue) {
      self.$el.append($("<option></option>")
        .attr("value", selectValue.value)
        .text(selectValue.text));
    });
    return self;
  },

  /**
   * @method matcherUpdate
   */
  matcherUpdate: function() {
    var self = this;
    self.filter.set("matcher", self.$el.val());
  }
});

var SingleValueView = Backbone.View.extend({
  className: "single-value-input",
  tagName: "input",
  events: {
    "change": "valueUpdate"
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;
  },

  /**
   * @method render
   * @return {ValueView}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    self.$el.val(self.filter.get("value"));
    return self;
  },

  valueUpdate: function() {
    console.log("Value change!");
    self.filter.set("value", self.$el.val());
  }
});

var ValueContainerView = Backbone.View.extend({
  className: "matcher-container",
  tagName: "div",
  defaults: {
    SingleValueView: SingleValueView
    /*
    DoubleValueView: DoubleValueView,
    BoolValueView: BoolValueView
     */
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;
  },

  /**
   * @method render
   * @return {ColumnFilter}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    return self;
  }
});

var MatcherContainerView = Backbone.View.extend({
  className: "matcher-container",
  tagName: "div",
  template: _.template("" +
    "<div class=\"matcher-selector\">" +
    "<div class=\"matcher-value\">" +
    ""
  ),
  defaults: {
    MatcherSelectorView: MatcherSelectorView,
    ValueContainerView: ValueContainerView
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;
  },

  /**
   * @method render
   * @return {ColumnFilter}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.append(self.template());

    // Add sub components
    self.renderSubComponent(".matcher-selector", self.options.MatcherSelectorView);
    self.renderSubComponent(".matcher-value", self.options.ValueContainerView);

    return self;
  },

  /**
   * @method renderSubcomponent
   * @param className
   * @param View
   */
  renderSubComponent: function(className, View) {
    var self = this;
    var $container = self.$el.find("> div" + className);
    $container.empty();

    // Add column selector
    var subView = new View({
      filter: self.filter
    });
    $container.append(subView.render().$el);
  }
});

var ColumnFilter = Backbone.View.extend({
  className: "columnfilter",
  tagName: "div",
  template: _.template("" +
    "<div class=\"columnfilter-column\">" +
    "<div class=\"columnfilter-matcher\">" +
    ""
  ),
  events: {
    "change": "columnUpdate"
  },
  defaults: {
    ColumnSelectorView: ColumnSelectorView,
    MatcherView: MatcherContainerView
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;
  },

  /**
   * @method render
   * @return {ColumnFilter}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.append(self.template());

    // Add sub components
    self.renderSubComponent(".columnfilter-column", self.options.ColumnSelectorView);
    self.renderSubComponent(".columnfilter-matcher", self.options.MatcherView);

    return self;
  },

  /**
   * @method renderSubcomponent
   * @param className
   * @param View
   */
  renderSubComponent: function(className, View) {
    var self = this;
    var $container = self.$el.find("> div" + className);
    $container.empty();

    // Add column selector
    var subView = new View({
      filter: self.filter
    });
    $container.append(subView.render().$el);
  }
});

Backgrid.Extension.AdvancedFilter.SubComponents.FilterView = Backbone.View.extend({
  className: "filter-editor",
  tagName: "div",
  template: _.template("" +
    "<div class=\"filter-editor-columnfilter\">" +
    "<div class=\"filter-editor-addremove\">" +
  ""),
  defaults: {
    ColumnFilterView: ColumnFilter,
    NewFilterButtonView: NewFilterButtonView,
    RemoveFilterButtonView: RemoveFilterButtonView
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
    var columnFilterView = new this.options.ColumnFilterView({
      filter: self.filter
    });
    self.$el.find(".filter-editor-column").append(columnFilterView.render().$el);

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
