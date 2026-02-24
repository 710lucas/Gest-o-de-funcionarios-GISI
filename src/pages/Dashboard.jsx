import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { api } from '../services/api';
import { Users, Building, DollarSign, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
      <Icon size={32} color={color} />
    </div>
    <div className="stat-label">{title}</div>
    <div className="stat-value">{value}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFuncionarios: 0,
    totalDepartamentos: 0,
    folhaSalarial: 0,
    mediaSalarial: 0,
  });

  const loadStats = () => {
    const data = api.getAll();
    
    const totalFuncionarios = data.length;
    const departamentos = new Set(data.map(f => f.departamento)).size;
    const folhaSalarial = data.reduce((acc, curr) => acc + parseFloat(curr.salario), 0);
    const mediaSalarial = totalFuncionarios > 0 ? folhaSalarial / totalFuncionarios : 0;

    setStats({
      totalFuncionarios,
      totalDepartamentos: departamentos,
      folhaSalarial,
      mediaSalarial
    });
  };

  useEffect(() => {
    // Carrega dados iniciais da API
    api.init().then(() => {
      loadStats();
    });
  }, []);

  const handleImportCsv = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            // Verifica se o CSV tem pelo menos um campo esperado
            const firstRow = results.data[0];
            if (!firstRow.hasOwnProperty('nome') && !firstRow.hasOwnProperty('cargo')) {
               alert('CSV inválido! Certifique-se de que o arquivo tenha cabeçalhos como "nome", "cargo", etc.');
               return;
            }

            // Injeta IDs se faltarem (simples)
            const dataToImport = results.data.map((item, index) => ({
                id: item.id || Date.now() + index, // Gera ID se não tiver
                ...item
            }));

            api.importData(dataToImport);
            loadStats();
            alert('Dados importados com sucesso!');
          } else {
            alert('Não foi possível ler dados do arquivo.');
          }
        },
        error: (error) => {
          console.error('Erro ao importar CSV:', error);
          alert('Erro ao processar o arquivo CSV.');
        }
      });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Visão geral da gestão de funcionários
      </p>

      <div className="stats-grid">
        <StatCard 
          title="Total de Funcionários" 
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
          icon={Calendar} // Usando ícone genérico
          color="#8b5cf6"
        />
      </div>

      <div className="card">
        <h3>Ações Rápidas (Banco de Dados)</h3>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={api.exportCsv}>
            <DollarSign size={16} /> Baixar CSV Atual
          </button>
          
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCsv} 
              style={{ display: 'none' }} 
            />
            <Users size={16} /> Importar CSV
          </label>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
            * Ao importar, os dados atuais serão substituídos pelos do arquivo.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
