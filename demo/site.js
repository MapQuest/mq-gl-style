
var map = new mapboxgl.Map({
    container: 'map',
    zoom: 9,
    center: [40.3, -76.4],
    style: '../style.json',
    hash: true
});

map.addControl(new mapboxgl.Navigation());
