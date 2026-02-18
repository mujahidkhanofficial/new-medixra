
import { config } from 'dotenv'
import path from 'path'
import postgres from 'postgres'

// Load env vars
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

console.log('Loading env from:', envLocalPath)
config({ path: envLocalPath })
console.log('Loading env from:', envPath)
config({ path: envPath })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
    console.error('DATABASE_URL is missing in .env')
    process.exit(1)
}

async function testConnection() {
    try {
        const host = connectionString?.split('@')[1]?.split(':')[0] || 'unknown'
        console.log('Testing DB Connection to host:', host)

        const sql = postgres(connectionString!)
        const start = Date.now()

        const result = await sql`SELECT 1`

        const duration = Date.now() - start
        console.log(`DB Connection Successful! Duration: ${duration}ms`)

        await sql.end()
        process.exit(0)
    } catch (error) {
        console.error('DB Connection Failed:', error)
        process.exit(1)
    }
}

testConnection()
