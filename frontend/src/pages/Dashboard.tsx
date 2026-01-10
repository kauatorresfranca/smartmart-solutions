import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, RotateCcw, Download, UploadCloud, 
  TrendingUp, Package, DollarSign, PieChart 
} from "lucide-react";
import { toast } from "sonner";

// Interfaces para Tipagem Robusta
interface MetricData {
  total_revenue: number;
  avg_quantity: number;
  total_transactions: number;
}

interface PerformanceData {
  name: string;
  revenue: number;
  quantity?: number; // Opcional se sua API enviar
}

interface Category {
  id: number;
  name: string;
}

const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [chartData, setChartData] = useState<PerformanceData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDashboardData = useCallback(async (
    start = startDate, 
    end = endDate, 
    cat = selectedCategory
  ) => {
    setLoading(true);
    try {
      // Tentamos buscar as categorias primeiro, mas de forma isolada
      try {
        const catRes = await api.get('/categories/');
        setCategories(catRes.data);
      } catch (catError) {
        console.warn("Endpoint de categorias não encontrado ou falhou.", catError);
        // Não lançamos erro aqui para não travar o dashboard
      }

      // Busca principal dos dados de análise
      const analysisRes = await api.get('/analysis/', {
        params: { 
          start_date: start, 
          end_date: end, 
          category: cat 
        }
      });

      setMetrics(analysisRes.data.metrics);
      setChartData(analysisRes.data.products_performance || []);
      
    } catch (error) {
      console.error("Erro crítico ao carregar análise:", error);
      toast.error("Falha ao sincronizar dados com o servidor.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedCategory]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('');
    loadDashboardData('', '', '');
  };

  const handleExportCSV = () => {
    if (chartData.length === 0) return toast.error("Sem dados para exportar.");

    const headers = ["Produto", "Receita Total (R$)"];
    const csvContent = [
      headers.join(","),
      ...chartData.map(item => `"${item.name}",${item.revenue}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartmart_report_${new Date().getTime()}.csv`;
    link.click();
    toast.success("Download iniciado!");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading("Processando arquivo CSV...");
    try {
      await api.post('/products/upload-csv/', formData);
      toast.success("Produtos e vendas importados!", { id: toastId });
      loadDashboardData();
    } catch (error) {
      toast.error("Erro na importação. Verifique o formato.", { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Cabeçalho de Ações */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Executivo</h1>
          <p className="text-slate-500">Monitore performance, lucros e estoque em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 lg:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 gap-2"
          >
            <UploadCloud size={18} /> Importar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50 gap-2"
          >
            <Download size={18} /> Exportar
          </Button>
        </div>
      </div>

      {/* Painel de Filtros Avançados */}
      <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Data Inicial</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Data Final</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => loadDashboardData()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Search size={18} /> Filtrar
              </Button>
              <Button variant="ghost" onClick={handleClearFilters} className="text-slate-500 hover:bg-slate-200">
                <RotateCcw size={18} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-green-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Receita Total (Lucro)</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.total_revenue || 0)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Soma de todas as vendas no período</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Volume de Vendas</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{metrics?.total_transactions || 0}</div>
                <p className="text-xs text-slate-400 mt-1">Transações processadas com sucesso</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-500">Ticket Médio</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    metrics?.total_transactions ? metrics.total_revenue / metrics.total_transactions : 0
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">Valor médio gasto por pedido</p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Gráficos Duplos (REQUISITO OBRIGATÓRIO) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-md border-none ring-1 ring-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="text-blue-600" size={20} />
                  <CardTitle>Performance de Receita</CardTitle>
                </div>
                <CardDescription>Comparativo financeiro entre produtos</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </CardContent>
            </Card>

            <Card className="shadow-md border-none ring-1 ring-slate-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <CardTitle>Tendência de Crescimento</CardTitle>
                </div>
                <CardDescription>Fluxo de receita acumulada no período</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
    <Package size={40} className="opacity-20" />
    <p className="text-sm font-medium">Nenhum dado disponível para os filtros aplicados.</p>
  </div>
);

export default Dashboard;