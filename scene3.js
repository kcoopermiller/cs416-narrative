export default function s3() {
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
                    genre: genre,
                    score: +d.score,
                    members: +d.members
                });
            });
        });

        // Group the data by genre, and calculate the total members and average score for each genre
        var dataByGenre = d3.rollup(processedData, 
            v => ({totalMembers: d3.sum(v, d => d.members), averageScore: d3.mean(v, d => d.score)}), 
            d => d.genre);

        // Convert the Map to an array for plotting
        var plotData = Array.from(dataByGenre, ([key, value]) => ({genre: key, ...value}));

        // Create color scale for the genres
        var color = d3.scaleOrdinal()
        .domain(plotData.map(d => d.genre))
        .range(d3.schemeTableau10);

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

        // Add X axis
        var x = d3.scaleLinear()
            .domain(d3.extent(plotData, d => d.averageScore))
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(plotData, d => d.totalMembers)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Show the dots
        svg.append('g')
            .selectAll("dot")
            .data(plotData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.averageScore))
            .attr("cy", d => y(d.totalMembers))
            .attr("r", 5)
            .style("fill", d => color(d.genre))
            .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1)
                    .html("Genre: " + d.genre + "<br>Avg Score: " + d.averageScore.toFixed(2) + "<br>Members: " + d.totalMembers)
                    .style("left", (d3.pointer(event)[0]+30) + "px")
                    .style("top", (d3.pointer(event)[1]+30) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.style("opacity", 0);
            });

    }).catch(function(error){
            console.log(error);
    });
}