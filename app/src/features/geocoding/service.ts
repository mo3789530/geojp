import { sql } from "../../lib/db";

export interface AddressResult {
    lat: number;
    lon: number;
    prefecture: string;
    city: string;
    town: string;
    sub_town: string;
    block: string;
    distance_km: number;
}

export async function reverseGeocode(lat: number, lon: number, limit: number = 5): Promise<AddressResult[]> {
    // Note: <-> operator returns distance in degrees for geometry type (if SRID=4326/default)
    // To get meters/km properly, we should ideally cast to geography or use ST_DistanceSphere.
    // However, for sorting "closest", <-> on geometry is fine if we assume locally flat or just want nearest neighbors.
    // But to return "distance_km", we should use ST_DistanceSphere or similar.
    // Let's assume the table has a geometry column 'geom'.
    
    try {
        const results = await sql<AddressResult[]>`
            SELECT 
                lat, 
                lon, 
                prefecture, 
                city, 
                town, 
                sub_town, 
                block,
                ST_DistanceSphere(geom, ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)) / 1000.0 as distance_km
            FROM address_master
            WHERE representative_flag = true
            ORDER BY geom <-> ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)
            LIMIT ${limit}
        `;
        return results;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        throw error;
    }
}
