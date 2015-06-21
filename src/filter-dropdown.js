"use strict";
/**
 * Dropdown subcomponent
 *
 * @module AdvancedFilter.Subcomponents
 */

// Dependencies
var _ = require("underscore");
var Backbone = require("backbone");
var Backgrid = require("backgrid");

/**
 * A dropdown item view
 *
 * @class AdvancedFilter.Subcomponents.FilterDropdownItemview
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdownItemview = Backbone.View.extend({
  className: "advancedfilter-dropdown-item",
  template: _.template("<span class='indicator'></span><span class='filter-name'><%= name %></span>"),
  tagName: "li",
  events: {
    "click": "setActiveFilter"
  },

  /**
   * @method initialize
   * @param {object} opts
   * @param {Backgrid.Extension.ColumnManager} opts.columnManager ColumnManager instance.
   * @param {Backgrid.Column} opts.column A backgrid column.
   */
  initialize: function (opts) {
    var self = this;

    self.filterStateModel = opts.parentView.filterStateModel;
    self.filter = opts.filter;

    _.bindAll(self, "render", "setActiveFilter");
    self.listenTo(self.filter, "change:name", self.render, self);
  },

  /**
   * Activates current filer
   *
   * @method setActiveFilter
   * @param {object} e
   */
  setActiveFilter: function (e) {
    var self = this;
    if (e) {
      self.stopPropagation(e);
    }

    self.filterStateModel.set("activeFilterId", self.filter.cid);
  },

  /**
   * @method render
   * @return {DropDownItemView}
   */
  render: function () {
    var self = this;

    self.$el.empty();

    self.$el.append(self.template({
      name: self.filter.get("name")
    }));

    if (self.filterStateModel.get("activeFilterId") === self.filter.cid) {
      self.$el.addClass("active");
    }
    else {
      self.$el.removeClass("active");
    }

    return self;
  },

  /**
   * Convenience function to stop event propagation.
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
 * Filter dropdown view container.
 *
 * @class AdvancedFilter.Subcomponents.FilterDropdownContainer
 * @extends Backbone.view
 */
Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdownContainer = Backbone.View.extend({
  className: "filter-dropdown-container",
  defaults: {
    DropdownItemView: Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdownItemview
  },

  initialize: function (options) {
    var self = this;
    self.options = _.extend({}, self.defaults, options || {});

    // Input argument checking
    self.parentView = self.options.parentView;

    // Bind events
    self.listenTo(self.parentView.filterStateModel.get("filterCollection"), "add remove", self.render);
    self.listenTo(self.parentView.filterStateModel, "change:activeFilterId", self.render);
  },

  /**
   * @method render
   * @return {DropDownView}
   */
  render: function () {
    var self = this;
    self.$el.empty();

    // List all filters
    self.parentView.filterStateModel.get("filterCollection").each(function (filter) {
      self.$el.append(new self.options.DropdownItemView({
        filter: filter,
        parentView: self.parentView
      }).render().$el);
    });

    return self;
  },

  /**
   * Opens the dropdown.
   *
   * @method open
   */
  open: function () {
    var self = this;

    self.$el.addClass("open");

    // Get button
    var $button = self.parentView.$dropdownButton;

    // Align
    var align;
    if (self.options.align === "auto") {
      // Determine what alignment fits
      var viewPortWidth = document.body.clientWidth || document.body.clientWidth;
      align = (($button.offset().left + self.$el.outerWidth()) > viewPortWidth) ? "left" : "right";
    }
    else {
      align = (self.options.align === "left" || self.options.align === "right") ?
        (self.options.align === "right" ? "right" : "left") : "right";
    }

    var offset;
    if (align === "left") {
      // Align right by default
      offset = $button.offset().left + $button.outerWidth() - self.$el.outerWidth();
      self.$el.css("left", offset + "px");
    }
    else {
      offset = $button.offset().left;
      self.$el.css("left", offset + "px");
    }

    // Height position
    var offsetHeight = $button.offset().top + $button.outerHeight();
    self.$el.css("top", offsetHeight + "px");
  },

  /**
   * Closes the dropdown.
   *
   * @method close
   */
  close: function () {
    this.$el.removeClass("open");
  }
});

