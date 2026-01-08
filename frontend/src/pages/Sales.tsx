import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Sale {
  id: number;
  product_name: string;
  quantity: number;
  total_price: string;
  date: string; // O campo que vem do Django
  month: string;
}

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSales = useCallback(async () => {
    try {
      const res = await api.get('/sales/');
      setSales(res.data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Função para evitar o "Invalid Date"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Data não disponível";
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando vendas...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Histórico de Vendas</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50/50">
                <tr className="text-left font-medium text-slate-500">
                  <th className="p-4">Data</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.length > 0 ? (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-600">{formatDate(sale.date)}</td>
                      <td className="p-4 font-medium text-slate-900">{sale.product_name}</td>
                      <td className="p-4 text-slate-600">{sale.quantity}</td>
                      <td className="p-4 text-right font-bold text-green-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.total_price))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">Nenhuma venda registrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;