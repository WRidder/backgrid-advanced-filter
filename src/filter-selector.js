"use strict";
/**
 * A column manager for backgrid
 *
 * @module AdvancedFilter.Selector
 */

// Dependencies
var _ = require("underscore");
var Backbone = require("backbone");
var Backgrid = require("backgrid");
require("backgrid-filter");

// Label component
/**
 * @class AdvancedFilter.SubComponents.LabelView
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.SubComponents.LabelView = Backbone.View.extend({
  tagName: "span",
  templates: {
    noFilterSelected: _.template("create"),
    filterSelected: _.template("<span class=\"remove\"><%-filterName%></span><span class=\"remove-filter\">x</span>")
  },
  events: {
    "click": "labelClick",
    "click .remove-filter": "removeClick"
  },

  /**
   * @property defaults
   */
  defaults: {
    labelClass: ""
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

    // Add class
    self.$el.addClass(self.options.labelClass);

    // Event handlers
    self.listenTo(self.filterStateModel, "change:activeFilterId", self.render);
    self.listenTo(self.filterStateModel.get("filterCollection"), "change:name", self.render);
  },

  /**
   * @method render
   * @return {Backgrid.Extension.AdvancedFilter.SubComponents.LabelView}
   * @chainable
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    if (self.filterStateModel.get("activeFilterId") !== null) {
      self.$el.removeClass("create");

      // Get filter model
      var filterModel = self.filterStateModel.get("filterCollection")
        .get(self.filterStateModel.get("activeFilterId"));

      // Render
      self.$el.html(self.templates.filterSelected({
        filterName: filterModel.get("name")
      }));
    }
    else {
      self.$el.html(self.templates.noFilterSelected());
      self.$el.addClass("create");
    }

    return self;
  },

  /**
   * @method labelClick
   * @param {Event} e
   */
  labelClick: function(e) {
    var self = this;
    self.stopEvent(e);
    if (self.filterStateModel.get("activeFilterId") === null) {
      self.filterStateModel.trigger("filter:new");
    }
  },

  /**
   * @method removeClick
   * @param {Event} e
   */
  removeClick: function(e) {
    var self = this;
    self.stopEvent(e);
    if (self.filterStateModel.get("activeFilterId")) {
      self.filterStateModel.set("activeFilterId", null);
    }
  },

  /**
   * @method stopEvent
   * @param {Event} e
   */
  stopEvent: function(e) {
    e.stopPropagation();
    e.preventDefault();
  }
});

/**
 * Main selector component. Consists of a filter selector, searchbar and 'new filter' button.
 *
 * @class AdvancedFilter.Selector
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.Selector = Backbone.View.extend({
  className: "advancedfilter-selector",
  tagName: "div",
  template: _.template("" +
      "<div class=\"filter-dropdown\"></div>" +
      "<div class=\"filter-label\"></div>" +
      "<div class=\"filter-search\"></div>" +
    ""),

  /**
   * @property defaults
   */
  defaults: {
    FilterDropdownComponent: Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdown,
    LabelComponent: Backgrid.Extension.AdvancedFilter.SubComponents.LabelView,
    SearchComponent: Backgrid.Extension.ClientSideFilter
  },

  /**
   * @method initialize
   * @param options
   */
  initialize: function (options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Components object
    self.components = {};

    // Input argument checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;
  },

  /**
   * @method render
   * @return {AdvancedFilter.Selector}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    // Render template
    self.$el.html(self.template());

    // Cache ui components
    self.ui = {};
    self.ui.$dropdown = self.$el.find(".filter-dropdown").first();
    self.ui.$label = self.$el.find(".filter-label").first();
    self.ui.$search = self.$el.find(".filter-search").first();

    // Add filter dropdown
    var filterDropdown = self.getFilterDropdownComponent();
    self.ui.$dropdown.append(filterDropdown.render().$el);

    // Add filter label
    var labelComponent = self.getLabelComponent();
    self.ui.$label.append(labelComponent.render().$el);

    // Add search bar
    var searchComponent = self.getSearchComponent();
    self.ui.$search.append(searchComponent.render().$el);

    return this;
  },

  /**
   * @method getFilterDropdownComponent
   * @return {Backbone.View}
   */
  getFilterDropdownComponent: function() {
    var self = this;
    self.components.filterDropdown = new this.options.FilterDropdownComponent({
      filterStateModel: self.filterStateModel
    });

    return self.components.filterDropdown;
  },

  /**
   * @method getLabelComponent
   * @return {Backbone.View}
   */
  getLabelComponent: function() {
    var self = this;
    self.components.label = new this.options.LabelComponent({
      filterStateModel: self.filterStateModel
    });

    return self.components.label;
  },

  /**
   * @method getSearchComponent
   * @return {Backbone.View}
   */
  getSearchComponent: function() {
    var self = this;
    self.components.search = new this.options.SearchComponent({
      collection: self.filterStateModel.get("dataCollection"),
      placeholder: self.options.searchPlaceHolder || "",
      // The model fields to search for matches
      fields: self.options.textSearchFields,
      // How long to wait after typing has stopped before searching can start
      wait: 150
    });

    return self.components.search;
  }
});
