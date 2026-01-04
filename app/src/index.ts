import { Hono } from "hono";
import { checkConnection } from "./lib/db";
import { validateCoordinates } from "./features/geocoding/validation";
import { reverseGeocode } from "./features/geocoding/service";

const app = new Hono();

// Check DB connection on startup, unless in test mode
if (process.env.NODE_ENV !== 'test') {
    checkConnection();
}

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.get("/health", async (c) => {
    const isConnected = await checkConnection();
    if (isConnected) {
        return c.json({ status: "ok", db: "connected" });
    } else {
        return c.json({ status: "error", db: "disconnected" }, 500);
    }
});

app.get("/reverse-geocode", async (c) => {
    const latStr = c.req.query("lat");
    const lonStr = c.req.query("lon");

    if (!latStr || !lonStr) {
        return c.json({ error: "Missing lat or lon query parameters" }, 400);
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    const validation = validateCoordinates(lat, lon);
    if (!validation.valid) {
        return c.json({ error: validation.error }, 400);
    }

    try {
        const results = await reverseGeocode(lat, lon);
        return c.json({ results });
    } catch (e) {
        console.error(e);
        return c.json({ error: "Internal Server Error" }, 500);
    }
});

export default app;
