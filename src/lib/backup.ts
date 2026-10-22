import { getClient } from '@/lib/db';

export interface BackupData {
  app: string;
  version: string;
  exported_at: string;
  summary: {
    total_customers: number;
    total_debt: number;
    total_transactions: number;
    total_tickets: number;
    total_products: number;
  };
  tables: {
    customers: any[];
    categories: any[];
    products: any[];
    transactions: any[];
    payment_tickets: any[];
  };
}

export async function generateBackupData(): Promise<BackupData> {
  const db = getClient();

  const [
    customersRes,
    categoriesRes,
    productsRes,
    transactionsRes,
    ticketsRes,
  ] = await Promise.all([
    db.query(`SELECT * FROM customers ORDER BY id ASC;`),
    db.query(`SELECT * FROM categories ORDER BY id ASC;`),
    db.query(`SELECT * FROM products ORDER BY id ASC;`),
    db.query(`SELECT * FROM transactions ORDER BY created_at ASC;`),
    db.query(`SELECT * FROM payment_tickets ORDER BY created_at ASC;`),
  ]);

  const customers = customersRes.rows;
  const categories = categoriesRes.rows;
  const products = productsRes.rows;
  const transactions = transactionsRes.rows;
  const tickets = ticketsRes.rows;

  const totalDebt = customers.reduce((sum, c) => sum + Number(c.total_debt || 0), 0);

  return {
    app: 'Trang Trà',
    version: '1.0',
    exported_at: new Date().toISOString(),
    summary: {
      total_customers: customers.length,
      total_debt: totalDebt,
      total_transactions: transactions.length,
      total_tickets: tickets.length,
      total_products: products.length,
    },
    tables: {
      customers,
      categories,
      products,
      transactions,
      payment_tickets: tickets,
    },
  };
}

export async function sendBackupToTelegram(): Promise<{ success: boolean; message: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trong biến môi trường.',
    };
  }

  try {
    const backupData = await generateBackupData();
    const jsonString = JSON.stringify(backupData, null, 2);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateFormatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const fileDateStr = `${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}h${pad(now.getMinutes())}`;
    const fileName = `backup_trangtra_${fileDateStr}.json`;

    const formatMoney = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

    const caption = [
      `📦 <b>BẢN SAO LƯU DỮ LIỆU TRANG TRÀ</b>`,
      `📅 <b>Thời gian:</b> ${dateFormatted}`,
      `👥 <b>Khách hàng:</b> ${backupData.summary.total_customers} người`,
      `💰 <b>Tổng nợ hiện tại:</b> ${formatMoney(backupData.summary.total_debt)} đ`,
      `🧾 <b>Tổng giao dịch:</b> ${backupData.summary.total_transactions}`,
      `🎫 <b>Vé thanh toán:</b> ${backupData.summary.total_tickets}`,
      `🍹 <b>Thực đơn:</b> ${backupData.summary.total_products} món`,
      ``,
      `<i>💡 File JSON đính kèm lưu toàn bộ CSDL. Bạn có thể lưu lại hoặc dùng để khôi phục bất cứ lúc nào.</i>`,
    ].join('\n');

    const formData = new FormData();
    formData.append('chat_id', chatId);
    const blob = new Blob([jsonString], { type: 'application/json' });
    formData.append('document', blob, fileName);
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram sendDocument error:', result);
      return {
        success: false,
        message: `Telegram API lỗi: ${result.description || 'Không xác định'}`,
      };
    }

    return {
      success: true,
      message: 'Đã gửi bản sao lưu dữ liệu vào Telegram thành công!',
    };
  } catch (error: any) {
    console.error('Lỗi khi gửi backup qua Telegram:', error);
    return {
      success: false,
      message: error?.message || 'Có lỗi xảy ra khi tạo bản sao lưu.',
    };
  }
}
