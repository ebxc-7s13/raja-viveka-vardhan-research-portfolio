import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { getDb } from '@/lib/db';

export async function POST() {
  try {
    const db = getDb();
    const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;

    if (userCount > 0) {
      return NextResponse.json({ status: 'already_seeded', message: 'Database already has data.' });
    }

    // Close DB before seed
    db.close();

    // Run seed script
    execSync('npx tsx scripts/seed.ts', {
      cwd: process.cwd(),
      timeout: 60000,
      stdio: 'pipe',
    });

    return NextResponse.json({ status: 'success', message: 'Database seeded successfully!' });
  } catch (e: any) {
    return NextResponse.json({ status: 'error', message: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send POST to /api/seed to populate the database.',
  });
}
