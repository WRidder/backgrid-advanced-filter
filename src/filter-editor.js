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
  tagName: "button",
  defaults: {
    buttonText: "",
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

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("ButtonView: No (valid) attribute filter model provided");
    }
    self.filter = self.options.filter;
  },
  render: function() {
    var self = this;
    self.$el.empty();

    // Add class
    self.$el.addClass(self.options.buttonClass);

    // Set text
    self.$el.text(self.options.buttonText);

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
  }
});

var ColumnSelectorView = Backbone.View.extend({
  className: "column-selector",
  tagName: "select",
  initFinished: false,
  defaults: {
    placeHolderText: "Select column..."
  },
  events: {
    "change": "columnUpdate"
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("ColumnSelectorView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("ColumnSelectorView: No (valid) attribute filter model provided");
    }
    self.filter = self.options.filter;
  },

  render: function() {
    var self = this;

    // Get filter options
    var filterOptions = self.filterOptions = self.filterStateModel.getFilterableColumns();

    // Add placeholder
    self.$el.append("<option value=\"\"disabled selected>" + self.options.placeHolderText + "</option>");

    // Add select options
    _.each(filterOptions, function(col, name) {
      self.$el.append($("<option></option>")
        .attr("value", name)
        .text(col.label));
    });

    // Set current value
    if (_.has(filterOptions, self.filter.get("column"))) {
      self.$el.val(self.filter.get("column"));
    }

    self.initFinished = true;
    return self;
  },

  /**
   * @method columnUpdate
   */
  columnUpdate: function() {
    var self = this;
    if (self.initFinished) {
      var column = self.$el.val();
      var type = self.filterOptions[column].filterType;
      self.filter.set({
        column: column,
        type: type
      });
    }
  }
});

/**
 * @class MatcherSelectorView
 */
