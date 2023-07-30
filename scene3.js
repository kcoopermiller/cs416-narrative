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
    // Pre-process the data: convert 'score', 'members', and 'episodes' to numbers,
    // and extract the year from the 'aired' field
    animeData.forEach(function(d) {
        d.score = +d.score;
        d.members = +d.members;
        d.episodes = +d.episodes;
        d.aired_from_year = new Date(d.aired.from).getFullYear();
    });

    // Create a color scale for the years
    var color = d3.scaleSequential()
        .domain(d3.extent(animeData, function(d) { return d.aired_from_year; }))
        .interpolator(d3.interpolateBlues);

    // Create a size scale for the number of episodes
    var size = d3.scaleLinear()
        .domain(d3.extent(animeData, function(d) { return d.episodes; }))
        .range([4, 20]);

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(animeData, function(d) { return d.score; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(animeData, function(d) { return d.members; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add a tooltip div (initially hidden)
    var tooltip = d3.select("#my_dataviz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Show the dots
    svg.append('g')
        .selectAll("dot")
        .data(animeData)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.score); })
        .attr("cy", function(d) { return y(d.members); })
        .attr("r", function(d) { return size(d.episodes); })
        .style("fill", function(d) { return color(d.aired_from_year); })
        .style("opacity", 0.5)
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1)
                .html("Title: " + d.title + "<br>Score: " + d.score + "<br>Members: " + d.members)
                .style("left", (d3.pointer(event)[0]+30) + "px")
                .style("top", (d3.pointer(event)[1]+30) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("opacity", 0);
        });
}).catch(function(error){
        console.log(error);
});
    