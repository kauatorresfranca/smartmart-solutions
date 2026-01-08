import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await api.get('/analysis/');
      setMetrics(res.data.metrics);
      setChartData(res.data.products_performance || []); // Garantia de array vazio se vier null
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando indicadores...</div>;

  return (
    <div className="space-y-8">
      {/* Cards de Métricas com Shadcn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card shadow-sm>
          <CardHeader className="pb-2">
            <CardDescription>Receita Total</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.total_revenue || 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card shadow-sm>
          <CardHeader className="pb-2">
            <CardDescription>Vendas Realizadas</CardDescription>
            <CardTitle className="text-2xl font-bold">{metrics?.total_transactions || 0}</CardTitle>
          </CardHeader>
        </Card>

        <Card shadow-sm>
          <CardHeader className="pb-2">
            <CardDescription>Ticket Médio</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                metrics?.total_transactions ? metrics.total_revenue / metrics.total_transactions : 0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Gráfico de Performance com Shadcn Card */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Produto</CardTitle>
          <CardDescription>Receita gerada por cada item no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {/* O "Optional Chaining" ?. evita o erro de undefined */}
                  {chartData?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;