'use server';

import { getClient } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addCustomer(formData: FormData): Promise<void> {
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (!name) return;

  const db = getClient();
  try {
    await db.query(
      `INSERT INTO customers (name, phone) VALUES ($1, $2)`,
      [name, phone]
    );
    revalidatePath('/customers');
    revalidatePath('/');
  } catch (e) {
    console.error('Lỗi khi thêm khách hàng:', e);
    return;
  }

  redirect('/customers');
}

export async function addProduct(formData: FormData): Promise<void> {
  const name = formData.get('name') as string;
  const price = Number(formData.get('price'));
  const categoryId = Number(formData.get('categoryId'));

  if (!name || isNaN(price)) return;

  const db = getClient();
  try {
    await db.query(
      `INSERT INTO products (name, price, category_id) VALUES ($1, $2, $3)`,
      [name, price, categoryId > 0 ? categoryId : null]
    );
    revalidatePath('/products');
  } catch (e) {
    console.error('Lỗi khi thêm sản phẩm:', e);
    return;
  }
  
  redirect('/products');
}

export async function addTransaction(formData: FormData): Promise<void> {
  const customerIdsRaw = formData.get('customerIds') as string;
  let customerIds: number[] = [];

  if (customerIdsRaw) {
    try {
      const parsed = JSON.parse(customerIdsRaw);
      if (Array.isArray(parsed)) {
        customerIds = parsed.map(Number).filter(id => !isNaN(id) && id > 0);
      }
    } catch {
      customerIds = customerIdsRaw
        .split(',')
        .map(s => Number(s.trim()))
        .filter(id => !isNaN(id) && id > 0);
    }
  }

  if (customerIds.length === 0) {
    const singleId = Number(formData.get('customerId'));
    if (singleId > 0) {
      customerIds = [singleId];
    }
  }

  if (customerIds.length === 0) return;

  const itemsJson = formData.get('items') as string;

  let items: { productId: number | null; amount: number; quantity?: number }[] = [];
  if (itemsJson) {
    try {
      items = JSON.parse(itemsJson);
    } catch (e) {
      console.error('Invalid items JSON:', e);
    }
  }

  if (items.length === 0) {
    const productId = Number(formData.get('productId')) || null;
    const amount = Number(formData.get('amount'));
    if (amount > 0) {
      items.push({ productId, amount });
    }
  }

  if (items.length === 0) return;

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
  if (totalAmount <= 0) return;

  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const cId of customerIds) {
      for (const item of items) {
        if (item.amount > 0) {
          await client.query(
            `INSERT INTO transactions (customer_id, product_id, amount, type) VALUES ($1, $2, $3, 'debt');`,
            [cId, item.productId || null, item.amount]
          );
        }
      }
      await client.query(
        `UPDATE customers SET total_debt = total_debt + $1 WHERE id = $2;`,
        [totalAmount, cId]
      );
    }
    await client.query('COMMIT');
    revalidatePath('/');
    revalidatePath('/transaction');
    revalidatePath('/customers');
    for (const cId of customerIds) {
      revalidatePath(`/customers/${cId}`);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi ghi nợ:', e);
    return;
  } finally {
    client.release();
  }

  redirect('/');
}

export async function payDebt(customerId: number, amount: number) {
  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO transactions (customer_id, amount, type) VALUES ($1, $2, 'payment');`,
      [customerId, amount]
    );
    await client.query(
      `UPDATE customers SET total_debt = total_debt - $1 WHERE id = $2;`,
      [amount, customerId]
    );
    await client.query('COMMIT');
    revalidatePath('/');
    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi thanh toán:', e);
    return { error: 'Lỗi khi thanh toán' };
  } finally {
    client.release();
  }
}

export async function payCustomerDebtAction(formData: FormData): Promise<void> {
  const customerId = Number(formData.get('customerId'));
  const amount = Number(formData.get('amount'));

  if (!customerId || !amount) return;
  await payDebt(customerId, amount);
}

export async function updateCustomerAction(formData: FormData): Promise<void> {
  const customerId = Number(formData.get('customerId'));
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (!customerId || !name) return;

  const db = getClient();
  try {
    await db.query(
      `UPDATE customers SET name = $1, phone = $2 WHERE id = $3`,
      [name.trim(), phone ? phone.trim() : null, customerId]
    );
    revalidatePath(`/customers/${customerId}`);
    revalidatePath('/customers');
    revalidatePath('/');
  } catch (e) {
    console.error('Lỗi khi cập nhật thông tin khách:', e);
  }
}

export async function recordCustomerDebtAction(formData: FormData): Promise<void> {
  const customerId = Number(formData.get('customerId'));
  const itemsJson = formData.get('items') as string;

  if (!customerId) return;

  let items: { productId: number | null; amount: number; quantity?: number }[] = [];
  if (itemsJson) {
    try {
      items = JSON.parse(itemsJson);
    } catch (e) {
      console.error('Invalid items JSON:', e);
    }
  }

  if (items.length === 0) {
    const productId = Number(formData.get('productId')) || null;
    const amount = Number(formData.get('amount'));
    if (amount > 0) {
      items.push({ productId, amount });
    }
  }

  if (items.length === 0) return;

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
  if (totalAmount <= 0) return;

  const db = getClient();
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      if (item.amount > 0) {
        await client.query(
          `INSERT INTO transactions (customer_id, product_id, amount, type) VALUES ($1, $2, $3, 'debt');`,
          [customerId, item.productId || null, item.amount]
        );
      }
    }
    await client.query(
      `UPDATE customers SET total_debt = total_debt + $1 WHERE id = $2;`,
      [totalAmount, customerId]
    );
    await client.query('COMMIT');
    revalidatePath(`/customers/${customerId}`);
    revalidatePath('/customers');
    revalidatePath('/');
    revalidatePath('/transaction');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi ghi nợ khách:', e);
  } finally {
    client.release();
  }
}

export async function updateProductAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get('productId'));
  const name = formData.get('name') as string;
  const price = Number(formData.get('price'));
  const categoryId = Number(formData.get('categoryId'));

  if (!productId || !name || isNaN(price)) return;

  const db = getClient();
  try {
    await db.query(
      `UPDATE products SET name = $1, price = $2, category_id = $3 WHERE id = $4`,
      [name.trim(), price, categoryId > 0 ? categoryId : null, productId]
    );
    revalidatePath('/products');
    revalidatePath('/transaction');
    revalidatePath('/');
  } catch (e) {
    console.error('Lỗi khi cập nhật món:', e);
  }
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const productId = Number(formData.get('productId'));
  if (!productId) return;

  const db = getClient();
  try {
    await db.query(`UPDATE products SET active = false WHERE id = $1`, [productId]);
    revalidatePath('/products');
    revalidatePath('/transaction');
    revalidatePath('/');
  } catch (e) {
    console.error('Lỗi khi xóa món:', e);
  }
}


