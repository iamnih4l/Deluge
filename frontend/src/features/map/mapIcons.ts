import type { Map } from 'maplibre-gl';

const ICONS = {
  drone: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2338BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M7.5 7.5l9 9M16.5 7.5l-9 9"/></svg>`,
  heli: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23FBBF24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16M12 2v8M12 14v8M2 18h20M9 22h6"/></svg>`,
  rescue_boat: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23F43F5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0M4 6h16l-2 4H6Z"/></svg>`,
  ground_unit: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2334D399" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>`
};

export function loadMapIcons(map: Map) {
  Object.entries(ICONS).forEach(([name, url]) => {
    const img = new Image(24, 24);
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (!map.hasImage(name)) {
        map.addImage(name, img);
      }
    };
    img.src = url;
  });
}
