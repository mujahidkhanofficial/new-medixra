import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role to run raw ALTERS if allowed, else we'll use a direct RPC or output the query for Supabase Studio

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function runMigration() {
    console.log('--- Engineer Database Migration ---')
    console.log('Since raw ALTER TABLE commands usually require direct Postgres connection rather than Supabase Client (which goes through PostgREST), please execute the following SQL in your Supabase Dashboard SQL Editor:')

    const sql = `
-- 1. Add 'engineer' to the user_role ENUM (if it was created as a custom type)
-- Wait until all active transactions finish, cannot happen inside a transaction block
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'engineer';

-- 2. Rename the technicians table
ALTER TABLE IF EXISTS public.technicians RENAME TO engineers;

-- 3. Update all existing profiles changing 'technician' to 'engineer'
UPDATE public.profiles 
SET role = 'engineer' 
WHERE role = 'technician';

-- 4. Recreate or Rename old RLS policies on the new engineers table
-- (Note: PostgREST might cache schemas, you may need to reload schema cache on Supabase)
NOTIFY pgrst, 'reload schema';
`

    console.log(sql)
    console.log('-----------------------------------')
    console.log('To run this automatically, we would require the direct postgres:// connection string. Outputting to SQL Editor form instead.')
}

runMigration()
