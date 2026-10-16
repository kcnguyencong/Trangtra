import { Pool } from 'pg';
import { Customer, Category, Product, Transaction } from './types';
import { connection } from 'next/server';

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
  const { rows } = await db.query<Customer>(
    `INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING *;`,
    [name, phone]
  );
  return rows[0];
}

export async function getCustomer(id: number) {
  await connection();
  const db = getClient();
  const { rows } = await db.query<Customer>(`SELECT * FROM customers WHERE id = $1;`, [id]);
  return rows[0];
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
