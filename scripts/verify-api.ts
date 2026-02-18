
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Try loading both
config({ path: path.resolve(process.cwd(), '.env.local') })
config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in env vars')
    process.exit(1)
}

console.log('Using Supabase URL:', supabaseUrl)

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
    const userId = '5f3ae084-8e09-48cd-93fe-d0f5a8f16979'
    console.log(`Querying profile via API for: ${userId}`)

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('API Error:', error.message, error.code, error.details)
    } else {
        console.log('API Result:', data ? 'Found Profile' : 'No Profile')
        if (data) console.log(JSON.stringify(data));
    }
}

verify()
