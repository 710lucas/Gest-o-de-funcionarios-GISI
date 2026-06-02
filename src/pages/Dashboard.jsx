import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { api } from '../services/api';
import { Users, Building, DollarSign, Calendar, Filter, TrendingUp, PieChart as PieChartIcon, RefreshCw, FileDown, Upload, AlertCircle, Briefcase } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import AIChat from '../components/AIChat';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: IconComponent, color, isMobile }) => (
  <div className="stat-card" style={{ 
    padding: '1.5rem', 
    borderRadius: '16px', 
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
    backgroundColor: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1.25rem', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    flex: '1 1 240px',
    border: '1px solid #f1f5f9'
  }}>
    <div style={{ 
      backgroundColor: `${color}15`, 
      padding: '1rem', 
      borderRadius: '12px', 
      display : 'flex',
      border: `1px solid ${color}30`
    }}>
      <IconComponent size={isMobile ? 24 : 28} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="stat-label" style={{ 
        fontSize: '0.75rem', 
        color: '#64748b', 
        fontWeight: '700', 
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '0.25rem'
      }}>{title}</div>
      <div className="stat-value" style={{ 
        fontSize: isMobile ? '1.25rem' : '1.5rem', 
        fontWeight: '800', 
        color: '#0f172a', 
        wordWrap: 'break-word',
        lineHeight: '1.2'
      }}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFuncionarios: 0,
    totalDepartamentos: 0,
    folhaSalarial: 0,
    mediaSalarial: 0,
  });
  
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepartamento, setSelectedDepartamento] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [chartData, setChartData] = useState({
    departamentoData: [],
    cargoData: [],
    salarioRangeData: [],
    topSalarios: [],
    projetoStatusData: [],
    competencyData: []
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  const loadStats = async (departamento = '') => {
    try {
      const [allEmployees, allProjects, allAllocations] = await Promise.all([
        api.getAll(),
        api.getAllProjetos(),
        api.getAllAlocacoes()
      ]);
      
      let data = allEmployees || [];
      
      if (!Array.isArray(data)) {
        console.warn('Dados inválidos recebidos:', data);
        data = [];
      }
    
    const allDepartamentos = [...new Set(data.map(f => f.departamento).filter(Boolean))];
    setDepartamentos(allDepartamentos);

    if (departamento) {
      data = data.filter(f => f.departamento === departamento);
    }
    
    const totalFuncionarios = data.length;
    const qtdDepartamentos = departamento ? 1 : new Set(data.map(f => f.departamento)).size;
    const folhaSalarial = data.reduce((acc, curr) => acc + parseFloat(curr.salario || 0), 0);
    const mediaSalarial = totalFuncionarios > 0 ? folhaSalarial / totalFuncionarios : 0;

    setStats({
      totalFuncionarios,
      totalDepartamentos: qtdDepartamentos,
      folhaSalarial,
      mediaSalarial
    });

    const deptCount = {};
    const cargoCount = {};
    data.forEach(f => {
      if (f.departamento) {
        deptCount[f.departamento] = (deptCount[f.departamento] || 0) + 1;
      }
      if (f.cargo) {
        cargoCount[f.cargo] = (cargoCount[f.cargo] || 0) + 1;
      }
    });

    const departamentoData = Object.entries(deptCount).map(([name, value]) => ({
      name,
      funcionarios: value,
      salarioTotal: data
        .filter(f => f.departamento === name)
        .reduce((acc, f) => acc + parseFloat(f.salario || 0), 0)
    }));

    const cargoData = Object.entries(cargoCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const salarioRanges = {
      'Até R$ 2.000': 0,
      'R$ 2.001 - R$ 4.000': 0,
      'R$ 4.001 - R$ 6.000': 0,
      'R$ 6.001 - R$ 8.000': 0,
      'R$ 8.001 - R$ 10.000': 0,
      'Acima de R$ 10.000': 0
    };

    data.forEach(f => {
      const sal = parseFloat(f.salario || 0);
      if (sal <= 2000) salarioRanges['Até R$ 2.000']++;
      else if (sal <= 4000) salarioRanges['R$ 2.001 - R$ 4.000']++;
      else if (sal <= 6000) salarioRanges['R$ 4.001 - R$ 6.000']++;
      else if (sal <= 8000) salarioRanges['R$ 6.001 - R$ 8.000']++;
      else if (sal <= 10000) salarioRanges['R$ 8.001 - R$ 10.000']++;
      else salarioRanges['Acima de R$ 10.000']++;
    });

    const salarioRangeData = Object.entries(salarioRanges).map(([faixa, quantidade]) => ({
      faixa,
      quantidade
    }));

    const topSalarios = [...data]
      .sort((a, b) => parseFloat(b.salario || 0) - parseFloat(a.salario || 0))
      .slice(0, 10)
      .map(f => ({
        nome: f.nome,
        cargo: f.cargo,
        salario: parseFloat(f.salario || 0)
      }));

    // Projetos por Status
    const projectStatusCount = {};
    allProjects.forEach(p => {
      projectStatusCount[p.status] = (projectStatusCount[p.status] || 0) + 1;
    });
    const projetoStatusData = Object.entries(projectStatusCount).map(([name, value]) => ({ name, value }));

    // Top 8 Competências
    const skillCount = {};
    data.forEach(f => {
      (f.competencias || []).forEach(s => {
        skillCount[s] = (skillCount[s] || 0) + 1;
      });
    });
    const competencyData = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    setChartData({
      departamentoData,
      cargoData,
      salarioRangeData,
      topSalarios,
      projetoStatusData,
      competencyData
    });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        totalFuncionarios: 0,
        totalDepartamentos: 0,
        folhaSalarial: 0,
        mediaSalarial: 0
      });
      setChartData({
        departamentoData: [],
        cargoData: [],
        salarioRangeData: [],
        topSalarios: [],
        projetoStatusData: [],
        competencyData: []
      });
    }
  };

  useEffect(() => {
    api.init().then(() => {
      loadStats(selectedDepartamento);
    });
  }, [selectedDepartamento]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImportCsv = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const firstRow = results.data[0];
            if (!('nome' in firstRow) && !('cargo' in firstRow)) {
               alert('CSV inválido!');
               return;
            }
            const dataToImport = results.data.map((item, index) => ({
                id: item.id || Date.now() + index,
                ...item
            }));
            api.importData(dataToImport);
            loadStats(selectedDepartamento);
            alert('Dados importados com sucesso!');
          } else {
            alert('Não foi possível ler dados do arquivo.');
          }
        },
        error: (error) => {
          console.error(error);
          alert('Erro ao processar o arquivo CSV.');
        }
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="container" style={{ padding: isMobile ? '1rem' : '2rem', paddingBottom: isMobile ? '80px' : '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: isMobile ? '1rem' : '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', color: '#1f2937' }}>Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: isMobile ? '0.875rem' : '1rem' }}>
            Visão geral da gestão de funcionários
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', width: isMobile ? '100%' : 'fit-content' }}>
          <Filter size={20} color="#6b7280" />
          <select 
            value={selectedDepartamento}
            onChange={(e) => setSelectedDepartamento(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: isMobile ? '0.875rem' : '1rem', color: '#374151', cursor: 'pointer', width: isMobile ? '100%' : 'auto' }}
          >
            <option value="">Todos os Departamentos</option>
            {departamentos.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid" style={{ 
        display: 'flex',
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        gap: isMobile ? '1rem' : '1.5rem', 
        marginBottom: isMobile ? '1rem' : '2rem' 
      }}>
        <StatCard 
          title="Funcionários" 
          value={stats.totalFuncionarios} 
          icon={Users}
          color="#3b82f6"
          isMobile={isMobile}
        />
        <StatCard 
          title="Departamentos" 
          value={stats.totalDepartamentos} 
          icon={Building}
          color="#10b981"
          isMobile={isMobile}
        />
        <StatCard 
          title="Folha Salarial" 
          value={formatCurrency(stats.folhaSalarial)} 
          icon={DollarSign}
          color="#f59e0b"
          isMobile={isMobile}
        />
        <StatCard 
          title="Média Salarial" 
          value={formatCurrency(stats.mediaSalarial)} 
          icon={Calendar}
          color="#8b5cf6"
          isMobile={isMobile}
        />
      </div>

      <AIChat isMobile={isMobile} />

      <div className="card" style={{ 
        backgroundColor: '#fff', 
        padding: '1.5rem', 
        borderRadius: '16px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', 
        marginTop: '2rem',
        border: '1px solid #f1f5f9',
        background: 'linear-gradient(to right, #fff, #f8fafc)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <RefreshCw size={22} color="#6366f1" />
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '700' }}>Gestão de Dados</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={api.exportCsv} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.6rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontWeight: '600'
          }}>
            <FileDown size={18} /> Exportar base atual
          </button>
          
          <label className="btn btn-primary" style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.6rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontWeight: '600',
            backgroundColor: '#0f172a'
          }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCsv} 
              style={{ display: 'none' }} 
            />
            <Upload size={18} /> Importar novo CSV
          </label>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            A importação substituirá permanentemente todos os registros atuais.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        
        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Building size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Funcionários por Departamento</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.departamentoData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} height={40} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="funcionarios" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieChartIcon size={20} color="#10b981" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Distribuição de Cargos</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.cargoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                labelLine={false}
                dataKey="value"
                stroke="none"
              >
                {chartData.cargoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 500 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Briefcase size={20} color="#6366f1" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Status dos Projetos</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.projetoStatusData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={90}
                paddingAngle={0}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.projetoStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 500 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <TrendingUp size={20} color="#ec4899" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Radar de Competências</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData.competencyData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
              <Radar
                name="Profissionais"
                dataKey="value"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.5}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <DollarSign size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Faixas Salariais</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.salarioRangeData}>
              <defs>
                <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="faixa" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} height={50} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="quantidade" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorQuantidade)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <DollarSign size={20} color="#8b5cf6" />
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Custo por Departamento</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.departamentoData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} height={40} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                formatter={(value) => [formatCurrency(value), 'Custo Total']}
              />
              <Line type="monotone" dataKey="salarioTotal" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '2rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <TrendingUp size={20} color="#6366f1" />
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '700' }}>Ranking de Maiores Salários</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>#</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Profissional</th>
                {!isMobile && <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Cargo</th>}
                <th style={{ padding: '1rem', textAlign: 'right', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase' }}>Vencimentos</th>
              </tr>
            </thead>
            <tbody>
              {chartData.topSalarios.map((func, index) => (
                <tr key={index} style={{ backgroundColor: '#f8fafc', transition: 'transform 0.2s' }}>
                  <td style={{ padding: '1rem', borderRadius: '12px 0 0 12px', color: '#94a3b8', fontWeight: '700' }}>{index + 1}</td>
                  <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '700' }}>{func.nome}</td>
                  {!isMobile && <td style={{ padding: '1rem', color: '#64748b', fontWeight: '500' }}>{func.cargo}</td>}
                  <td style={{ padding: '1rem', borderRadius: '0 12px 12px 0', color: '#10b981', fontWeight: '800', textAlign: 'right' }}>
                    {formatCurrency(func.salario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
