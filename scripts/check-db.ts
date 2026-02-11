
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

import { db } from '../lib/db/drizzle';
import { products, profiles } from '../lib/db/schema'; // removed vendors as it might not be exported or used yet
import { desc } from 'drizzle-orm';

async function main() {
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
