import React, { useState, useEffect } from 'react';
import { Send, Bot, Loader2, BarChart2, MessageSquare, AlertCircle, Settings, ExternalLink } from 'lucide-react';
import { aiService } from '../services/ai';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const AIChat = ({ isMobile }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [placeholder, setPlaceholder] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);

  const placeholders = [
    "Compare a quantidade de funcionários e a média salarial por departamento",
    "Mostre a evolução de contratações e o aumento da folha salarial por ano",
    "Distribuição de cargos e os 5 maiores salários da empresa",
    "Analise o crescimento anual vs distribuição por departamento",
    "Panorama geral: total por setor e média de tempo de casa",
    "Qual o impacto salarial dos novos funcionários em 2025?"
  ];

  useEffect(() => {
    // Escolhe um placeholder aleatório apenas ao montar o componente
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    setPlaceholder(placeholders[randomIndex]);

    // Verificar se a IA está configurada
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      setIsConfigured(false);
    } else {
      setIsConfigured(true);
    }
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await aiService.query(query);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao processar sua solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (chartConfig) => {
    if (!result || !result.datasets || !chartConfig) return null;

    const { type, xAxis, dataKey, title, datasetName, prefix = '', suffix = '' } = chartConfig;
    
    // Garantir que temos um nome de dataset e que ele existe nos resultados
    if (!datasetName || !result.datasets[datasetName]) {
      return (
        <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '8px', margin: '1rem 0' }}>
          <p style={{ margin: 0, color: '#991b1b', fontSize: '0.875rem' }}>
            <strong>Erro no Gráfico:</strong> Dataset "{datasetName || 'N/A'}" não encontrado ou não definido pela IA.
          </p>
        </div>
      );
    }

    const data = result.datasets[datasetName];

    // Se for card, pode ser um objeto ou o primeiro item de um array
    if (type === 'card') {
      const value = Array.isArray(data) ? (data[0]?.[dataKey] ?? 0) : (data[dataKey] ?? 0);
      const formattedValue = typeof value === 'number' 
        ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) 
        : (value ?? 'N/A');

      return (
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1.5rem', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0',
          textAlign: 'center',
          margin: '1rem auto',
          maxWidth: '300px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <h5 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </h5>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
            <span style={{ fontSize: '1.2rem', color: '#94a3b8', marginRight: '0.25rem' }}>{prefix}</span>
            {formattedValue}
            <span style={{ fontSize: '1rem', color: '#94a3b8', marginLeft: '0.25rem' }}>{suffix}</span>
          </div>
        </div>
      );
    }

    // Para outros tipos, precisamos de um array
    if (!Array.isArray(data) || data.length === 0) {
      return <p style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Sem dados suficientes para gerar o gráfico "{title}".</p>;
    }

    return (
      <div style={{ marginTop: '1rem', height: isMobile ? '300px' : '400px', width: '100%', marginBottom: '2rem' }}>
        <h4 style={{ color: '#374151', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{title}</h4>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey={xAxis || 'name'} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey || 'value'} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
          {type === 'line' && (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey={xAxis || 'name'} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={dataKey || 'value'} stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
          {type === 'area' && (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey={xAxis || 'name'} tick={{fontSize: 12}} />
              <YAxis tick={{fontSize: 12}} />
              <Tooltip />
              <Area type="monotone" dataKey={dataKey || 'value'} stroke="#8b5cf6" fill="#8b5cf640" strokeWidth={2} />
            </AreaChart>
          )}
          {type === 'pie' && (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={isMobile ? 70 : 100}
                fill="#8884d8"
                dataKey={dataKey || 'value'}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="card" style={{ 
      backgroundColor: '#fff', 
      padding: isMobile ? '1rem' : '1.5rem', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      marginTop: '2rem',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#8b5cf620', padding: '0.5rem', borderRadius: '50%' }}>
          <Bot size={24} color="#8b5cf6" />
        </div>
        <div>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Assistente de Dados IA</h3>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            Pergunte qualquer coisa sobre os funcionários
          </p>
        </div>
      </div>

      {!isConfigured && (
        <div style={{ 
          backgroundColor: '#fff7ed', 
          border: '1px solid #ffedd5', 
          borderRadius: '8px', 
          padding: '1rem', 
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9a3412' }}>
            <AlertCircle size={20} />
            <strong style={{ fontSize: '0.95rem' }}>Configuração Necessária</strong>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#c2410c', lineHeight: '1.5' }}>
            A API Key não foi configurada. Para usar o assistente de IA, por favor vá até a aba de 
            <strong> configurações</strong> e adicione sua chave.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/configuracoes" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.875rem', 
              color: '#8b5cf6', 
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              <Settings size={16} />
              Ir para Configurações
            </Link>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.875rem', 
              color: '#3b82f6', 
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              <ExternalLink size={16} />
              Obter API Key no Google AI Studio
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isConfigured ? `Ex: ${placeholder}` : "Configure a API Key para começar..."}
          aria-label="Pergunta para o assistente de IA"
          className="form-input"
          style={{ 
            flex: 1, 
            transition: 'all 0.3s ease',
            backgroundColor: isConfigured ? '#fff' : '#f3f4f6',
            cursor: isConfigured ? 'text' : 'not-allowed'
          }}
          disabled={loading || !isConfigured}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          style={{ 
            backgroundColor: isConfigured ? '#8b5cf6' : '#a78bfa', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '0.75rem 1.25rem',
            cursor: isConfigured ? 'pointer' : 'not-allowed'
          }}
          disabled={loading || !query.trim() || !isConfigured}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', width: '100%', marginBottom: '0.25rem' }}>
          💡 Sugestões de análise complexa:
        </span>
        {placeholders.slice(0, 3).map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => isConfigured && setQuery(p)}
            style={{
              fontSize: '0.7rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #e5e7eb',
              backgroundColor: isConfigured ? '#f9fafb' : '#f3f4f6',
              color: isConfigured ? '#4b5563' : '#9ca3af',
              cursor: isConfigured ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              opacity: isConfigured ? 1 : 0.7
            }}
            onMouseOver={(e) => { 
              if (isConfigured) {
                e.target.style.borderColor = '#8b5cf6'; 
                e.target.style.color = '#8b5cf6'; 
              }
            }}
            onMouseOut={(e) => { 
              if (isConfigured) {
                e.target.style.borderColor = '#e5e7eb'; 
                e.target.style.color = '#4b5563'; 
              }
            }}
            disabled={!isConfigured}
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          borderRadius: '8px', 
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Loader2 className="animate-spin" size={40} color="#8b5cf6" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: '#6b7280' }}>Analisando dados e gerando resposta...</p>
        </div>
      )}

      {result && !loading && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          <div style={{ 
            backgroundColor: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '8px', 
            borderLeft: '4px solid #8b5cf6',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#8b5cf6' }}>
              <MessageSquare size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Plano de Execução:</strong>
            </div>
            <div className="markdown-content" style={{ margin: 0, color: '#4b5563', fontSize: '0.95rem' }}>
              <ReactMarkdown>{result.explanation}</ReactMarkdown>
            </div>
          </div>

          <div style={{ border: '1px solid #f3f4f6', borderRadius: '12px', padding: '1rem', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
              <BarChart2 size={18} />
              <strong style={{ fontSize: '0.9rem' }}>Gráficos Gerados:</strong>
            </div>
            {result.charts && result.charts.map((chartConfig, idx) => (
              <React.Fragment key={idx}>
                {renderChart(chartConfig)}
              </React.Fragment>
            ))}
            {(!result.charts || result.charts.length === 0) && (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>Nenhum gráfico disponível para esta consulta.</p>
            )}
          </div>

          <div style={{ 
            marginTop: '1.5rem',
            backgroundColor: '#eff6ff', 
            padding: '1.25rem', 
            borderRadius: '8px', 
            border: '1px solid #dbeafe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#3b82f6' }}>
              <Bot size={20} />
              <strong style={{ fontSize: '1rem' }}>Interpretação da IA:</strong>
            </div>
            <div className="markdown-content" style={{ margin: 0, color: '#1e40af', lineHeight: '1.6', fontSize: '1rem' }}>
              <ReactMarkdown>{result.finalInterpretation}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
