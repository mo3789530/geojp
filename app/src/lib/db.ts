import { SQL } from "bun";

const DB_URL = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:15432/geo";

export const sql = new SQL(DB_URL);

export async function checkConnection() {
    try {
        const result = await sql`SELECT 1 as connected`;
        console.log("Database connection successful:", result);
        return true;
    } catch (error) {
        console.error("Database connection failed:", error);
        return false;
    }
}
