'use strict';

(function() {

  let data = "no data";
  
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 700)
      .attr('height', 700);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("./dataEveryYear.csv")
      .then((data) => makeLinePlot(data));
  }

  function makeLinePlot(csvData) {
    data = csvData;
    let population = data.map((row) => parseFloat(row["pop_mlns"]));
    let time = data.map((row) => parseFloat(row['time']));

    let axesLimit = findMinMax(time, population);
    
    let maps = drawAxes(axesLimit, "time", "pop_mlns");
  
    plotLine(maps);
    makeLabelsLine();
  }

  function makeLabelsLine() {
    svgContainer.append('text')
      .attr('x', 350)
      .attr('y', 20)
      .style('font-size', '14pt')
      .text("Population over Time Per Country");
    
      svgContainer.append('text')
      .attr('x', 350)
      .attr('y', 675)
      .style('font-size', '10pt')
      .text('Time');

    svgContainer.append('text')
      .attr('transform', 'translate(10, 375)rotate(-90)')
      .style('font-size', '10pt')
      .text('Population in millions');

  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData,div) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let fertility_rate_data = data.map((row) => parseFloat(row["fertility_rate"]));
    let life_expectancy_data = data.map((row) => parseFloat(row["life_expectancy"]));
   
    
   

    // find data limits
    let axesLimits = findMinMax(fertility_rate_data, life_expectancy_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes1(axesLimits, "fertility_rate", "life_expectancy",div);

    // plot data as points and add tooltip functionality
    plotData(mapFunctions,div);

    // draw title and axes labels
    makeLabels(div);
  }

  // make title and axes labels
  function makeLabels(div) {
    div.append('text')
      .attr('x', 5)
      .attr('y', 10)
      .style('font-size', '9pt')
      .text("Life Expectancy vs Fertility Rates for all Countries");
    
    div.append('text')
      .attr('x', 50)
      .attr('y', 290)
      .style('font-size', '7pt')
      .text('Fertility Rates (Avg Children per Woman)');

    div.append('text')
      .attr('transform', 'translate(6, 150)rotate(-90)')
      .style('font-size', '7pt')
      .text('Life Expectancy (years)');
  }

  function plotLine(map) {
    let years = getFilters(data);
    
    let xMap = map.x;
    let yMap = map.y;
   
   /* let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);*/
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // SVG Line Graph
    let svgDotContainer = div.append('svg')
      .attr('width', 300)
      .attr('height', 300);
    

    var line = d3.line()
                 .x(function(d) {return xMap(d['time']); })
                 .y(function(d) { return yMap(d['pop_mlns']); });


    var path = svgContainer.append('path').data(data.filter(function(d){return d.location==years[0]}))
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr('d', line(data.filter(function(d){return d.location==years[0]})))
    .on("mouseover", (d) => {
      makeScatterPlot(data,svgDotContainer);
      div.transition()
            .duration(200)
            .style("opacity", .9)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
      
        
    })
    .on("mouseout", (d) => {
      div.transition()
        .duration(2000)
        .style("opacity", 0);
    });
    
    
    
      var dropDown = d3.select('body')
        .append('select')
        .on('change', function() {
            var selected = this.value;
            var thisObject = data.filter(location => location.location == selected);
            path.data(thisObject)
                .transition()
                  .attr('d', line(thisObject))
                  .attr("fill", "none")
                  .attr("stroke", "steelblue")
                  .attr("stroke-width", 1.5)
      });

    var options = dropDown.selectAll('option')
      .data(years)
      .enter()
        .append('option')
        .text((d) => { return d; });

     


  }
  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map,div) {
    // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]);
    //get years for drop down
    
  
    // mapping functions
    let xMap = map.x;
    let yMap = map.y;
   
    // make tooltip
  



    // append data to SVG and plot as points
    let circles = div.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .attr('cx', function(d) { return xMap(d["fertility_rate"])})
        .attr('cy', function(d) { return yMap(d["life_expectancy"])})
        .attr('r', 1.5)
        .attr('fill', "#4286f4")
          
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    
    let xValue = function(d) {  return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([50, 650]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) {  return xScale(d); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 650)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {  return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([50, 650]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(d); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);
     
    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  function drawAxes1(limits, x, y,div) {
    // return x value from a row of data
    
    let xValue = function(d) {  return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
      .range([20, 250]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) {  return xScale(d); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    div.append("g")
      .attr('transform', 'translate(10, 250)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {  return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
      .range([20, 250]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(d); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    div.append('g')
      .attr('transform', 'translate(30, 0)')
      .call(yAxis);
     
    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }
  function getFilters(data){
      let years = data.map((row) => row["location"]);
     
      years = [... new Set(years)];
      return years;
  }
  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
