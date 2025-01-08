import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";

import "./App.css";

const INITIAL_CENTER: mapboxgl.LngLatLike = [122.86489, 12.1434];
const INITIAL_ZOOM = 5.58;

const BOUNDS: mapboxgl.LngLatBoundsLike = [
  [62.88668, -13.30708],
  [179.52986, 28.72444],
];

function App() {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<any>(null);

  const [center, setCenter] = useState(INITIAL_CENTER);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiaXJuYW5vIiwiYSI6ImNsYmQyNjJkdjAzbTUzbm1zN2kwN3JjamMifQ._pIfJQII-zFz0RJ2vWWfxA";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      maxBounds: BOUNDS,
      // zoom: 16.2,
      // pitch: 80,
      // bearing: -170,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // Use the Mapbox Standard style
      config: {
        // Initial configuration for the Mapbox Standard style set above. By default, its ID is `basemap`.
        basemap: {
          // Here, we're disabling all of the 3D layers such as landmarks, trees, and 3D extrusions.
          show3dObjects: true,
        },
      },
    });

    mapRef.current.on("move", () => {
      // get the current center coordinates and zoom level from the map
      const mapCenter = mapRef.current?.getCenter() ?? INITIAL_CENTER;
      const mapZoom = mapRef.current?.getZoom() ?? INITIAL_ZOOM;

      // update state
      setCenter([mapCenter.lng, mapCenter.lat]);
      setZoom(mapZoom);
    });

    mapRef.current.on("style.load", () => {
      mapRef.current.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      // add the DEM source as a terrain layer with exaggerated height
      mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
    });

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  const handleButtonClick = () => {
    mapRef.current.flyTo({
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
  };

  return (
    <>
      <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} |
        Zoom: {zoom.toFixed(2)}
      </div>
      <button className="reset-button" onClick={handleButtonClick}>
        Reset
      </button>
      <div id="map-container" ref={mapContainerRef}></div>
      <div className="map-overlay top">
        <div className="map-overlay-inner">
          <fieldset>
            <label>Select projection</label>
            <select id="projection" name="projection">
              <option value="mercator">Mercator</option>
              <option value="globe">Globe</option>
              <option value="albers">Albers</option>
              <option value="equalEarth">Equal Earth</option>
              <option value="equirectangular">Equirectangular</option>
              <option value="lambertConformalConic" selected="">
                Lambert Conformal Conic
              </option>
              <option value="naturalEarth">Natural Earth</option>
              <option value="winkelTripel">Winkel Tripel</option>
            </select>
          </fieldset>
          <fieldset className="conic-param-input">
            <label>
              Center Longitude: <span id="lng-value">0</span>
            </label>
            <input
              id="lng"
              type="range"
              min="-180"
              max="180"
              step="any"
              value="0"
            />
          </fieldset>
          <fieldset className="conic-param-input">
            <label>
              Center Latitude: <span id="lat-value">30</span>
            </label>
            <input
              id="lat"
              type="range"
              min="-90"
              max="90"
              step="any"
              value="30"
            />
          </fieldset>
          <fieldset className="conic-param-input">
            <label>
              Southern Parallel Lat: <span id="lat1-value">30</span>
            </label>
            <input
              id="lat1"
              type="range"
              min="-90"
              max="90"
              step="any"
              value="30"
            />
          </fieldset>
          <fieldset className="conic-param-input">
            <label>
              Northern Parallel Lat: <span id="lat2-value">30</span>
            </label>
            <input
              id="lat2"
              type="range"
              min="-90"
              max="90"
              step="any"
              value="30"
            />
          </fieldset>
        </div>
      </div>
    </>
  );
}

export default App;
