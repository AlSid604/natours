export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYWxzaWQ2MDQiLCJhIjoiY2t6M3Q1NWp3MDl1czJub2YxejJ4ajFqaCJ9.tcDOUXKBB4HRABap_eejKA';

  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/alsid604/ckz3tud81000b14uvokny9mdf', // style URL
    scrollZoom: false

    // center: [-118.115824, 34.11373], // starting position [lng, lat]
    // zoom: 9 // starting zoom
    // interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    //create marker
    const el = document.createElement('div');
    el.className = 'marker';

    //add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' //point on marker is right on gps point
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    //add pop up
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    //extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
