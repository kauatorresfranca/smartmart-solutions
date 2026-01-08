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
      alert("Erro ao salvar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Produtos</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Novo Produto</Button>
          </DialogTrigger>
          <DialogContent>
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todos os Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto text-sm">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">ID</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="h-12 px-4 text-left font-medium text-muted-foreground">Preço</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {products.map((p) => (
                  <tr key={p.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">#{p.id}</td>
                    <td className="p-4 align-middle font-medium">{p.name}</td>
                    <td className="p-4 align-middle">
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