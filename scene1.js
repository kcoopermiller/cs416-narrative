export default function s1() {
    // Set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    var svg = d3.select("#my_dataviz")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Load the data
    d3.json("data/anime_filtered.csv.json").then(function(animeData) {

        // Pre-process the data: extract year from 'aired.from' and convert to number
        animeData.forEach(function(d) {
            if (d.aired) {
                d.aired_from_year = new Date(d.aired).getFullYear();
            }
        });

        // Filter out entries where aired_from_year is NaN
        animeData = animeData.filter(function(d) {
            return !isNaN(d.aired_from_year);
        });

        // Filter out data before 1960
        animeData = animeData.filter(function(d) {
            return d.aired_from_year >= 1960;
        });

        // Group the data by year
        var dataByYear = d3.group(animeData, d => d.aired_from_year); 

        // Create an array with the number of anime shows per year
        var data = Array.from(dataByYear, ([year, shows]) => ({year, count: shows.length}));

        // Sort the data by year
        data.sort(function(a, b) {
            return a.year - b.year;
        });

        // X scale and axis
        var x = d3.scaleLinear()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Y scale and axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.count; })])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Line generator
        var line = d3.line()
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.count); });

        // Create the line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", line);

    }).catch(function(error){
    console.log(error);
    });
}