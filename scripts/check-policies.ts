
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

async function checkPolicies() {
    const policies = await sql`
        SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
        FROM pg_policies 
        WHERE tablename = 'profiles';
    `;
    console.log(JSON.stringify(policies, null, 2));
    await sql.end();
}

checkPolicies();
