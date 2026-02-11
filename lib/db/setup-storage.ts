
import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const { db } = await import('./drizzle');
    const { sql } = await import('drizzle-orm');

    console.log('🔒 Securing STORAGE buckets with RLS policies...');

    try {
        // Enable RLS on storage.objects if not already (it usually is)
        // We cannot execute ALTER TABLE on storage schemas easily via Drizzle sometimes if permissions deny, 
        // but usually postgres connection has admin if using the connection string from Supabase dashboard.
        // However, storage policies are row inserts into storage.policies? No, they are standard Postgres policies on storage.objects.

        await db.execute(sql`
      -- Create bucket if not exists (idempotent-ish check)
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('products', 'products', true)
      ON CONFLICT (id) DO NOTHING;

      -- STORAGE POLICIES for "products" bucket
      -- 1. Public Select (View)
      DROP POLICY IF EXISTS "Public Access" ON storage.objects; 
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'products');

      -- 2. Authenticated Upload
      -- Allow any authenticated user to upload to "products" bucket
      -- Ideally restrict by folder name matching user ID or product ID ownership, but simply allowing auth inserts is a good start if missing.
      DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
      CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
      WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
      );

      -- 3. Owner Delete/Update
      DROP POLICY IF EXISTS "Owner Manage" ON storage.objects;
      CREATE POLICY "Owner Manage" ON storage.objects FOR ALL 
      USING (
        bucket_id = 'products' 
        AND auth.uid() = owner
      );
    `);

        console.log('✅ Storage RLS Policies applied successfully.');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ Failed to apply storage policies:', error.message);
        // process.exit(1); 
        // Try to proceed even if failed? No.
        process.exit(1);
    }
}

main();
