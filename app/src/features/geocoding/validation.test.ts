import { describe, expect, test } from "bun:test";
import { validateCoordinates } from "./validation";

describe("validateCoordinates", () => {
    test("should validate correct coordinates within Japan", () => {
        const result = validateCoordinates(35.6762, 139.6503); // Tokyo
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    test("should reject non-number inputs", () => {
        // @ts-ignore
        const result = validateCoordinates("35", 139);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("must be numbers");
    });

    test("should reject latitude out of global bounds", () => {
        const result = validateCoordinates(91, 139);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Latitude must be between -90 and 90");
    });

    test("should reject longitude out of global bounds", () => {
        const result = validateCoordinates(35, 181);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Longitude must be between -180 and 180");
    });

    test("should reject coordinates outside Japan (too south)", () => {
        const result = validateCoordinates(20, 139);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Coordinates are outside of Japan's range");
    });

    test("should reject coordinates outside Japan (too east)", () => {
        const result = validateCoordinates(35, 150);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("Coordinates are outside of Japan's range");
    });
});