var MatcherSelectorView = Backbone.View.extend({
  tagName: "select",
  events: {
    "change": "matcherUpdate"
  },
  defaults: {
    placeHolderText: "select a method..."
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("ColumnSelectorView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("ColumnSelectorView: No (valid) attribute filter model provided");
    }
    self.filter = self.options.filter;
  },

  render: function() {
    var self = this;

    // Get filter options
    var filterOptions = self.filterOptions = self.filterStateModel.getMatchers(self.filter.get("type"));

    // Add placeholder
    self.$el.append("<option value=\"\"disabled selected>" + self.options.placeHolderText + "</option>");

    // Add select options
    _.each(filterOptions, function(matcher, name) {
      self.$el.append($("<option></option>")
        .attr("value", name)
        .text(matcher.label));
    });

    // Set current value
    if (_.has(filterOptions, self.filter.get("matcher"))) {
      self.$el.val(self.filter.get("matcher"));
    }

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

var SingleValueBoolView = Backbone.View.extend({
  className: "single-value-bool",
  tagName: "select",
  events: {
    "change": "valueUpdate"
  },
  defaults: {
    placeHolderText: "select true or false"
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

    // Add placeholder
    self.$el.append("<option value=\"\"disabled selected>" + self.options.placeHolderText + "</option>");

    // Add select options
    self.$el.append($("<option></option>")
      .attr("value", true)
      .text("true"));

    self.$el.append($("<option></option>")
      .attr("value", false)
      .text("false"));

    // Set current value
    var currentValue = self.filter.get("value");
    if (currentValue === true || currentValue === false) {
      self.$el.val(currentValue);
    }
    return self;
  },

  valueUpdate: function() {
    var self = this;
    self.filter.set("value", self.$el.val());
  }
});

var SingleValueTextView = Backbone.View.extend({
  className: "single-value-text",
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
    var self = this;
    self.filter.set("value", self.$el.val());
  }
});


var DoubleValueTextView = Backbone.View.extend({
  className: "double-value-text-container",
  tagName: "div",
  template: _.template("" +
    "<input class=\"double-value-text\"/>" +
    "<input class=\"double-value-text\"/>" +
    ""),
  events: {
    "change": "valueUpdate"
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("MatcherSelectorView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;

    // Get parser
    self.valueParser = self.filterStateModel.getValueParser(self.filter.get("type"));
  },

  /**
   * @method render
   * @return {ValueView}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.append(self.template());

    // Set values
    var currentValue = self.filter.get("value");
    if (_.isArray(currentValue) && currentValue.length === 2) {
      // Set values
      self.$el.find("input").first().val(currentValue[0]);
      self.$el.find("input").last().val(currentValue[1]);
    }

    self.$el.val(self.filter.get("value"));
    return self;
  },

  valueUpdate: function() {
    var self = this;

    // Get values
    var values = [
      self.valueParser(self.$el.find("input").first().val()),
      self.valueParser(self.$el.find("input").last().val())
    ];

    // Save values
    self.filter.set("value", values);
  }
});

var ValueContainerView = Backbone.View.extend({
  className: "value-container",
  tagName: "div",
  defaults: {
    SingleValueTextView: SingleValueTextView,
    DoubleValueTextView: DoubleValueTextView,
    SingleValueBoolView: SingleValueBoolView
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});
    self.childView = null;

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("MatcherSelectorView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;

    // Events
    self.listenTo(self.filter, "change:matcher", self.render);
  },

  /**
   * @method render
   * @return {ColumnFilter}
   * @chainable
   */
  render: function() {
    var self = this;

    // Cleanup
    if (self.childView) {
      self.childView.remove();
      self.childView = null;
    }

    if (self.filter.get("matcher") && self.filter.get("type")) {
      var inputTypeInfo = self.filterStateModel.
        getInputTypeInfoForMatcher(self.filter.get("matcher"), self.filter.get("type"));

      if (inputTypeInfo.valueType === "single" && inputTypeInfo.inputType === "textbox") {
        self.childView = new self.options.SingleValueTextView({
          filter: self.filter,
          filterStateModel: self.filterStateModel
        });
        self.$el.append(self.childView.render().$el);
      }

      if (inputTypeInfo.valueType === "array2" && inputTypeInfo.inputType === "textbox") {
        self.childView = new self.options.DoubleValueTextView({
          filter: self.filter,
          filterStateModel: self.filterStateModel
        });
        self.$el.append(self.childView.render().$el);
      }

      if (inputTypeInfo.valueType === "single" && inputTypeInfo.inputType === "boolean-select") {
        self.childView = new self.options.SingleValueBoolView({
          filter: self.filter,
          filterStateModel: self.filterStateModel
        });
        self.$el.append(self.childView.render().$el);
      }
    }

    return self;
  },

  remove: function() {
    var self = this;

    // Remove childview
    if (self.childView) {
      self.childView.remove();
    }

    // Invoke original backbone methods
    return Backbone.View.prototype.remove.apply(self, arguments);
  }
});

/**
 * @class MatcherContainerView
 * @extends Backbone.View
 */
var MatcherContainerView = Backbone.View.extend({
  className: "matcher-container",
  tagName: "div",
  template: _.template("" +
    "<div class=\"matcher-selector\"></div>" +
    "<div class=\"matcher-value\"></div>" +
    "<div class=\"clearer\"></div>" +
    ""
  ),
  defaults: {
    MatcherSelectorView: MatcherSelectorView,
    ValueContainerView: ValueContainerView
  },

  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});
    self.childViews = {};

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("MatcherSelectorView: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.filter;

    // Events
    self.listenTo(self.filter, "change:column", self.render);
    self.listenTo(self.filter, "change:matcher", self.renderValueView);
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
    self.renderValueView();

    return self;
  },

  renderValueView: function() {
    var self = this;
    if (self.filter.get("matcher")) {
      self.renderSubComponent(".matcher-value", self.options.ValueContainerView);
    }
  },

  /**
   * @method renderSubcomponent
   * @param className
   * @param View
   */
  renderSubComponent: function(className, View) {
    var self = this;
    var $container = self.$el.find("> div" + className);

    // Check if child already exists, if so, remove
    if (self.childViews[className]) {
      self.childViews[className].remove();
    }

    // Add column selector
    self.childViews[className] = new View({
      filterStateModel: self.filterStateModel,
      filter: self.filter
    });
    $container.append(self.childViews[className].render().$el);
  },

  /**
   * @method remove
   * @return {*}
   */
  remove: function() {
    var self = this;

    // Remove childviews
    _.each(self.childViews, function(view) {
      view.remove();
    });

    // Invoke original backbone methods
    return Backbone.View.prototype.remove.apply(self, arguments);
  }
});

/**
 * @class ColumnFilterView
 * @extends Backbone.View
 */
var ColumnFilterView = Backbone.View.extend({
  className: "columnfilter",
  tagName: "div",
  template: _.template("" +
    "<div class=\"columnfilter-column\"></div>" +
    "<div class=\"columnfilter-matcher\"></div>" +
    "<div class=\"clearer\"></div>" +
    ""
  ),
  events: {
    "change": "columnUpdate"
  },
  defaults: {
    ColumnSelectorView: ColumnSelectorView,
    MatcherContainerView: MatcherContainerView
  },

  /**
   * @method initialize
   * @param options
   */
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("ColumnFilter: No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.filter ||
      !self.options.filter instanceof Backbone.Model) {
      throw new Error("ColumnFilter: No (valid) filter model provided");
    }
    self.filter = self.options.filter;

    // Events
    self.listenTo(self.filter, "change:column", self.renderSubComponents);
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

    // Render sub components
    self.renderSubComponents();

    return self;
  },

  renderSubComponents: function() {
    var self = this;

    // Add sub components
    if (!self.colSelectorRendered) {
      self.renderSubComponent(".columnfilter-column", self.options.ColumnSelectorView);
      self.colSelectorRendered = true;
    }
    if (!self.matcherRendered && self.filter.get("type")) {
      self.renderSubComponent(".columnfilter-matcher", self.options.MatcherContainerView);
      self.matcherRendered = true;
    }
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
      filter: self.filter,
      filterStateModel: self.filterStateModel
    });
    $container.append(subView.render().$el);
  }
});

