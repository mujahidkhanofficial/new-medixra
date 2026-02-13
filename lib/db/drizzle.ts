import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection leaks during hot reloads in development
const globalForDb = global as unknown as {
    client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client || (() => {
    try {
        const url = new URL(connectionString);
        return postgres({
            host: url.hostname,
            port: parseInt(url.port || '5432'),
            database: url.pathname.slice(1),
            user: url.username,
            password: decodeURIComponent(url.password),
            ssl: 'require',
            prepare: false,
        });
    } catch (err) {
        return postgres(connectionString, { prepare: false });
    }
})();

if (process.env.NODE_ENV !== 'production') globalForDb.client = client;

export const db = drizzle(client, { schema });