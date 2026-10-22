import { NextResponse } from 'next/server';
import { sendBackupToTelegram } from '@/lib/backup';

export async function GET(request: Request) {
  // Check for authorization header if CRON_SECRET is configured
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await sendBackupToTelegram();
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: 'Automated backup delivered to Telegram successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron backup error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
