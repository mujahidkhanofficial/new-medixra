/**
 * Consolidated Database Setup Script
 * 
 * Handles everything Drizzle Kit `push` cannot manage:
 * - Storage bucket creation + RLS policies
 * - Database triggers (updated_at, new user, sensitive column protection)
 * - Enable RLS on all tables (idempotent)
 * 
 * Run: npm run db:setup
 * Or:  npm run db:full  (push schema + setup in one command)
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables before any DB imports
config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const { db, endConnection } = await import('./drizzle');
    const { sql } = await import('drizzle-orm');

    console.log('🔧 Running consolidated database setup...\n');

    // ─── 1. Enable RLS on all tables ─────────────────────────────
    console.log('🔒 Step 1/4: Enabling RLS on all tables...');
    await db.execute(sql`
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
    `);
    console.log('   ✅ RLS enabled on all tables.\n');

    // ─── 2. Database Triggers ────────────────────────────────────
    console.log('⚡ Step 2/4: Creating database triggers...');

    // 2a. Auto-update `updated_at` timestamp
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS trigger AS $$
        BEGIN
            new.updated_at = now();
            RETURN new;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
        CREATE TRIGGER set_profiles_updated_at
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_vendors_updated_at ON public.vendors;
        CREATE TRIGGER set_vendors_updated_at
            BEFORE UPDATE ON public.vendors
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_technicians_updated_at ON public.technicians;
        CREATE TRIGGER set_technicians_updated_at
            BEFORE UPDATE ON public.technicians
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
        CREATE TRIGGER set_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    `);
    console.log('   ✅ updated_at triggers created.\n');

    // 2b. Auto-create profile on signup
    console.log('👤 Step 3/4: Creating auth triggers & security functions...');
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, avatar_url, role, phone, approval_status)
            VALUES (
                new.id,
                new.email,
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'avatar_url',
                CASE
                    WHEN (new.raw_user_meta_data->>'role') IN ('vendor', 'technician')
                    THEN (new.raw_user_meta_data->>'role')
                    ELSE 'user'
                END,
                new.raw_user_meta_data->>'phone',
                CASE
                    WHEN (new.raw_user_meta_data->>'role') IN ('vendor', 'technician')
                    THEN 'pending'
                    ELSE 'approved'
                END
            );
            RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Drop and recreate to ensure it's up-to-date
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);

    // 2c. Prevent sensitive column updates (role, approval_status, is_verified, is_featured)
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION public.prevent_sensitive_updates()
        RETURNS trigger AS $$
        BEGIN
            -- Allow service_role full access (admin actions)
            IF (auth.jwt() ->> 'role') = 'service_role' THEN
                RETURN new;
            END IF;

            -- Protect profiles columns
            IF TG_TABLE_NAME = 'profiles' THEN
                IF new.role IS DISTINCT FROM old.role THEN
                    RAISE EXCEPTION 'You are not authorized to update the "role" field.';
                END IF;
                IF new.approval_status IS DISTINCT FROM old.approval_status THEN
                    RAISE EXCEPTION 'You are not authorized to update the "approval_status" field.';
                END IF;
            -- Protect vendors columns
            ELSIF TG_TABLE_NAME = 'vendors' THEN
                IF new.is_verified IS DISTINCT FROM old.is_verified THEN
                    RAISE EXCEPTION 'You are not authorized to update the "is_verified" field.';
                END IF;
                IF new.is_featured IS DISTINCT FROM old.is_featured THEN
                    RAISE EXCEPTION 'You are not authorized to update the "is_featured" field.';
                END IF;
            END IF;

            RETURN new;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS protect_profiles_sensitive_columns ON public.profiles;
        CREATE TRIGGER protect_profiles_sensitive_columns
            BEFORE UPDATE ON public.profiles
            FOR EACH ROW EXECUTE PROCEDURE public.prevent_sensitive_updates();

        DROP TRIGGER IF EXISTS protect_vendors_sensitive_columns ON public.vendors;
        CREATE TRIGGER protect_vendors_sensitive_columns
            BEFORE UPDATE ON public.vendors
            FOR EACH ROW EXECUTE PROCEDURE public.prevent_sensitive_updates();
    `);
    console.log('   ✅ Auth trigger + sensitive column protection created.\n');

    // ─── 3. Storage Setup ────────────────────────────────────────
    console.log('📦 Step 4/4: Setting up storage bucket & policies...');
    try {
        // 3a. Create bucket
        await db.execute(sql`
            INSERT INTO storage.buckets (id, name, public)
            VALUES ('products', 'products', true)
            ON CONFLICT (id) DO UPDATE SET public = true
        `);
        console.log('   ✅ Storage bucket created.');

        // 3b. Enable RLS on storage objects
        await db.execute(sql`ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY`);

        // 3c. Public read policy
        await db.execute(sql`DROP POLICY IF EXISTS "Public Access" ON storage.objects`);
        await db.execute(sql`
            CREATE POLICY "Public Access"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'products')
        `);

        // 3d. Authenticated upload policy
        await db.execute(sql`DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects`);
        await db.execute(sql`
            CREATE POLICY "Authenticated Upload"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'products'
                AND auth.role() = 'authenticated'
            )
        `);

        // 3e. Owner update/delete policies — handle both `owner` and `owner_id` column names
        // Supabase v2.x uses `owner_id`, older versions use `owner`
        let ownerCol = 'owner_id';
        try {
            // Test if owner_id column exists
            await db.execute(sql`SELECT owner_id FROM storage.objects LIMIT 0`);
        } catch {
            ownerCol = 'owner';
        }

        await db.execute(sql`DROP POLICY IF EXISTS "Users can update own images" ON storage.objects`);
        await db.execute(sql.raw(`
            CREATE POLICY "Users can update own images"
            ON storage.objects FOR UPDATE
            USING (bucket_id = 'products' AND auth.uid() = ${ownerCol})
        `));

        await db.execute(sql`DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects`);
        await db.execute(sql.raw(`
            CREATE POLICY "Users can delete own images"
            ON storage.objects FOR DELETE
            USING (bucket_id = 'products' AND auth.uid() = ${ownerCol})
        `));

        console.log(`   ✅ Storage policies created (owner column: ${ownerCol}).\n`);
    } catch (storageError: any) {
        const errMsg = storageError?.message || String(storageError);
        const errCode = storageError?.code || 'unknown';
        console.log(`   ⚠️  Storage setup skipped (code: ${errCode}): ${errMsg}`);
        console.log('   This is expected if your DATABASE_URL user lacks storage schema access.');
        console.log('   The "products" bucket should be created via Supabase Dashboard → Storage.\n');
    }

    // ─── Done ────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════');
    console.log('✅ Database setup complete!');
    console.log('   Tables & RLS policies → managed by Drizzle (db:push)');
    console.log('   Triggers & storage    → managed by this script (db:setup)');
    console.log('═══════════════════════════════════════════');

    await endConnection();
    process.exit(0);
}

main().catch(async (error) => {
    console.error('\n❌ Setup failed:', error.message || error);
    try {
        const { endConnection } = await import('./drizzle');
        await endConnection();
    } catch { /* ignore */ }
    process.exit(1);
});
