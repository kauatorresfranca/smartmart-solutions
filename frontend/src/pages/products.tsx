import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: string;
  category: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', category: 1 });

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSave = async () => {
    try {
      await api.post('/products/', form);
      setIsOpen(false);
      setForm({ name: '', price: '', category: 1 });
      loadProducts();
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Produtos</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold text-white shadow-md transition-all active:scale-95">
              + Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-[450px]:w-[92%] max-[450px]:rounded-xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                  placeholder="Nome do produto" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço</label>
                <Input 
                  type="number" 
                  value={form.price} 
                  onChange={(e) => setForm({...form, price: e.target.value})} 
                  placeholder="0.00" 
                />
              </div>
            </div>
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">Cancelar</Button>
              <Button onClick={handleSave} className="w-full sm:w-auto bg-blue-600">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todos os Produtos</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-x-auto border-t sm:border sm:rounded-md">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="h-12 px-4 text-left font-medium text-slate-500">ID</th>
                  <th className="h-12 px-4 text-left font-medium text-slate-500">Nome</th>
                  <th className="h-12 px-4 text-left font-medium text-slate-500">Preço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-middle text-slate-500">#{p.id}</td>
                    <td className="p-4 align-middle font-medium text-slate-900">{p.name}</td>
                    <td className="p-4 align-middle font-semibold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.price))}
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

export default Products;