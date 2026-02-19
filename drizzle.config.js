
const dotenv = require('dotenv');
const { defineConfig } = require('drizzle-kit');

dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not defined');

module.exports = defineConfig({
    schema: './lib/db/schema.ts',
    out: './supabase/migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
