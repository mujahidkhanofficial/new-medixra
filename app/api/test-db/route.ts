
import { db } from '@/lib/db/drizzle';
import { usersTestDrizzle } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Insert a test user
        const inserted = await db.insert(usersTestDrizzle).values({
            email: `test-${Date.now()}@example.com`,
            name: 'Test User',
        }).returning();

        // Fetch all users
        const allUsers = await db.select().from(usersTestDrizzle);

        return NextResponse.json({
            success: true,
            message: 'Database connection verified',
            inserted,
            allUsersCount: allUsers.length,
            sample: allUsers.slice(0, 3)
        });
    } catch (error: any) {
        console.error('Database Verification Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
