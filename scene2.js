// Set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right + 150)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Load the data
d3.json("data/anime_filtered.csv.json").then(function(animeData) {
    // Pre-process the data: split the genre field into an array of genres, 
    // and create a new row for each genre that the show belongs to.
    var processedData = [];
    animeData.forEach(function(d) {
        var genres = d.genre.split(", ");
        genres.forEach(function(genre) {
            processedData.push({
                aired_from_year: new Date(d.aired).getFullYear(),
                genre: genre
            });
        });
    });

    // Filter out data before 1960
    processedData = processedData.filter(function(d) {
        return d.aired_from_year >= 1960;
    });

    // Group the data by year and by genre
    var dataByYearGenre = d3.group(processedData, d => d.aired_from_year, d => d.genre);

    // Transform the data into a suitable format for a stacked bar chart
    var stackedData = [];
    dataByYearGenre.forEach(function(value, key) {
        var year = key;
        var genreData = value;
        var yearData = {year: year};
        genreData.forEach(function(value, key) {
            var genre = key;
            var shows = value;
            yearData[genre] = shows ? shows.length : 0;
        });
        stackedData.push(yearData);
    });

    // List of subgroups (i.e., the genres)
    var subgroups = Array.from(new Set(processedData.map(d => d.genre)));

    // List of groups (i.e., the years)
    var groups = Array.from(new Set(processedData.map(d => d.aired_from_year))).sort();

    // Create color scale
    var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(d3.schemeCategory10);

    // Add X axis
    var x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding([0.2])
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(function(d) { 
        return "'" + String(d).slice(-2); 
    }));

    // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, d3.max(stackedData, function(d) { return d3.sum(subgroups, function(key) { return d[key]; }); })])
    .range([height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Add legend
    var legend = d3.select("#legend")
        .append("svg")
            .attr("width", 150)
            .attr("height", color.domain().length * 20)
        .selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    // Show the bars
    svg.append("g")
    .selectAll("g")
    .data(d3.stack().keys(subgroups)(stackedData))
    .join("g")
        .attr("fill", function(d) { return color(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .join("rect")
        .attr("x", function(d) { return x(d.data.year); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width",x.bandwidth());
}).catch(function(error){
    console.log(error);
});
