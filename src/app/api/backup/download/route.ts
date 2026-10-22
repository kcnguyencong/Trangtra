import { NextResponse } from 'next/server';
import { generateBackupData } from '@/lib/backup';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('trangtra_session')?.value;

  // Only allow authenticated admin to download full database
  if (session !== 'logged_in') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const backupData = await generateBackupData();
    const jsonString = JSON.stringify(backupData, null, 2);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fileName = `backup_trangtra_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating backup download:', error);
    return NextResponse.json({ error: 'Lỗi khi tạo file backup' }, { status: 500 });
  }
}
