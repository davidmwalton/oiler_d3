(function () {
    'use strict';
    
    const WIDTH = 2000;
    const HEIGHT = 2000;

    let projection = d3["geoOrthographic"]().precision(0.1);
    let sphere = {type: "Sphere"};
    let graticule = d3.geoGraticule10()

    function attachEventListeners() {
        let drawStatesButton = document.getElementById('draw-states');
        let drawCountriesButton = document.getElementById('draw-countries');

        drawStatesButton.addEventListener('click', drawStates);
        drawCountriesButton.addEventListener('click', drawCountries);
    }

    function drawStates() {
        let republicanStatesPath = "./republican-states.json";

        d3.json(republicanStatesPath)
            .then(
                drawChart
            );
    }

    function drawCountries() {
        let countriesFilePath = "./countries-110m.json";

        d3.json(countriesFilePath)
            .then(
                countriesData => {
                    let geoJsonData = topojson.feature(countriesData, countriesData.objects.countries);
                    drawChart(geoJsonData);
                }
            );
    }

    function drawChart(countries110) {
        let canvas = document.getElementById('canvas');
        let context = canvas.getContext('2d')
        
        let path = d3.geoPath(projection, context);
        
        function render(countries) {
            context.clearRect(0, 0, WIDTH, HEIGHT);
            context.beginPath(), path(sphere), context.fillStyle = "#fff", context.fill();
            context.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
            context.beginPath(), path(countries), context.fillStyle = "#ff0000", context.fill();
            context.beginPath(), path(sphere), context.stroke();
        }
        
        return d3.select(context.canvas)
                    .call(drag(projection)
                            .on("drag.render", () => render(countries110))
                    )
                    .call(() => render(countries110))
                    .node();
    }

    function drag(projection) {
        let v0, q0, r0;
        
        function dragstarted() {
            v0 = versor.cartesian(projection.invert([d3.event.x, d3.event.y]));
            q0 = versor(r0 = projection.rotate());
        }
        
        function dragged() {
            let v1 = versor.cartesian(projection.rotate(r0).invert([d3.event.x, d3.event.y]));
            let q1 = versor.multiply(q0, versor.delta(v0, v1));
            projection.rotate(versor.rotation(q1));
        }
        
        return d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged);
    }

    attachEventListeners();
})();
