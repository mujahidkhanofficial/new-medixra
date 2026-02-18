
import { config } from 'dotenv'
import path from 'path'
import postgres from 'postgres'

// Load env vars
const envLocal = path.resolve(process.cwd(), '.env.local')
const env = path.resolve(process.cwd(), '.env')
console.error('Loading env from:', envLocal)
config({ path: envLocal })
config({ path: env })

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing')
    process.exit(1)
}

const sql = postgres(process.env.DATABASE_URL)

async function checkAdminRole() {
    const email = process.env.ADMIN_DEFAULT_EMAIL
    console.error(`>>> Checking role for default admin email: '${email}'`)

    if (!email) {
        console.error('>>> ERROR: ADMIN_DEFAULT_EMAIL is not set in env')
        process.exit(1)
    }

    try {
        console.error('>>> Querying database (RAW SQL)...')
        const result = await sql`SELECT * FROM profiles WHERE email = ${email}`

        if (result.length === 0) {
            console.error('>>> RESULT: No profile found for this email.')
        } else {
            console.error('>>> RESULT: Profile Found')
            console.error('>>> ID:', result[0].id)
            console.error('>>> ROLE:', result[0].role)
            console.error('>>> STATUS:', result[0].approval_status)
        }
    } catch (err) {
        console.error('>>> ERROR QUERYING DB:', err)
    }

    await sql.end()
    console.error('>>> Done')
    // small delay to ensure flush
    await new Promise(r => setTimeout(r, 500))
}

checkAdminRole()
