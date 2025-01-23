import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Button, Layout } from "antd";
import "mapbox-gl/dist/mapbox-gl.css";

import "./App.css";

const { Content, Sider } = Layout;
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
          showPointOfInterestLabels: {
            default: false,
            type: "boolean",
          },
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

    mapRef.current.on("load", () => {
      mapRef.current.addSource("maine", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            // These coordinates outline Maine.
            coordinates: [
              [
                [120.49697, 18.95121],
                [122.43684, 18.66603],
                [122.88326, 17.23721],
                [122.58618, 16.27372],
                [122.1417, 15.55601],
                [122.51229, 14.65742],
                [123.21115, 14.33353],
                [124.39093, 14.26876],
                [124.33966, 12.84369],
                [124.02755, 12.4829],
                [124.10925, 11.64898],
                [123.11862, 11.80398],
                [123.12372, 12.70715],
                [122.31692, 13.2545],
                [121.87267, 13.04068],
                [121.53565, 12.27841],
                [120.41528, 11.90892],
                [119.91997, 10.80754],
                [120.25699, 10.56669],
                [117.13635, 7.72396],
                [116.69721, 8.04262],
                [119.12354, 10.74386],
                [119.7423, 12.35563],
                [120.14559, 13.40121],
                [119.86474, 13.8528],
                [120.45197, 14.0758],
                [119.96176, 14.74347],
                [119.63495, 16.51834],
                [120.08942, 16.37141],
                [120.22729, 16.18515],
                [120.18644, 16.91936],
                [120.52346, 18.7325],
              ],
            ],
          },
        },
      });

      mapRef.current.addLayer({
        id: "maine",
        type: "fill",
        source: "maine",
        layout: {},
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });

      mapRef.current.addLayer({
        id: "outline",
        type: "line",
        source: "maine",
        layout: {},
        paint: {
          "line-color": "#000",
          "line-width": 3,
        },
      });
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
    <Layout>
      {/* <div className="sidebar">
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} |
        Zoom: {zoom.toFixed(2)}
      </div> */}
      <Content style={{ minHeight: "100vh" }}>
        <div id="map-container" ref={mapContainerRef}></div>
      </Content>
      <Sider style={{ backgroundColor: "white" }}>
        Longitude: {center[0].toFixed(4)} | Latitude: {center[1].toFixed(4)} |
        Zoom: {zoom.toFixed(2)}
        <Button className="reset-button" onClick={handleButtonClick}>
          Reset
        </Button>
        {/* <div className="map-overlay top">
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
        </div> */}
      </Sider>
    </Layout>
  );
}

export default App;
