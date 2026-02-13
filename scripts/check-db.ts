
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '../lib/db/drizzle';
import { products, profiles } from '../lib/db/schema'; // removed vendors as it might not be exported or used yet
import { desc } from 'drizzle-orm';

async function main() {
    console.log('DATABASE_URL is defined:', !!process.env.DATABASE_URL);
    if (process.env.DATABASE_URL) {
        console.log('DATABASE_URL length:', process.env.DATABASE_URL.length);
        console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 10) + '...');
        try {
            const url = new URL(process.env.DATABASE_URL);
            console.log('Parsed Username present:', !!url.username);
            console.log('Parsed Password present:', !!url.password);
            console.log('Parsed Host:', url.hostname);
            console.log('Parsed Port:', url.port);
        } catch (e) {
            console.error('Failed to parse URL:', e);
        }
    } else {
        console.error('DATABASE_URL is missing!');
    }
    console.log('--- Checking DB Content ---');
    try {
        console.log('Querying products...');
        const allProducts = await db.select().from(products);
        console.log(`Total Products: ${allProducts.length}`);

        const lastProducts = await db.select().from(products).orderBy(desc(products.createdAt)).limit(5);
        console.log('Last 5 Products:');
        lastProducts.forEach(p => {
            console.log(`- ID: ${p.id}, Name: ${p.name}, Vendor: ${p.vendorId}, Created: ${p.createdAt}, Status: ${p.status}`);
        });

        console.log('\nQuerying profiles...');
        const profileList = await db.select().from(profiles).limit(5);
        console.log('Sample Profiles:', profileList.map(p => ({ id: p.id, email: p.email })));

    } catch (e) {
        console.error('Error querying DB:', e);
    }
    process.exit(0);
}

main();
