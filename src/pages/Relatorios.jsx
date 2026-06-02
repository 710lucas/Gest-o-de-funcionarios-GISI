import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai';
import { api } from '../services/api';
import { Loader2, Download, FileText, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const COLORS = ['#0f172a', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'];

const Relatorios = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      setIsConfigured(false);
    } else {
      setIsConfigured(true);
    }
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.generateReport(prompt);
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao gerar relatório.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const container = document.getElementById('report-document-container');
    if (!container) return;

    setExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // 1. Cabeçalho
      const header = container.querySelector('.report-header');
      if (header) {
        const canvas = await html2canvas(header, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      }

      // 2. Seções
      const sections = container.querySelectorAll('.report-section');
      for (const section of sections) {
        const canvas = await html2canvas(section, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > pdfHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      }

      pdf.save(`relatorio-executivo-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF", err);
      alert("Erro ao exportar PDF.");
    } finally {
      setExporting(false);
    }
  };

  const renderChart = (chartConfig, sectionId) => {
    if (!reportData || !reportData.datasets || !chartConfig) return null;
    
    // Tenta achar o dataset pelo nome configurado ou pelo ID da seção
    let data = reportData.datasets[chartConfig.datasetName] || reportData.datasets[sectionId];
    
    // Gráficos Recharts PRECISAM de um array. Se for um objeto único, envolvemos em array.
    if (data && !Array.isArray(data)) {
      data = [data];
    }
    
    if (!data || data.length === 0) return <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Sem dados suficientes para visualização.</p>;

    const { type, xAxis, dataKey } = chartConfig;

    return (
      <div style={{ width: '100%', height: '300px', marginTop: '1rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={xAxis} tick={{fontSize: 10, fill: '#64748b'}} interval={0} />
              <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#1e293b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          )}
          {type === 'line' && (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={xAxis} tick={{fontSize: 11, fill: '#64748b'}} />
              <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke="#1e293b" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          )}
          {type === 'area' && (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey={xAxis} tick={{fontSize: 11, fill: '#64748b'}} />
              <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
              <Tooltip />
              <Area type="monotone" dataKey={dataKey} stroke="#0f172a" fill="#1e293b20" strokeWidth={2} isAnimationActive={false} />
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
                outerRadius={80}
                dataKey={dataKey}
                isAnimationActive={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem', maxWidth: '1200px' }}>
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ color: '#0f172a', fontSize: '1.875rem', fontWeight: '800', marginBottom: '0.25rem' }}>Executive Intelligence Report</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Análise estratégica de capital humano baseada em inteligência artificial.</p>
        </div>
        {reportData && (
          <button 
            onClick={handleDownloadPDF} 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#0f172a', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: '600' }}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {exporting ? 'Exportando Documento...' : 'Baixar Relatório Executivo'}
          </button>
        )}
      </header>

      {!isConfigured && (
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={24} color="#64748b" />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Configuração Necessária</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Adicione uma API Key nas configurações para ativar o motor de IA.</p>
          </div>
          <Link to="/configuracoes" className="btn btn-secondary" style={{ backgroundColor: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}>Configurar</Link>
        </div>
      )}

      <div className="card" style={{ marginBottom: '3rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px -3px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Briefing de Análise</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva o foco estratégico (ex: Impacto salarial por departamento, tendência de contratações...)"
              rows={3}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '1rem', color: '#1e293b', outline: 'none' }}
              disabled={!isConfigured || loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={!isConfigured || loading}
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#1e293b', padding: '0.8rem 2rem', fontWeight: '600' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            {loading ? 'Consultando Motor de IA...' : 'Gerar Análise Estratégica'}
          </button>
        </form>
      </div>

      {reportData && !loading && (
        <div style={{ marginTop: '2rem' }}>
          <div 
            id="report-document-container"
            style={{
              width: '100%',
              maxWidth: '210mm',
              minHeight: '297mm',
              padding: '20mm',
              backgroundColor: '#ffffff',
              margin: '0 auto',
              boxSizing: 'border-box',
              color: '#000',
              fontFamily: "serif", // Mais formal
              lineHeight: '1.5'
            }}
          >
            <div className="report-header" style={{ marginBottom: '3rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                {reportData.reportTitle}
              </h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt', color: '#333' }}>
                <span>REFERÊNCIA: {reportData.period}</span>
                <span>EMISSÃO: {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            {reportData.sections && reportData.sections.map((section, idx) => (
              <div key={idx} className="report-section" style={{ marginBottom: '4rem', pageBreakInside: 'avoid' }}>
                <h3 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '1.5rem', paddingBottom: '0.2rem' }}>
                  {section.title}
                </h3>

                {section.type === 'cards' && section.metrics && (
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {section.metrics.map((metric, midx) => {
                      const dataset = reportData.datasets[metric.datasetName] || reportData.datasets[section.id];
                      // Se o dataset for um array, pega o primeiro item. Se for um objeto, usa ele mesmo.
                      const dataObj = Array.isArray(dataset) ? dataset[0] : dataset;
                      const val = dataObj?.[metric.dataKey];
                      
                      const formatVal = typeof val === 'number' 
                        ? val.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) 
                        : (val !== undefined && val !== null ? val : '---');
                        
                      return (
                        <div key={midx} style={{ borderLeft: '3px solid #000', paddingLeft: '1rem' }}>
                          <div style={{ fontSize: '9pt', color: '#666', textTransform: 'uppercase' }}>{metric.label}</div>
                          <div style={{ fontSize: '18pt', fontWeight: 'bold' }}>{metric.prefix || ''}{formatVal}{metric.suffix || ''}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {section.type === 'chart' && section.chartConfig && (
                  <div style={{ marginBottom: '2rem', height: '350px' }}>
                    {renderChart(section.chartConfig, section.chartConfig.datasetName || section.id)}
                  </div>
                )}

                {section.insight && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'justify' }}>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '0.5rem', textDecoration: 'underline' }}>Análise Técnica:</div>
                    <div className="markdown-content" style={{ fontSize: '11pt', color: '#333' }}>
                      <ReactMarkdown>{section.insight}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <footer style={{ marginTop: '5rem', borderTop: '1px solid #000', paddingTop: '1rem', fontSize: '8pt', color: '#666', textAlign: 'center' }}>
              RELATÓRIO DE GESTÃO DE PESSOAL • CONFIDENCIAL
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;