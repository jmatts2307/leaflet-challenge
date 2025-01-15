// Initialize the map
let myMap = L.map("map", {
    center: [20.0, 0.0],
    zoom: 2
});

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// URL for USGS GeoJSON data
let earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the earthquake data using D3
fetch(earthquakeUrl)
    .then(response => response.json())
    .then(data => {
        // Function to determine marker size based on magnitude
        function markerSize(magnitude) {
            return magnitude * 4;
        }

        // Function to determine marker color based on depth
        function markerColor(depth) {
            return depth > 90 ? "#ff5f65" :
                   depth > 70 ? "#fca35d" :
                   depth > 50 ? "#fdb72a" :
                   depth > 30 ? "#f7db11" :
                   depth > 10 ? "#dcf400" : "#a3f600";
        }

        // Add GeoJSON layer to the map
        L.geoJson(data, {
            // Use pointToLayer to create circle markers
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng);
            },
            // Style each circle marker
            style: function(feature) {
                return {
                    radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.8
                };
            },
            // Add popups to each marker
            onEachFeature: function(feature, layer) {
                layer.bindPopup(
                    `<strong>Location:</strong> ${feature.properties.place}<br>
                     <strong>Magnitude:</strong> ${feature.properties.mag}<br>
                     <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
                );
            }
        }).addTo(myMap);

        // Add a legend to the map
        let legend = L.control({ position: "bottomright"});

        legend.onAdd = function() {
            let div = L.DomUtil.create("div", "info legend");
            let depths = [-10, 10, 30, 50, 70, 90];
            let colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

            // Loop through depth intervals to generate labels
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    `<i style="background: ${colors[i]}"></i> ` +
                    `${depths[i]}${depths[i + 1] ? "&ndash;" + depths[i + 1] : "+"}<br>`;
            }

            return div;
        };

        legend.addTo(myMap);
    })
    .catch(error => console.error("Error loading earthquake data:", error));