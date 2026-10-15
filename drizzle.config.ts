import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) throw new Error("Database url is required")

export default defineConfig({
    out: './drizzle',
    schema: "./src/infrastructure/database/schema/index.ts",
    dialect: 'postgresql',
    dbCredentials: {
        url: dbUrl
    }
})