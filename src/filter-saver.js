"use strict";

/**
 * A column manager for backgrid
 *
 * @module AdvancedFilter.Saver
 */
var _ = require("underscore");
var Backbone = require("backbone");
var Backgrid = require("backgrid");

/**
 *
 * @class AdvancedFilter.Saver
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.Saver = Backbone.View.extend({
  className: "advancedfilter-saver",
  tagName: "div",
  template: _.template("" +
    "<div class=\"advancedfilter-saver-input\">" +
      "<input type=\"text\" value=\"<%-inputValue%>\">" +
    "</div>" +
    "<div class=\"advancedfilter-saver-buttons\">" +
      "<button class=\"save\"><%-saveText%></button>" +
      "<button class=\"cancel\"><%-cancelText%></button>" +
      "<button class=\"reset\"><%-resetText%></button>" +
      "<button class=\"remove\"><%-removeText%></button>" +
    "</div>"
  ),
  events: {
    "click button.reset": "resetFilter",
    "click button.cancel": "cancelFilter",
    "click button.save": "saveFilter",
    "click button.remove": "removeFilter"
  },

  defaults: {
    resetText: "Reset",
    cancelText: "Cancel",
    saveText: "Save",
    removeText: "Remove"
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

    // Events
    self.listenTo(self.filterStateModel, "add remove change:activeFilterId", self.render);
  },

  /**
   * @method render
   * @return {AdvancedFilter.Saver}
   */
  render: function() {
    var self = this;
    self.$el.empty();

    if (self.filterStateModel.get("activeFilterId") !== null) {
      var inputValue = self.filterStateModel.get("filterCollection")
        .get(self.filterStateModel.get("activeFilterId")).get("name");

      // Render template
      self.$el.html(self.template({
        inputValue: inputValue,
        resetText: self.options.resetText,
        cancelText: self.options.cancelText,
        saveText: self.options.saveText,
        removeText: self.options.removeText
      }));
    }

    return self;
  },

  /**
   * @method saveFilter
   * @param {Event} e
   */
  saveFilter: function(e) {
    var self = this;
    self.stopEvent(e);

    // Get input value
    var inputFilterName = self.$el.find("input").val();

    // Get current filter
    var filter = self.filterStateModel.get("filterCollection")
      .get(self.filterStateModel.get("activeFilterId"));

    // Update filter name
    if (inputFilterName !== "") {
      filter.set("name", inputFilterName);
    }
    else {
      self.$el.find("input").val(filter.get("name"));
    }

    self.filterStateModel.trigger("filter:save");
  },

  /**
   * @method resetFilter
   * @param {Event} e
   */
  resetFilter: function(e) {
    var self = this;
    self.stopEvent(e);

    self.filterStateModel.trigger("filter:reset");
  },

  /**
   * @method cancelFilter
   * @param {Event} e
   */
  cancelFilter: function(e) {
    var self = this;
    self.stopEvent(e);

    // Get current filter
    var filter = self.filterStateModel.getActiveFilter();

    // Reset filter name to actual current value
    self.$el.find("input").val(filter.get("name"));

    self.filterStateModel.trigger("filter:cancel");
  },

  /**
   * @method removeFilter
   * @param {Event} e
   */
  removeFilter: function(e) {
    var self = this;
    self.stopEvent(e);

    self.filterStateModel.trigger("filter:remove");
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
