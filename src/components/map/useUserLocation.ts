import { useCallback, useRef, useState } from 'react';
import L from 'leaflet';

export const useUserLocation = () => {
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const locateUser = useCallback((map: L.Map) => {
    setIsLocating(true);

    map.locate({ setView: true, maxZoom: 14 });

    map.once('locationfound', (e) => {
      setIsLocating(false);

      // Remove previous user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      // Create user location marker
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: hsl(200, 75%, 55%);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 8px hsla(200, 75%, 55%, 0.3), 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker(e.latlng, { icon: userIcon }).addTo(map);
      userMarkerRef.current.bindPopup('📍 Вы здесь').openPopup();
    });

    map.once('locationerror', () => {
      setIsLocating(false);
      console.error('Location access denied');
    });
  }, []);

  return { isLocating, locateUser };
};
