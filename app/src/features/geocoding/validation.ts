export function validateCoordinates(lat: number, lon: number): { valid: boolean; error?: string } {
    if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
        return { valid: false, error: "Latitude and longitude must be numbers" };
    }

    if (lat < -90 || lat > 90) {
        return { valid: false, error: "Latitude must be between -90 and 90" };
    }

    if (lon < -180 || lon > 180) {
        return { valid: false, error: "Longitude must be between -180 and 180" };
    }

    // Japan bounding box check (approximate)
    // Based on requirements: Lat 24-45, Lon 123-146
    const MIN_LAT_JP = 24;
    const MAX_LAT_JP = 45;
    const MIN_LON_JP = 123;
    const MAX_LON_JP = 146;

    if (lat < MIN_LAT_JP || lat > MAX_LAT_JP || lon < MIN_LON_JP || lon > MAX_LON_JP) {
        return { valid: false, error: "Coordinates are outside of Japan's range (Lat: 24-45, Lon: 123-146)" };
    }

    return { valid: true };
}
