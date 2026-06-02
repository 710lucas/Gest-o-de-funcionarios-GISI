import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, AlertTriangle, CheckCircle, TrendingUp, Activity, Zap, Clock } from 'lucide-react';

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

      // 1. Processar Ocupação por Skill
      const skillStats = {};
      const allSkills = api.getCompetenciasPadrao();
      allSkills.forEach(s => skillStats[s] = { total: 0, allocated: 0 });

      // Horas totais disponíveis por skill
      funcs.forEach(f => {
        (f.competencias || []).forEach(s => {
          if (skillStats[s]) {
            skillStats[s].total += f.carga_horaria_max / (f.competencias.length || 1);
          }
        });
      });

      // Horas alocadas por skill
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

      // 2. Disponibilidade Global
      const totalHours = funcs.reduce((sum, f) => sum + (f.carga_horaria_max || 40), 0);
      const allocatedHours = alocs.reduce((sum, a) => sum + parseInt(a.esforco), 0);
      
      // 3. Funcionários Sobrecarregados
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

      // 4. Insights Estratégicos
      const strategicInsights = occupancyBySkill.map(s => {
        if (s.percent >= 80) {
          return {
            skill: s.name,
            type: 'danger',
            message: `Ocupação Crítica (${s.percent}%). Considere contratar mais especialistas ou expandir prazos.`,
            icon: '⚠️'
          };
        }
        if (s.percent > 0 && s.percent <= 30) {
          return {
            skill: s.name,
            type: 'warning',
            message: `Capacidade Ociosa (${s.percent}%). Profissionais podem ser realocados ou a demanda está baixa.`,
            icon: '💡'
          };
        }
        return null;
      }).filter(Boolean);

      setData({
        occupancyBySkill,
        globalAvailability: [
          { name: 'Alocado', value: allocatedHours, fill: '#3b82f6' },
          { name: 'Disponível', value: Math.max(0, totalHours - allocatedHours), fill: '#e5e7eb' }
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

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Gerando inteligência de dados...</div>;

  return (
    <div className="container" style={{ paddingBottom: isMobile ? '80px' : '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem' }}>Inteligência de Alocação</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Análise profunda de capacidade, skills e saúde operacional</p>
      </div>

      <div className="stats-grid" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ocupação Média</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.avgOccupancy}%</span>
            <Activity size={24} color={data.stats.avgOccupancy > 90 ? '#ef4444' : '#3b82f6'} />
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Horas/Semana</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.totalHours}h</span>
            <Clock size={24} color="#10b981" />
          </div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '200px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Skills Ativas</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.occupancyBySkill.length}</span>
            <TrendingUp size={24} color="#8b5cf6" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Users size={20} color="#3b82f6" /> Ocupação por Competência (Horas)
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div> Crítico (&gt;80%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div> Alerta (&lt;30%)
              </span>
            </div>
          </div>
          <div style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.occupancyBySkill} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} interval={0} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const s = payload[0].payload;
                      return (
                        <div style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{s.name}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                            <p style={{ margin: 0 }}>Capacidade: {(s.ocupado + s.livre).toFixed(1)}h</p>
                            <p style={{ margin: 0 }}>Alocado: {s.ocupado}h</p>
                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: s.percent >= 80 ? '#ef4444' : s.percent <= 30 ? '#f59e0b' : '#3b82f6' }}>
                              Uso: {s.percent}%
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="ocupado" stackId="a" radius={[0, 0, 0, 0]}>
                  {data.occupancyBySkill.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.percent >= 80 ? '#ef4444' : entry.percent <= 30 ? '#f59e0b' : '#3b82f6'} 
                    />
                  ))}
                </Bar>
                <Bar dataKey="livre" name="Capacidade Ociosa" stackId="a" fill="#f1f5f9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#10b981" /> Disponibilidade de Time
          </h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.globalAvailability}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.globalAvailability.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Capacidade utilizada</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{data.stats.allocatedHours}h de {data.stats.totalHours}h</div>
          </div>
        </div>
      </div>

      {/* Insights Estratégicos */}
      <div className="card" style={{ padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="#8b5cf6" /> Recomendações Estratégicas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {data.strategicInsights.length > 0 ? (
            data.strategicInsights.map((insight, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '1rem', 
                  borderRadius: '10px', 
                  backgroundColor: insight.type === 'danger' ? '#fef2f2' : '#fffbeb',
                  borderLeft: `4px solid ${insight.type === 'danger' ? '#ef4444' : '#f59e0b'}`,
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{insight.icon}</span>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: insight.type === 'danger' ? '#991b1b' : '#92400e', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {insight.skill}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: insight.type === 'danger' ? '#b91c1c' : '#b45309', lineHeight: '1.4' }}>
                    {insight.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <CheckCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>Capacidade operacional equilibrada. Nenhuma ação recomendada no momento.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: data.overloadedEmployees.length > 0 ? '#ef4444' : '#111827' }}>
          <AlertTriangle size={20} /> Atenção: Funcionários com Sobrecarga
        </h3>
        {data.overloadedEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#10b981' }}>
            <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
            <p>Nenhum funcionário sobrecarregado no momento.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Carga Máx</th>
                  <th>Carga Atual</th>
                  <th>Uso (%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.overloadedEmployees.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 'bold' }}>{f.nome}</td>
                    <td>{f.cargo}</td>
                    <td>{f.carga_horaria_max}h</td>
                    <td style={{ color: '#ef4444', fontWeight: 'bold' }}>{f.effort}h</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '8px', background: '#fee2e2', borderRadius: '4px', minWidth: '60px' }}>
                          <div style={{ height: '100%', background: '#ef4444', width: `${Math.min(100, f.percent)}%`, borderRadius: '4px' }}></div>
                        </div>
                        <span>{f.percent}%</span>
                      </div>
                    </td>
                    <td><span className="status-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>Sobrecarregado</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
