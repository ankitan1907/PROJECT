import mapboxgl from 'mapbox-gl';

// Log the token to check if it's loaded correctly
console.log("Mapbox Token:", process.env.REACT_APP_MAPBOX_TOKEN);

// Load the Mapbox token from environment variable
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;


// Export mapboxgl to use it in your components
export default mapboxgl;
