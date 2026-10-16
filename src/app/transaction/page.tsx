import { getCustomers, getProducts } from '@/lib/db';
import TransactionForm from '@/components/TransactionForm';

export const instant = false;

export default async function TransactionPage() {
  const [customers, products] = await Promise.all([getCustomers(), getProducts()]);

  return (
    <div className="page-wrap">
      <h2 className="page-title">Ghi Nợ Mới</h2>
      
      <TransactionForm customers={customers} products={products} />
    </div>
  );
}
