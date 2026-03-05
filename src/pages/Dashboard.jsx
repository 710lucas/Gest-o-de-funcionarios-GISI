import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { api } from '../services/api';
import { Users, Building, DollarSign, Calendar, Filter, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}>
    <div style={{ backgroundColor: `${color}20`, padding: '1rem', borderRadius: '50%' }}>
      <Icon size={32} color={color} />
    </div>
    <div>
      <div className="stat-label" style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{title}</div>
      <div className="stat-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</div>
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
  const [chartData, setChartData] = useState({
    departamentoData: [],
    cargoData: [],
    salarioRangeData: [],
    topSalarios: []
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  const loadStats = (departamento = '') => {
    let data = api.getAll();
    
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

    setChartData({
      departamentoData,
      cargoData,
      salarioRangeData,
      topSalarios
    });
  };
  useEffect(() => {
    api.init().then(() => {
      loadStats(selectedDepartamento);
    });
  }, [selectedDepartamento]);
  const handleImportCsv = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const firstRow = results.data[0];
            if (!firstRow.hasOwnProperty('nome') && !firstRow.hasOwnProperty('cargo')) {
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
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Dashboard</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            Visão geral da gestão de funcionários
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Filter size={20} color="#6b7280" />
          <select 
            value={selectedDepartamento}
            onChange={(e) => setSelectedDepartamento(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '1rem', color: '#374151', cursor: 'pointer' }}
          >
            <option value="">Todos os Departamentos</option>
            {departamentos.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Funcionários" 
          value={stats.totalFuncionarios} 
          icon={Users}
          color="#3b82f6"
        />
        <StatCard 
          title="Departamentos" 
          value={stats.totalDepartamentos} 
          icon={Building}
          color="#10b981"
        />
        <StatCard 
          title="Folha Salarial" 
          value={formatCurrency(stats.folhaSalarial)} 
          icon={DollarSign}
          color="#f59e0b"
        />
        <StatCard 
          title="Média Salarial" 
          value={formatCurrency(stats.mediaSalarial)} 
          icon={Calendar}
          color="#8b5cf6"
        />
      </div>

      <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, color: '#1f2937' }}>Ações Rápidas (Banco de Dados)</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={api.exportCsv} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={16} /> Baixar CSV Atual
          </button>
          
          <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCsv} 
              style={{ display: 'none' }} 
            />
            <Users size={16} /> Importar CSV
          </label>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#9ca3af' }}>
            * Ao importar, os dados atuais serão substituídos pelos do arquivo.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        
        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Building size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Funcionários por Departamento</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.departamentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [value, 'Funcionários']}
              />
              <Bar dataKey="funcionarios" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChartIcon size={20} color="#10b981" />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Distribuição de Cargos</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.cargoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.cargoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <DollarSign size={20} color="#f59e0b" />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Faixas Salariais</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.salarioRangeData}>
              <defs>
                <linearGradient id="colorQuantidade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="faixa" tick={{ fill: '#6b7280', fontSize: 10 }} angle={-15} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [value, 'Funcionários']}
              />
              <Area type="monotone" dataKey="quantidade" stroke="#f59e0b" fillOpacity={1} fill="url(#colorQuantidade)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <DollarSign size={20} color="#8b5cf6" />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Folha Salarial por Departamento</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.departamentoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                formatter={(value) => [formatCurrency(value), 'Total']}
              />
              <Legend />
              <Line type="monotone" dataKey="salarioTotal" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Salário Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingUp size={20} color="#ef4444" />
          <h3 style={{ margin: 0, color: '#1f2937' }}>Top 10 Maiores Salários</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#374151', fontWeight: '600' }}>#</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#374151', fontWeight: '600' }}>Cargo</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#374151', fontWeight: '600' }}>Salário</th>
              </tr>
            </thead>
            <tbody>
              {chartData.topSalarios.map((func, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>{index + 1}</td>
                  <td style={{ padding: '0.75rem', color: '#111827', fontWeight: '500' }}>{func.nome}</td>
                  <td style={{ padding: '0.75rem', color: '#6b7280' }}>{func.cargo}</td>
                  <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: '600', textAlign: 'right' }}>
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
