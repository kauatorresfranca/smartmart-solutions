import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw } from "lucide-react"; // Adicionei o ícone de reset

const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Memoizamos a função de busca
  const loadData = useCallback(async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/', {
        params: { start_date: start, end_date: end }
      });
      setMetrics(res.data.metrics);
      setChartData(res.data.products_performance || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // 2. Busca inicial ao montar o componente
  useEffect(() => {
    loadData();
  }, []);

  // 3. Função para limpar os filtros e JÁ buscar os dados novos
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    loadData('', ''); // Passamos strings vazias direto para ignorar o estado antigo que ainda não atualizou
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      <Card className="p-4 border-dashed bg-slate-50/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="grid gap-2 w-full md:w-auto">
            <label className="text-xs font-bold uppercase text-slate-500">Início</label>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-white"
            />
          </div>
          <div className="grid gap-2 w-full md:w-auto">
            <label className="text-xs font-bold uppercase text-slate-500">Fim</label>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-white"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              onClick={() => loadData()} 
              className="flex-1 md:w-auto bg-slate-900 hover:bg-slate-800 text-white gap-2"
            >
              <Search size={16} /> Filtrar
            </Button>

            {(startDate || endDate) && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100 gap-2"
              >
                <RotateCcw size={16} /> Limpar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="p-20 text-center text-slate-400 font-medium animate-pulse">
          Buscando indicadores atualizados...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="shadow-sm border-none ring-1 ring-slate-200">
              <CardHeader className="pb-2">
                <CardDescription>Receita Total</CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.total_revenue || 0)}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="shadow-sm border-none ring-1 ring-slate-200">
              <CardHeader className="pb-2">
                <CardDescription>Vendas Realizadas</CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold">{metrics?.total_transactions || 0}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="shadow-sm border-none ring-1 ring-slate-200 sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2">
                <CardDescription>Ticket Médio</CardDescription>
                <CardTitle className="text-xl md:text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    metrics?.total_transactions ? metrics.total_revenue / metrics.total_transactions : 0
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-none ring-1 ring-slate-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Performance por Produto</CardTitle>
              <CardDescription>Receita gerada por cada item no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {chartData?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <p>Nenhuma venda encontrada para este período.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;