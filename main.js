import s1 from "./scene1.js";
import s2 from "./scene2.js";
import s3 from "./scene3.js";

// Include your scenes as JavaScript functions
const scenes = [s1, s2, s3];

let currentSceneIndex = 0;

// Function to generate the current scene
function generateScene() {
    // Clear the previous scene
    d3.select("#my_dataviz").html("");

    // Scene descriptions
    const sceneDescriptions = [
        "Scene 1: This is a visualization of the number of anime shows produced over the years.",
        "Scene 2: This scene breaks down the number of anime shows each year according to genre.",
        "Scene 3: This scene displays a scatter plot showing the relationship between user ratings and the number of users who watched a certain genre. Hover over points for more details"
    ];
    
    // Update the scene description
    d3.select("#sceneDescription").text(sceneDescriptions[currentSceneIndex]);

    // Generate the current scene
    scenes[currentSceneIndex]();

    // Enable or disable the Previous button
    d3.select("#prevButton")
        .property("disabled", currentSceneIndex === 0);

    // Enable or disable the Next button
    d3.select("#nextButton")
        .property("disabled", currentSceneIndex === scenes.length - 1);

    // Hide or display the legend depending on the current scene
    if (currentSceneIndex === 1) { // If it's Scene 2 (0-indexed)
        d3.select("#legend").style("display", "block");
    } else {
        d3.select("#legend").style("display", "none");
    }
}

// Initial scene generation
generateScene();

// Set up the event listener for the Previous button
d3.select("#prevButton")
    .on("click", function() {
        currentSceneIndex--;
        generateScene();
    });

// Set up the event listener for the Next button
d3.select("#nextButton")
    .on("click", function() {
        currentSceneIndex++;
        generateScene();
    });
