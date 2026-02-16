import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL is missing. Database connection will fail.')
}

const connectionString = process.env.DATABASE_URL!;

// Singleton pattern to prevent connection leaks during hot reloads in development
const globalForDb = global as unknown as {
    client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client || (() => {
    if (!connectionString) {
        // Return a dummy client or handle gracefully if absolutely needed, 
        // but likely we just want to avoid crashing the module.
        // For now, let's create a dummy that will fail on query, not on import.
        return postgres('postgres://user:pass@localhost:5432/db', { prepare: false });
    }

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
export const endConnection = () => client.end();