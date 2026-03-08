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
// Load environment variables before any DB imports
config({ path: path.resolve(process.cwd(), '.env.local') });
if (!process.env.DATABASE_URL) {
    config({ path: path.resolve(process.cwd(), '.env') });
}

async function main() {
    const { db, endConnection } = await import('./drizzle');
    const { sql } = await import('drizzle-orm');

    console.log('🔧 Running consolidated database setup...\n');

    // ─── 1. Create product_analytics table manually to bypass Drizzle bug
    console.log('📊 Step 1/5: Creating product_analytics table...');
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS public.product_analytics (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
            vendor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            date text NOT NULL,
            views integer NOT NULL DEFAULT 0,
            inquiries integer NOT NULL DEFAULT 0,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now(),
            CONSTRAINT product_analytics_product_date_unique UNIQUE (product_id, date)
        );

        CREATE INDEX IF NOT EXISTS product_analytics_product_idx ON public.product_analytics (product_id);
        CREATE INDEX IF NOT EXISTS product_analytics_vendor_idx ON public.product_analytics (vendor_id);
        CREATE INDEX IF NOT EXISTS product_analytics_date_idx ON public.product_analytics (date);

        -- Add missing columns to vendors table
        ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS business_type text DEFAULT 'Retailer';
        ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS years_in_business text DEFAULT '1';
        
        -- Add missing analytics metrics to engineers 
        ALTER TABLE public.engineers ADD COLUMN IF NOT EXISTS views integer DEFAULT 0;
        ALTER TABLE public.engineers ADD COLUMN IF NOT EXISTS whatsapp_clicks integer DEFAULT 0;
    `);
    console.log('   ✅ product_analytics and vendor table columns active.\n');


    // ─── 1.5 Create blogs table manually ─────────────────────────
    console.log('📝 Step 1.5/5: Creating blogs table...');
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS public.blogs (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            title text NOT NULL,
            slug text UNIQUE NOT NULL,
            content text NOT NULL,
            excerpt text,
            cover_image_url text,
            meta_title text,
            meta_description text,
            status text NOT NULL DEFAULT 'draft',
            author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            published_at timestamp with time zone,
            created_at timestamp with time zone NOT NULL DEFAULT now(),
            updated_at timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS blogs_slug_idx ON public.blogs (slug);
        CREATE INDEX IF NOT EXISTS blogs_status_idx ON public.blogs (status);
        CREATE INDEX IF NOT EXISTS blogs_author_idx ON public.blogs (author_id);
    `);
    console.log('   ✅ blogs table active.\n');

    // ─── 1.6 Create community_messages table manually ─────────────
    console.log('💬 Step 1.6/5: Creating community_messages table...');
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS public.community_messages (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
            user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            reply_to_id uuid REFERENCES public.community_messages(id) ON DELETE SET NULL,
            content text NOT NULL,
            created_at timestamp with time zone NOT NULL DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS community_messages_created_idx ON public.community_messages (created_at);

        -- CRITICAL: Configure Postgres for WebSockets / Supabase Realtime
        -- Requires Replica Identity Full to capture row state changes
        ALTER TABLE public.community_messages REPLICA IDENTITY FULL;
        
        -- Add to the active Supabase realtime publication if it exists
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
                ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
            END IF;
        EXCEPTION
            WHEN undefined_object THEN
                -- Publication doesn't exist yet, ignore
            WHEN duplicate_object THEN
                -- Table already in publication, ignore
        END
        $$;
    `);
    console.log('   ✅ community_messages table configured for Realtime.\n');

    // ─── 2. Enable RLS on all tables ─────────────────────────────
    console.log('🔒 Step 2/5: Enabling RLS on all tables...');
    await db.execute(sql`
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.engineers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.product_analytics ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for blogs
        DROP POLICY IF EXISTS "Public published blogs" ON public.blogs;
        CREATE POLICY "Public published blogs" ON public.blogs
            FOR SELECT USING (status = 'published');

        DROP POLICY IF EXISTS "Admins full access blogs" ON public.blogs;
        CREATE POLICY "Admins full access blogs" ON public.blogs
            FOR ALL USING (auth.jwt()->>'role' = 'admin');


        -- RLS Policies for product_analytics
        DROP POLICY IF EXISTS "Vendors can view own analytics" ON public.product_analytics;
        CREATE POLICY "Vendors can view own analytics" ON public.product_analytics
            FOR SELECT USING (auth.uid() = vendor_id);

        DROP POLICY IF EXISTS "Public can insert analytics" ON public.product_analytics;
        CREATE POLICY "Public can insert analytics" ON public.product_analytics
            FOR INSERT WITH CHECK (true);

        DROP POLICY IF EXISTS "Public can update analytics" ON public.product_analytics;
        CREATE POLICY "Public can update analytics" ON public.product_analytics
            FOR UPDATE USING (true);
            
        -- RLS Policies for community_messages
        ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Public read community messages" ON public.community_messages;
        CREATE POLICY "Public read community messages" ON public.community_messages
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Authenticated users can post" ON public.community_messages;
        CREATE POLICY "Authenticated users can post" ON public.community_messages
            FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can delete own messages" ON public.community_messages;
        CREATE POLICY "Users can delete own messages" ON public.community_messages
            FOR DELETE USING (auth.uid() = user_id);
    `);
    console.log('   ✅ RLS enabled on all tables.\n');

    // ─── 3. Database Triggers ────────────────────────────────────
    console.log('⚡ Step 3/5: Creating database triggers...');

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

        DROP TRIGGER IF EXISTS set_engineers_updated_at ON public.engineers;
        CREATE TRIGGER set_engineers_updated_at
            BEFORE UPDATE ON public.engineers
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
        CREATE TRIGGER set_products_updated_at
            BEFORE UPDATE ON public.products
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_product_analytics_updated_at ON public.product_analytics;
        CREATE TRIGGER set_product_analytics_updated_at
            BEFORE UPDATE ON public.product_analytics
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

        DROP TRIGGER IF EXISTS set_blogs_updated_at ON public.blogs;
        CREATE TRIGGER set_blogs_updated_at
            BEFORE UPDATE ON public.blogs
            FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
    `);
    console.log('   ✅ updated_at triggers created.\n');

    // 3b. Auto-create profile on signup
    console.log('👤 Step 4/5: Creating auth triggers & security functions...');
    await db.execute(sql`
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
            INSERT INTO public.profiles (id, email, full_name, avatar_url, role, phone, city, approval_status)
            VALUES (
                new.id,
                new.email,
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'avatar_url',
                CASE
                    WHEN (new.raw_user_meta_data->>'role') IN ('vendor', 'engineer')
                    THEN (new.raw_user_meta_data->>'role')
                    ELSE 'user'
                END,
                new.raw_user_meta_data->>'phone',
                new.raw_user_meta_data->>'city',
                CASE
                    WHEN (new.raw_user_meta_data->>'role') IN ('vendor', 'engineer')
                    THEN 'pending'
                    ELSE 'approved'
                END
            );

            -- Automatically create standard rows for special roles
            IF (new.raw_user_meta_data->>'role') = 'vendor' THEN
                INSERT INTO public.vendors (id, business_name, business_type, years_in_business, city)
                VALUES (
                    new.id,
                    new.raw_user_meta_data->'vendor'->>'company_name',
                    new.raw_user_meta_data->'vendor'->>'business_type',
                    new.raw_user_meta_data->'vendor'->>'years_in_business',
                    new.raw_user_meta_data->'vendor'->>'city'
                );
            ELSIF (new.raw_user_meta_data->>'role') = 'engineer' THEN
                INSERT INTO public.engineers (id, speciality, experience_years, city)
                VALUES (
                    new.id,
                    new.raw_user_meta_data->'engineer'->>'speciality',
                    new.raw_user_meta_data->'engineer'->>'experience_years',
                    new.raw_user_meta_data->'engineer'->>'city'
                );
            END IF;

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
            -- Also allow postgres role since Drizzle connects natively
            IF (auth.jwt() ->> 'role') = 'service_role' OR current_user IN ('postgres', 'service_role', 'supabase_admin') THEN
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

    // ─── 4. Storage Setup ────────────────────────────────────────
    console.log('📦 Step 5/5: Setting up storage bucket & policies...');
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
