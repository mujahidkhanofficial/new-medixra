
import { config } from 'dotenv';
import postgres from 'postgres';
import path from 'path';

// Load env vars
config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.DATABASE_URL) {
    config({ path: path.resolve(process.cwd(), '.env') });
}

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString) throw new Error('No DB URL');

const sql = postgres(connectionString);

async function fixPolicies() {
    console.log('Fixing "Public Profiles" policy...');

    // Drop the existing policy
    await sql`DROP POLICY IF EXISTS "Public Profiles" ON profiles`;

    // Recreate it explicitly
    await sql`
        CREATE POLICY "Public Profiles" 
        ON profiles 
        FOR SELECT 
        TO public 
        USING (true);
    `;

    console.log('Policy recreated.');

    // Check if it looks correct now
    const policies = await sql`SELECT * FROM pg_policies WHERE policyname = 'Public Profiles'`;
    console.log('Policy check:', policies);

    await sql.end();
}

fixPolicies().catch(console.error);
