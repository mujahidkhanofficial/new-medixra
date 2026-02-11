
import { config } from 'dotenv';
import path from 'path';

// Load environment variables first
config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  // Dynamic imports ensuring env vars are loaded before db connection is initialized
  const { db } = await import('./drizzle');
  const { sql } = await import('drizzle-orm');

  console.log('🔒 Securing database with RLS policies...');

  try {
    // --- 1. PROFILES & VENDORS ---
    await db.execute(sql`
      -- PROFILES
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

      CREATE POLICY "Public profiles access" ON public.profiles FOR SELECT USING (true);
      CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
      CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

      -- VENDORS
      ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "Public vendors access" ON public.vendors;
      DROP POLICY IF EXISTS "Vendors manage own details" ON public.vendors;
      DROP POLICY IF EXISTS "Vendors insert own details" ON public.vendors;
      DROP POLICY IF EXISTS "Vendors update own details" ON public.vendors;


      CREATE POLICY "Public vendors access" ON public.vendors FOR SELECT USING (true);
      -- Insert/Update combined logic for simplicty or separate if needed
      CREATE POLICY "Vendors insert own details" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = id);
      CREATE POLICY "Vendors update own details" ON public.vendors FOR UPDATE USING (auth.uid() = id);
    `);

    // --- 2. PRODUCTS ---
    await db.execute(sql`
      ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public read access" ON public.products;
      DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
      DROP POLICY IF EXISTS "Users can update own products" ON public.products;
      DROP POLICY IF EXISTS "Users can delete own products" ON public.products;

      -- Read: Active products are public. Vendors can see their own non-active products.
      CREATE POLICY "Public read access" ON public.products FOR SELECT 
      USING (status = 'active' OR auth.uid() = vendor_id);

      CREATE POLICY "Authenticated users can insert products" ON public.products FOR INSERT 
      WITH CHECK (auth.uid() = vendor_id);

      CREATE POLICY "Users can update own products" ON public.products FOR UPDATE 
      USING (auth.uid() = vendor_id);

      CREATE POLICY "Users can delete own products" ON public.products FOR DELETE 
      USING (auth.uid() = vendor_id);
    `);

    // --- 3. PRODUCT IMAGES ---
    await db.execute(sql`
      ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public read access images" ON public.product_images;
      DROP POLICY IF EXISTS "Authenticated insert images" ON public.product_images;
      DROP POLICY IF EXISTS "Users can update own images" ON public.product_images;
      DROP POLICY IF EXISTS "Users can delete own images" ON public.product_images;

      CREATE POLICY "Public read access images" ON public.product_images FOR SELECT USING (true);

      -- Use a simplified EXISTS check for permissions based on parent product ownership
      CREATE POLICY "Authenticated insert images" ON public.product_images FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.products 
          WHERE id = product_images.product_id 
          AND vendor_id = auth.uid()
        )
      );

      CREATE POLICY "Users can update own images" ON public.product_images FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.products 
          WHERE id = product_images.product_id 
          AND vendor_id = auth.uid()
        )
      );

      CREATE POLICY "Users can delete own images" ON public.product_images FOR DELETE 
      USING (
        EXISTS (
          SELECT 1 FROM public.products 
          WHERE id = product_images.product_id 
          AND vendor_id = auth.uid()
        )
      );
    `);

    // --- 4. SAVED ITEMS (New table) ---
    await db.execute(sql`
        ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own saved items" ON public.saved_items;
        DROP POLICY IF EXISTS "Users can manage own saved items" ON public.saved_items;

        CREATE POLICY "Users can view own saved items" ON public.saved_items FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can manage own saved items" ON public.saved_items FOR ALL USING (auth.uid() = user_id);
    `);

    console.log('✅ RLS Policies applied successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to apply policies:', error);
    process.exit(1);
  }
}

main();