/**
 * @class AdvancedFilter.Subcomponents.FilterDropdown
 * @extends Backbone.View
 */
Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdown = Backbone.View.extend({
  tagName: "div",
  defaultEvents: {
    "click": "stopPropagation"
  },
  defaults: {
    width: null,
    closeOnEsc: true,
    closeOnClick: true,
    openOnInit: false,

    // Button
    buttonTemplate: _.template("<button class='dropdown-button <%-buttonClass%>'><%=buttonText%></button>"),
    buttonClass: "",
    buttonText: "Filter &#9660;",

    // Container
    DropdownView: Backgrid.Extension.AdvancedFilter.SubComponents.FilterDropdownContainer,
    dropdownAlign: "auto"
  },

  /**
   * @method initialize
   * @param {Object} opts
   * @param {Backgrid.Extension.AdvancedFilter.FilterStateModel} opts.filterStateModel
   */
  initialize: function (opts) {
    var self = this;
    self.options = _.extend({}, self.defaults, opts || {});
    self.events = _.extend({}, self.defaultEvents, self.events || {});

    // Option checking
    if (!self.options.filterStateModel ||
      !self.options.filterStateModel instanceof Backbone.Model) {
      throw new Error("No (valid) filter state model provided");
    }
    self.filterStateModel = self.options.filterStateModel;

    // Bind scope to events
    _.bindAll(self, "deferClose", "stopDeferClose", "closeOnEsc", "toggle", "render", "open", "close");

    // UI events
    document.body.addEventListener("click", self.deferClose, true);
    if (self.options.closeOnEsc) {
      document.body.addEventListener("keyup", self.closeOnEsc, false);
    }
    self.$el.on("click", self.stopDeferClose);

    // Create elements
    self.setup();

    // Listen for dropdown view events indicating to open and/or close
    self.listenTo(self.filterStateModel.get("filterCollection"), "add remove", self.checkDisabled);
  },

  /**
   * @method delayStart
   * @private
   */
  delayStart: function () {
    clearTimeout(this.closeTimeout);
    this.delayTimeout = setTimeout(this.open, this.options.delay);
  },

  /**
   * @method delayEnd
   * @private
   */
  delayEnd: function () {
    clearTimeout(this.delayTimeout);
    this.closeTimeout = setTimeout(this.close, 300);
  },

  /**
   * @method setup
   * @private
   */
  setup: function () {
    var self = this;

    // Override element width
    if (self.options.width) {
      self.$el.width(self.options.width + "px");
    }

    // Create button element
    self.$dropdownButton = Backbone.$(self.options.buttonTemplate({
      buttonClass: self.options.buttonClass,
      buttonText: self.options.buttonText
    })).click(self.toggle);

    // Create dropdown container
    self.dropdownContainerView = new self.options.DropdownView({
      filterStateModel: self.filterStateModel,
      align: self.options.dropdownAlign,
      parentView: self
    }).render();

    // Render inner view
    document.body.appendChild(self.dropdownContainerView.el);
  },

  /**
   * @method setup
   */
  render: function () {
    var self = this;
    self.$el.empty();

    // Render button
    self.$el.html(self.$dropdownButton);

    // Verify disabled mode
    self.checkDisabled();

    return self;
  },

  /**
   * @method checkDisabled
   */
  checkDisabled: function() {
    var self = this;
    if (self.filterStateModel.get("filterCollection").length > 0) {
      self.$dropdownButton.removeAttr("disabled");
    }
    else {
      self.$dropdownButton.attr("disabled", "disabled");
    }
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
  },

  /**
   * Toggle the dropdown visibility
   *
   * @method toggle
   * @param {object} [e]
   */
  toggle: function (e) {
    var self = this;
    if (self.isOpen !== true) {
      self.open(e);
    }
    else {
      self.close(e);
    }
  },

  /**
   * Open the dropdown
   *
   * @method open
   * @param {object} [e]
   */
  open: function (e) {
    var self = this;

    clearTimeout(self.closeTimeout);
    clearTimeout(self.deferCloseTimeout);

    if (e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.cancelBubble = true;
    }

    // Don't do anything if already open
    if (self.isOpen) {
      return;
    }

    self.isOpen = true;
    self.$el.addClass("open");

    // Notify child view
    self.dropdownContainerView.open();
  },

  /**
   * Close the dropdown
   *
   * @method close
   * @param {object} [e]
   */
  close: function (e) {
    var self = this;

    // Don't do anything if already closed
    if (!self.isOpen) {
      return;
    }

    self.isOpen = false;
    self.$el.removeClass("open");

    // Notify child view
    self.dropdownContainerView.close();
  },

  /**
   * Close the dropdown on esc
   *
   * @method closeOnEsc
   * @param {object} e
   * @private
   */
  closeOnEsc: function (e) {
    if (e.which === 27) {
      this.deferClose();
    }
  },

  /**
   * @method deferClose
   * @private
   */
  deferClose: function () {
    this.deferCloseTimeout = setTimeout(this.close, 0);
  },

  /**
   * @method stopDeferClose
   * @private
   */
  stopDeferClose: function (e) {
    clearTimeout(this.deferCloseTimeout);
  },

  /**
   * Clean up this control
   *
   * @method remove
   * @chainable
   */
  remove: function () {
    var self = this;

    // Remove child
    self.dropdownContainerView.remove();

    // Remove event listeners
    document.body.removeEventListener("click", self.deferClose);
    if (self.options.closeOnEsc) {
      document.body.removeEventListener("keyup", self.closeOnEsc);
    }
    self.$el.off("click", self.stopDeferClose);
    self.$dropdownButton.off("click", self.toggle);

    // Invoke original backbone methods
    return Backbone.View.prototype.remove.apply(self, arguments);
  }
});