/**
 * @class FilterView
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.SubComponents.FilterView = Backbone.View.extend({
  className: "filter-editor",
  tagName: "div",
  template: _.template("" +
    "<div class=\"filter-editor-columnfilter\"></div>" +
    "<div class=\"filter-editor-addremove\"></div>" +
    "<div class=\"clearer\"></div>" +
  ""),
  defaults: {
    ColumnFilterView: ColumnFilterView,
    NewFilterButtonView: NewFilterButtonView,
    RemoveFilterButtonView: RemoveFilterButtonView
  },

  /**
   * @method initialize
   * @param options
   */
  initialize: function(options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    if (!self.options.attributeFilter ||
      !self.options.attributeFilter instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filter = self.options.attributeFilter;

    // Events
    self.listenTo(self.filter, "change:valid", self.setValidClass);
  },

  /**
   * @method render
   * @return {FilterView}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.append(self.template());

    // Add column selector
    var columnFilterView = new this.options.ColumnFilterView({
      filterStateModel: self.filterStateModel,
      filter: self.filter
    });
    self.$el.find(".filter-editor-columnfilter").append(columnFilterView.render().$el);

    // Add attribute filter view
    var addAttributeFilterView = new this.options.NewFilterButtonView({
      filterStateModel: self.filterStateModel,
      filter: self.filter
    });
    self.$el.find(".filter-editor-addremove").append(addAttributeFilterView.render().$el);

    var removeAttributeFilterView = new this.options.RemoveFilterButtonView({
      filterStateModel: self.filterStateModel,
      filter: self.filter
    });
    self.$el.find(".filter-editor-addremove").append(removeAttributeFilterView.render().$el);

    // Set valid class
    self.setValidClass();

    return self;
  },

  /**
   * Adds an 'active' class to the view element if the attribute filter is valid.
   * @method setValidClass
   */
  setValidClass: function() {
    var self = this;

    if (self.filter.get("valid")) {
      self.$el.removeClass("invalidvalid");
      self.$el.addClass("valid");
    }
    else {
      self.$el.removeClass("valid");
      self.$el.addClass("invalid");
    }
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
        af.get("attributeFilters").each(function(attributeFilter) {
          var filterView = new Backgrid.Extension.AdvancedFilter.SubComponents.FilterView({
            filterStateModel: self.filterStateModel,
            attributeFilter: attributeFilter
          });

          self.$el.append(filterView.render().$el);
        });
      }
      else {
        // No filters available, render single 'add filter' button
        var newFilterButtonView = new self.options.NewFilterButtonView({
          filterStateModel: self.filterStateModel,
          filter: self.activeFilter
        });
        self.$el.append(newFilterButtonView.render().$el);
      }
    }

    return self;
  }
});
