import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp, Activity, Zap, Clock, RefreshCw, ChevronRight } from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    occupancyBySkill: [],
    globalAvailability: [],
    overloadedEmployees: [],
    strategicInsights: [],
    stats: { totalHours: 0, allocatedHours: 0, avgOccupancy: 0 }
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      await api.init();
      const [funcs, projs, alocs] = await Promise.all([
        api.getAll(),
        api.getAllProjetos(),
        api.getAllAlocacoes()
      ]);

      const skillStats = {};
      const allSkills = api.getCompetenciasPadrao();
      allSkills.forEach(s => skillStats[s] = { total: 0, allocated: 0 });

      funcs.forEach(f => {
        (f.competencias || []).forEach(s => {
          if (skillStats[s]) {
            skillStats[s].total += (f.carga_horaria_max || 40) / (f.competencias.length || 1);
          }
        });
      });

      alocs.forEach(a => {
        if (skillStats[a.competencia]) {
          skillStats[a.competencia].allocated += parseInt(a.esforco);
        }
      });

      const occupancyBySkill = Object.entries(skillStats)
        .map(([name, stats]) => ({
          name,
          ocupado: stats.allocated,
          livre: Math.max(0, stats.total - stats.allocated),
          percent: stats.total > 0 ? Math.round((stats.allocated / stats.total) * 100) : 0
        }))
        .filter(s => s.ocupado > 0 || s.livre > 0)
        .sort((a, b) => b.percent - a.percent);

      const totalHours = funcs.reduce((sum, f) => sum + (f.carga_horaria_max || 40), 0);
      const allocatedHours = alocs.reduce((sum, a) => sum + parseInt(a.esforco), 0);
      
      const employeeEffort = {};
      alocs.forEach(a => {
        employeeEffort[a.funcionarioId] = (employeeEffort[a.funcionarioId] || 0) + parseInt(a.esforco);
      });

      const overloadedEmployees = funcs
        .map(f => ({
          ...f,
          effort: employeeEffort[f.id] || 0,
          percent: Math.round(((employeeEffort[f.id] || 0) / (f.carga_horaria_max || 40)) * 100)
        }))
        .filter(f => f.percent > 100)
        .sort((a, b) => b.percent - a.percent);

      const strategicInsights = occupancyBySkill.map(s => {
        if (s.percent >= 80) {
          return {
            skill: s.name,
            type: 'danger',
            message: `Ocupação Crítica (${s.percent}%). Recomenda-se contratação estratégica ou revisão de cronogramas.`,
            icon: '⚠️'
          };
        }
        if (s.percent > 0 && s.percent <= 30) {
          return {
            skill: s.name,
            type: 'warning',
            message: `Baixa Demanda (${s.percent}%). Especialistas disponíveis para novos projetos ou suporte técnico.`,
            icon: '💡'
          };
        }
        return null;
      }).filter(Boolean);

      setData({
        occupancyBySkill,
        globalAvailability: [
          { name: 'Alocado', value: allocatedHours, fill: '#3b82f6' },
          { name: 'Livre', value: Math.max(0, totalHours - allocatedHours), fill: '#f1f5f9' }
        ],
        overloadedEmployees,
        strategicInsights,
        stats: {
          totalHours,
          allocatedHours,
          avgOccupancy: totalHours > 0 ? Math.round((allocatedHours / totalHours) * 100) : 0
        }
      });
    } catch (error) {
      console.error('Erro ao processar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: '#64748b' }}>
      <RefreshCw size={40} className="animate-spin" />
      <p style={{ fontWeight: '500' }}>Processando Inteligência de Dados...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: isMobile ? '100px' : '4rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Cabeçalho de Inteligência */}
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
              Inteligência de Alocação
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>Análise preditiva de capacidade e saúde da força de trabalho.</p>
          </div>
          {!isMobile && (
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
              Dados atualizados em tempo real
            </div>
          )}
        </div>

        {/* Estatísticas Chave */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '14px', border: '1px solid #dbeafe' }}>
              <Activity size={30} color="#3b82f6" />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ocupação Média</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{data.stats.avgOccupancy}%</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '14px', border: '1px solid #dcfce7' }}>
              <Clock size={30} color="#10b981" />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacidade Total</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{data.stats.totalHours}h<span style={{ fontSize: '0.9rem', color: '#94a3b8', marginLeft: '0.25rem', fontWeight: '500' }}>/sem</span></div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '1rem', borderRadius: '14px', border: '1px solid #ede9fe' }}>
              <TrendingUp size={30} color="#8b5cf6" />
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Especialidades</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{data.occupancyBySkill.length}</div>
            </div>
          </div>
        </div>

        {/* Grid de Gráficos e Disponibilidade */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Card de Competências */}
          <div className="card" style={{ padding: '2rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                <Users size={22} color="#3b82f6" fill="#3b82f615" /> Ocupação por Competência
              </h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '2px' }}></span> Crítico (&gt;80%)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></span> Alerta (&lt;30%)
                </div>
              </div>
            </div>
            
          <div style={{ 
            height: '420px', 
            overflowY: 'auto', 
            paddingRight: '0.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}>
            <div style={{ height: `${Math.max(420, data.occupancyBySkill.length * 35)}px`, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.occupancyBySkill} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={110} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                    axisLine={false} 
                    tickLine={false} 
                    interval={0}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const s = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: '#1e293b', color: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: 'none', zIndex: 100 }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>{s.name}</strong>
                            <div style={{ fontSize: '0.85rem' }}>
                              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8' }}>Capacidade: <span style={{ color: '#fff', fontWeight: 'bold' }}>{(s.ocupado + s.livre).toFixed(1)}h</span></p>
                              <p style={{ margin: '0 0 0.25rem 0', color: '#94a3b8' }}>Alocado: <span style={{ color: '#fff', fontWeight: 'bold' }}>{s.ocupado}h</span></p>
                              <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: s.percent >= 80 ? '#f87171' : s.percent <= 30 ? '#fbbf24' : '#60a5fa' }}>
                                Utilização: {s.percent}%
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="ocupado" stackId="a" barSize={18}>
                    {data.occupancyBySkill.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.percent >= 80 ? '#ef4444' : entry.percent <= 30 ? '#f59e0b' : '#3b82f6'} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="livre" stackId="a" fill="#f1f5f9" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </div>

          {/* Card Disponibilidade de Time */}
          <div className="card" style={{ padding: '2rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: '700', alignSelf: 'flex-start' }}>
              <Activity size={22} color="#10b981" fill="#10b98115" /> Saúde de Alocação
            </h3>
            <div style={{ height: '300px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.globalAvailability}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.globalAvailability.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', lineHeight: '1' }}>{data.stats.avgOccupancy}%</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: '0.25rem' }}>Ocupado</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', width: '100%', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Carga Horária Semanal</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '0.25rem' }}>{data.stats.allocatedHours}h <span style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>/ {data.stats.totalHours}h</span></div>
            </div>
          </div>
        </div>

        {/* Recomendações de Gestão */}
        <div className="card" style={{ padding: '2rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.35rem', color: '#0f172a', fontWeight: '800' }}>
              <Zap size={24} color="#f59e0b" fill="#f59e0b20" /> Recomendações Estratégicas
            </h3>
            {data.strategicInsights.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: '700', backgroundColor: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: '9999px' }}>
                {data.strategicInsights.length} Ações Sugeridas
              </span>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {data.strategicInsights.length > 0 ? (
              data.strategicInsights.map((insight, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    backgroundColor: '#fff',
                    border: `1px solid ${insight.type === 'danger' ? '#fee2e2' : '#fef3c7'}`,
                    borderLeft: `6px solid ${insight.type === 'danger' ? '#ef4444' : '#f59e0b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'default',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '0.4rem 1rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      backgroundColor: insight.type === 'danger' ? '#fef2f2' : '#fffbeb',
                      color: insight.type === 'danger' ? '#ef4444' : '#f59e0b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {insight.skill}
                    </div>
                    <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#334155', lineHeight: '1.6', fontWeight: '500' }}>
                    {insight.message}
                  </p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: insight.type === 'danger' ? '#ef4444' : '#f59e0b', fontSize: '0.85rem', fontWeight: '700' }}>
                    Ação sugerida <ChevronRight size={14} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#64748b', backgroundColor: '#fff', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
                <div style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                  <CheckCircle size={32} color="#10b981" />
                </div>
                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Equilíbrio Operacional</h4>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem' }}>Toda a capacidade produtiva está operando dentro das margens ideais.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de Sobrecarga */}
        <div className="card" style={{ padding: '2rem', border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: data.overloadedEmployees.length > 0 ? '#ef4444' : '#0f172a', fontWeight: '800', fontSize: '1.25rem' }}>
            <AlertTriangle size={24} /> Atenção Crítica: Funcionários em Sobrecarga
          </h3>
          {data.overloadedEmployees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#10b981', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: '700' }}>
                <CheckCircle size={20} /> Zero ocorrências de sobrecarga detectadas.
              </div>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nome do Profissional</th>
                    <th>Cargo Principal</th>
                    <th>Capacidade Máx</th>
                    <th>Carga Atual</th>
                    <th>Nível de Stress (%)</th>
                    <th>Status de Saúde</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overloadedEmployees.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{f.nome}</td>
                      <td style={{ color: '#64748b' }}>{f.cargo}</td>
                      <td style={{ color: '#64748b', fontWeight: '600' }}>{f.carga_horaria_max}h/sem</td>
                      <td style={{ color: '#ef4444', fontWeight: '800' }}>{f.effort}h</td>
                      <td style={{ minWidth: '150px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: '#ef4444', width: `${Math.min(100, f.percent)}%` }}></div>
                          </div>
                          <span style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.85rem' }}>{f.percent}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.4rem 0.8rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.7rem', 
                          fontWeight: '800',
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          textTransform: 'uppercase',
                          border: '1px solid #fee2e2'
                        }}>
                          Crítico
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
