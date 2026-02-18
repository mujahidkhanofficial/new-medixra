
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';

// Load env vars
config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.DATABASE_URL) {
    config({ path: path.resolve(process.cwd(), '.env') });
}

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
    console.error('Environment variables loaded:', process.env); // Debug what we have
    throw new Error('DATABASE_URL or DIRECT_URL is missing. Checked .env.local and .env');
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function fixProfile() {
    const userId = '5f3ae084-8e09-48cd-93fe-d0f5a8f16979'; // The ID from your screenshot

    console.log(`Checking profile for user: ${userId}`);

    const existing = await db.query.profiles.findFirst({
        where: eq(schema.profiles.id, userId),
    });

    if (existing) {
        console.log('Profile already exists:', existing);
        // If it exists but role is null, update it
        if (!existing.role) {
            console.log('Role is null, updating to "user"...');
            await db.update(schema.profiles)
                .set({ role: 'user', status: 'active', approvalStatus: 'approved' })
                .where(eq(schema.profiles.id, userId));
            console.log('Updated.');
        }
    } else {
        console.log('Profile missing. Creating default "user" profile...');
        await db.insert(schema.profiles).values({
            id: userId,
            email: 'imujahidafridi@gmail.com', // From screenshot
            fullName: 'User', // Placeholder
            role: 'user',
            status: 'active',
            approvalStatus: 'approved'
        });
        console.log('Created.');
    }

    await client.end();
}

fixProfile().catch(console.error);
