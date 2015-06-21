# backgrid-advanced-filter
An advanced filter plugin for Backgrid.
[Online demo (will be added soon)](https://wridder.github.io/backgrid-demo/)

## Example usage
```javascript
    // Create advanced filter instance
    var advancedFilter = new Backgrid.Extension.AdvancedFilter.Main({
      collection: dataCollection,
      /*
        Filterable columns need an additional attribute 'filterType'.
        e.g.: filterType: 'text';  (Supported: text, number, boolean, percent)
      */
      columns: columnCollection,
      /* optional */
      filters: filterCollection
    });

    // Render the filter
    $(document.body).append(advancedFilter.render().$el);

    // Available events
    advancedFilter.on("filter:save", function() {
        console.log("Currently active filter saved.");
    });

    advancedFilter.on("filter:cancel", function() {
        console.log("Changes made to current filter reverted.");
    });

    advancedFilter.on("filter:reset", function() {
        console.log("Current active filter reset");
    });

    advancedFilter.on("filter:remove", function() {
        console.log("Currently active filter removed.");
    });
```

## Roadmap
- Filter editor
  - Finalize filters for boolean, number, string and percent columns
  - Validation / error handling
- Export to mongo filter style JSON
- API reference example

## Dependencies
* [Backgrid filter](https://github.com/wyuenho/backgrid-filter)

## Authors
This project is originally developed by [Wilbert van de Ridder](https://github.com/WRidder/) and sponsored by [Solodev](http://www.solodev.com).
