# backgrid-advanced-filter
An advanced filter plugin for Backgrid.
[Online demo (will be added soon)](https://wridder.github.io/backgrid-demo/)

## Example usage
**Initialization**  

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
    advancedFilter.on("filter:new", function(filterId, filterModel) {
        console.log("New filer created.");
    });
        
    advancedFilter.on("filter:save", function(filterId, filterModel) {
        console.log("Currently active filter saved.");
    });

    advancedFilter.on("filter:cancel", function(filterId, filterModel, stateBeforeCancel) {
        console.log("Changes made to current filter reverted.");
    });

    advancedFilter.on("filter:reset", function(filterId, filterModel) {
        console.log("Current active filter reset");
    });

    advancedFilter.on("filter:remove", function() {
        console.log("Currently active filter removed.");
    });
```  

**Filtering**  
  
```javascript
    advancedFilter.on("filter:save", function(filterId, filterModel) {
        // Get filter definition (default is mongo style)
        var definition = filterModel.getFilterDefinition("mongo");
        
        // Request new data using filter
        dataSource(filter).success(function(filteredData) {
            dataCollection.reset(filteredData);
        });        
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

## Contributing / development
- Fork this repository
- Checkout locally using git
- Run `npm install`
- Run `gulp` to watch for changes and build + test the library
- Edit files in `/src` + add/adjust tests
- Make sure lint and tests pass
- Commit to your fork and create a PR (Pull request) with the changes

## Authors
This project is originally developed by [Wilbert van de Ridder](https://github.com/WRidder/) and sponsored by [Solodev](http://www.solodev.com).
