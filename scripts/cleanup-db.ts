
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

// Load env vars immediately
config({ path: '.env.local' });

async function main() {
    // Dynamic import to ensure env vars are loaded before db connection is initialized
    const { db } = await import('../lib/db/drizzle');

    console.log('Dropping users_test_drizzle table...');
    try {
        await db.execute(sql`DROP TABLE IF EXISTS users_test_drizzle`);
        console.log('Table dropped successfully.');
    } catch (error) {
        console.error('Error dropping table:', error);
    }
    process.exit(0);
}

main();
