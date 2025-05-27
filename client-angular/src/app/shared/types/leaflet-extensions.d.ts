import * as L from 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    chunkedLoading?: boolean;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
  }

  interface MarkerClusterGroup extends L.FeatureGroup {
    clearLayers(): this;
    addLayer(layer: L.Layer): this;
    addLayers(layers: L.Layer[]): this;
    removeLayers(layers: L.Layer[]): this;
    removeLayer(layer: L.Layer): this;
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: [number, number, number][]): this;
    addLatLng(latlng: [number, number, number]): this;
    setOptions(options: HeatMapOptions): this;
  }

  interface HeatMapOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  namespace Control {
    interface ControlOptions {
      position?: string;
    }

    interface SearchOptions {
      position?: string;
      layer?: L.LayerGroup;
      initial?: boolean;
      zoom?: number;
      marker?: boolean | L.Marker;
      textPlaceholder?: string;
    }

    class Search extends L.Control {
      constructor(options?: SearchOptions);
      setLayer(layer: L.LayerGroup): Search;
      showAlert(text: string): Search;
      setError(text: string): Search;
    }

    function create(options?: ControlOptions): Control;
  }

  function control(options?: Control.ControlOptions): Control;
  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  function heatLayer(latlngs: [number, number, number][], options?: HeatMapOptions): HeatLayer;
}
