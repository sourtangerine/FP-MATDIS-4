/**
 * OSRM (Open Source Routing Machine) integration
 * Uses the free public demo server for road-based routing
 * Returns actual road-following coordinates
 */

interface OSRMRoute {
  coordinates: [number, number][]; // [lat, lng] pairs
  distance: number; // meters
  duration: number; // seconds
}

/**
 * Get a road-following route between two points using OSRM
 * @param startLat - Start latitude
 * @param startLng - Start longitude
 * @param endLat - End latitude
 * @param endLng - End longitude
 * @returns Route with coordinates following roads, distance in km
 */
export async function getOSRMRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number
): Promise<OSRMRoute | null> {
  try {
    // OSRM uses lng,lat order (opposite of Leaflet)
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    // OSRM returns [lng, lat], convert to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      coordinates,
      distance: route.distance / 1000, // convert meters to km
      duration: route.duration, // seconds
    };
  } catch (error) {
    console.error("OSRM routing error:", error);
    return null;
  }
}

/**
 * Get a road-following route through multiple waypoints
 * @param waypoints - Array of [lat, lng] pairs
 * @returns Route with coordinates following roads
 */
export async function getOSRMMultiRoute(
  waypoints: [number, number][]
): Promise<OSRMRoute | null> {
  if (waypoints.length < 2) return null;

  try {
    // Build coordinate string: lng,lat;lng,lat;...
    const coordString = waypoints
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(";");

    const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      return null;
    }

    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (coord: [number, number]) => [coord[1], coord[0]]
    );

    return {
      coordinates,
      distance: route.distance / 1000,
      duration: route.duration,
    };
  } catch (error) {
    console.error("OSRM multi-route error:", error);
    return null;
  }
}
