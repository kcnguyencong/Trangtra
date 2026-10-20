import { Pool } from 'pg';
import { Customer, Category, Product, Transaction, PaymentTicket } from './types';
import { connection } from 'next/server';
import crypto from 'crypto';

let pool: Pool;

export function getClient() {
  if (!pool) {
    let connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PRISMA_DATABASE_URL || '';
    connStr = connStr.replace(/^["']|["']$/g, '').trim();

    if (!connStr) {
      console.error('LỖI: Chưa có biến môi trường DATABASE_URL!');
    }

    pool = new Pool({
      connectionString: connStr,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

// Customers
export async function getCustomers() {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Customer>(`SELECT * FROM customers ORDER BY created_at DESC;`);
  return rows;
}

export async function createCustomer(name: string, phone: string) {
  await connection();
  const db = getClient();
  const token = crypto.randomBytes(8).toString('hex');
  const { rows } = await db.query<Customer>(
    `INSERT INTO customers (name, phone, share_token) VALUES ($1, $2, $3) RETURNING *;`,
    [name, phone, token]
  );
  return rows[0];
}

export async function getCustomer(id: number) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Customer>(`SELECT * FROM customers WHERE id = $1;`, [id]);
  return rows[0];
}

export async function getCustomerByToken(token: string) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Customer>(`SELECT * FROM customers WHERE share_token = $1;`, [token]);
  return rows[0] || null;
}

export async function getCustomerTransactions(customerId: number) {
  await connection();
  const db = getClient();
  const { rows } = await db.query(
    `SELECT t.*, p.name as product_name 
     FROM transactions t 
     LEFT JOIN products p ON t.product_id = p.id 
     WHERE t.customer_id = $1 
     ORDER BY t.created_at DESC;`,
    [customerId]
  );
  return rows;
}

export async function getRecentTransactions(limit = 5) {
  await connection();
  const db = getClient();
  const { rows } = await db.query(
    `SELECT t.*, p.name as product_name, c.name as customer_name
     FROM transactions t 
     LEFT JOIN products p ON t.product_id = p.id
     JOIN customers c ON t.customer_id = c.id
     ORDER BY t.created_at DESC
     LIMIT $1;`,
    [limit]
  );
  return rows;
}

// Categories
export async function getCategories() {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Category>(`SELECT * FROM categories ORDER BY id ASC;`);
  return rows;
}

// Products
export async function getProducts() {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Product>(`SELECT * FROM products WHERE active = true ORDER BY name ASC;`);
  return rows;
}

// Transactions
export async function recordDebt(customerId: number, productId: number | null, amount: number) {
  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO transactions (customer_id, product_id, amount, type) VALUES ($1, $2, $3, 'debt');`,
      [customerId, productId, amount]
    );
    await client.query(
      `UPDATE customers SET total_debt = total_debt + $1 WHERE id = $2;`,
      [amount, customerId]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function recordPayment(customerId: number, amount: number) {
  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO transactions (customer_id, product_id, amount, type) VALUES ($1, NULL, $2, 'payment');`,
      [customerId, amount]
    );
    await client.query(
      `UPDATE customers SET total_debt = total_debt - $1 WHERE id = $2;`,
      [amount, customerId]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Payment Tickets
export async function getPendingPaymentTickets() {
  await connection();
  const db = getClient();
  const { rows } = await db.query<PaymentTicket>(`
    SELECT pt.*, c.name as customer_name, c.phone as customer_phone, c.share_token as customer_token
    FROM payment_tickets pt
    JOIN customers c ON pt.customer_id = c.id
    WHERE pt.status = 'pending'
    ORDER BY pt.created_at DESC;
  `);
  return rows;
}

export async function getPendingTicketForCustomer(customerId: number) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<PaymentTicket>(`
    SELECT * FROM payment_tickets
    WHERE customer_id = $1 AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1;
  `, [customerId]);
  return rows[0] || null;
}

export async function getPaymentTicketsByCustomer(customerId: number) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<PaymentTicket>(`
    SELECT * FROM payment_tickets
    WHERE customer_id = $1
    ORDER BY created_at DESC;
  `, [customerId]);
  return rows;
}

export async function createPaymentTicket(customerId: number, amount: number, note?: string) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<PaymentTicket>(`
    INSERT INTO payment_tickets (customer_id, amount, note, status)
    VALUES ($1, $2, $3, 'pending')
    RETURNING *;
  `, [customerId, amount, note || null]);
  return rows[0];
}

export async function approvePaymentTicket(ticketId: number) {
  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT * FROM payment_tickets WHERE id = $1 AND status = 'pending' FOR UPDATE;`,
      [ticketId]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, error: 'Yêu cầu không tồn tại hoặc đã được xử lý' };
    }
    const ticket = rows[0];
    const amount = Number(ticket.amount);
    const customerId = ticket.customer_id;

    // Cập nhật ticket sang approved
    await client.query(
      `UPDATE payment_tickets SET status = 'approved', resolved_at = CURRENT_TIMESTAMP WHERE id = $1;`,
      [ticketId]
    );

    // Ghi transaction payment
    await client.query(
      `INSERT INTO transactions (customer_id, amount, type) VALUES ($1, $2, 'payment');`,
      [customerId, amount]
    );

    // Trừ nợ khách hàng
    await client.query(
      `UPDATE customers SET total_debt = total_debt - $1 WHERE id = $2;`,
      [amount, customerId]
    );

    await client.query('COMMIT');
    return { success: true, customerId };
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi duyệt ticket:', e);
    throw e;
  } finally {
    client.release();
  }
}

export async function rejectPaymentTicket(ticketId: number) {
  const db = getClient();
  try {
    const { rowCount } = await db.query(
      `UPDATE payment_tickets SET status = 'rejected', resolved_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'pending';`,
      [ticketId]
    );
    return { success: (rowCount ?? 0) > 0 };
  } catch (e) {
    console.error('Lỗi khi từ chối ticket:', e);
    throw e;
  }
}

