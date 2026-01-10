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
import { Pencil, Trash2, Download } from "lucide-react";
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

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleExportCSV = () => {
    if (products.length === 0) return toast.error("Não há produtos para exportar.");
    
    const headers = ["ID", "Nome", "Preço (R$)"];
    const rows = products.map(p => [p.id, p.name, p.price]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `catalogo_produtos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Catálogo exportado com sucesso!");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error("Preencha todos os campos");
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
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Produtos</h2>
          <p className="text-sm text-slate-500">Gerencie seu catálogo e preços.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={handleExportCSV} 
            className="flex-1 sm:flex-none border-slate-200 text-slate-700 gap-2"
          >
            <Download size={18} /> Exportar CSV
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 font-semibold text-white">
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
                <Button onClick={handleSave} className="w-full bg-blue-600 text-white">Salvar Produto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="border-b bg-slate-50/30">
          <CardTitle className="text-lg font-semibold">Catálogo de Itens</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="h-12 px-4 font-medium text-slate-500">ID</th>
                  <th className="h-12 px-4 font-medium text-slate-500">Nome</th>
                  <th className="h-12 px-4 font-medium text-slate-500 text-right">Preço</th>
                  <th className="h-12 px-4 font-medium text-slate-500 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-400">#{p.id}</td>
                      <td className="p-4 font-medium text-slate-900">{p.name}</td>
                      <td className="p-4 font-bold text-blue-600 text-right">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(p.price))}
                      </td>
                      <td className="p-4 text-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => { setEditingProduct(p); setIsEditOpen(true); }}
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400">Nenhum produto cadastrado.</td>
                  </tr>
                )}
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
                <label className="text-sm font-medium">Nome do Produto</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Unitário</label>
                <Input 
                  type="number" 
                  value={editingProduct.price} 
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} className="bg-blue-600 text-white">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;