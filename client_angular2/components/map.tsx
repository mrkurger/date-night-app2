'use client';

import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Skeleton } from '@/components/ui/skeleton';

// Fix Leaflet marker icon issue in Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
};

interface MapMarker {
  id: string;
  position: [number, number]; // [longitude, latitude]
  popup?: string;
  status?: 'planned' | 'active' | 'completed' | 'cancelled' | 'current';
}

interface MapProps {
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
  markers?: MapMarker[];
  onMapLoad?: () => void;
  onMarkerClick?: (markerId: string) => void;
}

export default function Map({
  center = [10.7522, 59.9139], // Oslo coordinates as default
  zoom = 6,
  markers = [],
  onMapLoad,
  onMarkerClick,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the map
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix Leaflet's icon issue in Next.js
    fixLeafletIcons();

    // Create the map instance
    mapRef.current = L.map(mapContainerRef.current).setView(
      [center[1], center[0]], // Leaflet uses [lat, lng] while we use [lng, lat]
      zoom,
    );

    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Create a layer group for markers
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    // Notify that the map has loaded
    setIsLoading(false);
    if (onMapLoad) {
      onMapLoad();
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center[1], center[0]], zoom);
  }, [center, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach(marker => {
      const markerIcon = getMarkerIcon(marker.status);

      const leafletMarker = L.marker(
        [marker.position[1], marker.position[0]], // Convert to [lat, lng]
        { icon: markerIcon },
      ).addTo(markersLayerRef.current!);

      // Add popup if provided
      if (marker.popup) {
        leafletMarker.bindPopup(marker.popup);
      }

      // Add click handler if provided
      if (onMarkerClick) {
        leafletMarker.on('click', () => {
          onMarkerClick(marker.id);
        });
      }
    });
  }, [markers, onMarkerClick]);

  // Helper function to get marker icons based on status
  const getMarkerIcon = (status?: string) => {
    const defaultIcon = new L.Icon.Default();

    if (!status) return defaultIcon;

    // Define custom icons for different statuses
    // These could be replaced with actual custom icons in a production app
    switch (status) {
      case 'planned':
        return new L.Icon({
          iconUrl: '/leaflet/marker-icon-blue.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x-blue.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      case 'active':
        return new L.Icon({
          iconUrl: '/leaflet/marker-icon-green.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x-green.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      case 'completed':
        return new L.Icon({
          iconUrl: '/leaflet/marker-icon-grey.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x-grey.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      case 'cancelled':
        return new L.Icon({
          iconUrl: '/leaflet/marker-icon-red.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x-red.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      case 'current':
        return new L.Icon({
          iconUrl: '/leaflet/marker-icon-gold.png',
          iconRetinaUrl: '/leaflet/marker-icon-2x-gold.png',
          shadowUrl: '/leaflet/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });
      default:
        return defaultIcon;
    }
  };

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-md" />;
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-md"
      style={{ minHeight: '400px' }}
    />
  );
}
