import React, { useEffect, useState, useCallback } from 'react';
import api from '@/services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react"; // Importe o ícone
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

// ... (interfaces Sale e Product permanecem iguais)

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  const loadData = useCallback(async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get('/sales/'),
        api.get('/products/')
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // FUNCIONALIDADE EXTRA: Exportar Vendas para CSV
  const handleExportCSV = () => {
    if (sales.length === 0) return toast.error("Sem vendas para exportar");
    const headers = ["Data", "Produto", "Quantidade", "Valor Total"];
    const rows = sales.map(s => [
      new Date(s.date).toLocaleDateString('pt-BR'),
      s.product_name,
      s.quantity,
      s.total_price
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio_vendas.csv";
    link.click();
    toast.success("CSV exportado com sucesso!");
  };

  const handleRegisterSale = async () => {
    if (!selectedProduct || !quantity) return toast.error("Preencha todos os campos");
    try {
      await api.post('/sales/', {
        product: parseInt(selectedProduct),
        quantity: parseInt(quantity)
      });
      setIsOpen(false);
      loadData();
      toast.success("Venda registrada!");
    } catch (error) {
      toast.error("Erro ao registrar venda.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('pt-BR');
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Carregando transações...</div>;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Vendas</h2>
          <p className="text-sm text-slate-500">Histórico de movimentações da loja.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* Botão de Exportar CSV */}
          <Button variant="outline" onClick={handleExportCSV} className="flex-1 sm:flex-none gap-2">
            <Download size={16} /> Exportar
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">+ Registrar Venda</Button>
            </DialogTrigger>
            <DialogContent className="max-[450px]:w-[92%]">
              <DialogHeader><DialogTitle>Nova Venda</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produto</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade</label>
                  <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={handleRegisterSale} className="bg-green-600">Finalizar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 sm:p-6 pt-0">
          <div className="w-full overflow-x-auto border-t sm:border sm:rounded-md">
            <table className="w-full min-w-[550px] text-sm text-left">
              <thead className="bg-slate-50 border-b text-slate-500">
                <tr>
                  <th className="p-4">Data</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500">{formatDate(sale.date)}</td>
                    <td className="p-4 font-semibold text-slate-900">{sale.product_name}</td>
                    <td className="p-4">{sale.quantity}x</td>
                    <td className="p-4 text-right font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(sale.total_price))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;