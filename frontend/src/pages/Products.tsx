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
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  price: string;
  category: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: 1 });

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch {
      toast.error("Erro ao carregar lista de produtos.");
    }
  }, []);

  // Corrigindo o erro de cascading render: chamamos a função dentro de um escopo assíncrono
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      loadProducts();
    }
    return () => { isMounted = false; };
  }, [loadProducts]);

  const handleSave = async () => {
    try {
      await api.post('/products/', form);
      setIsOpen(false);
      setForm({ name: '', price: '', category: 1 });
      loadProducts();
      toast.success("Produto criado com sucesso!");
    } catch {
      toast.error("Erro ao criar produto.");
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct.id}/`, editingProduct);
      setIsEditOpen(false);
      loadProducts();
      toast.success("Produto atualizado com sucesso!");
    } catch {
      toast.error("Erro ao atualizar produto.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await api.delete(`/products/${id}/`);
      loadProducts();
      toast.success("Produto removido!");
    } catch {
      toast.error("Não foi possível excluir o produto.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Produtos</h2>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold text-white">
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
                <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ex: Cerveja" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço</label>
                <Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="0.00" />
              </div>
            </div>
            <DialogFooter>
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
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="h-12 px-4 font-medium text-slate-500">ID</th>
                  <th className="h-12 px-4 font-medium text-slate-500">Nome</th>
                  <th className="h-12 px-4 font-medium text-slate-500">Preço</th>
                  <th className="h-12 px-4 font-medium text-slate-500 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-500">#{p.id}</td>
                    <td className="p-4 font-medium text-slate-900">{p.name}</td>
                    <td className="p-4 font-semibold text-blue-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.price))}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-600 hover:text-blue-600"
                        onClick={() => { setEditingProduct(p); setIsEditOpen(true); }}
                      >
                        <Pencil size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-600 hover:text-red-600"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-[450px]:w-[92%] max-[450px]:rounded-xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço</label>
                <Input 
                  type="number" 
                  value={editingProduct.price} 
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} className="bg-blue-600">Atualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;