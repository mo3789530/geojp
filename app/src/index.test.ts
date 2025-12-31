import { describe, expect, test, mock } from "bun:test";

// Mock the dependencies BEFORE importing app
mock.module("./lib/db", () => ({
    checkConnection: () => Promise.resolve(true),
    sql: mock(() => Promise.resolve([
        {
            lat: 35.6762,
            lon: 139.6503,
            prefecture: "Tokyo",
            city: "Minato-ku",
            town: "Akasaka",
            sub_town: "",
            block: "",
            distance_km: 0.0
        },
        {
            lat: 35.6763,
            lon: 139.6504,
            prefecture: "Tokyo",
            city: "Minato-ku",
            town: "Akasaka",
            sub_town: "",
            block: "",
            distance_km: 0.1
        }
    ]))
}));

const app = (await import("./index")).default;

describe("GET /reverse-geocode", () => {
    test("should return 200 and results for valid coordinates", async () => {
        const res = await app.request("/reverse-geocode?lat=35.6762&lon=139.6503");
        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.results).toBeArray();
        expect(body.results).toHaveLength(2);
        expect(body.results[0].prefecture).toBe("Tokyo");
    });

    test("should return 400 for missing parameters", async () => {
        const res = await app.request("/reverse-geocode?lat=35.6762");
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain("Missing");
    });

    test("should return 400 for invalid coordinates", async () => {
        const res = await app.request("/reverse-geocode?lat=100&lon=139.6503");
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain("Latitude must be between -90 and 90");
    });

    test("should return 400 for coordinates outside Japan", async () => {
        const res = await app.request("/reverse-geocode?lat=20&lon=130");
        expect(res.status).toBe(400);
        const body = await res.json();
        expect(body.error).toContain("outside of Japan");
    });
});
