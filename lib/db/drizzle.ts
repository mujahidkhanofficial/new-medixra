
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

const client = (() => {
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
export const db = drizzle(client);