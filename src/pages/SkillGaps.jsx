import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, FileText, Download, Copy, Check } from 'lucide-react';
import { api } from '../services/api';
import { aiService } from '../services/ai';
import { jsPDF } from 'jspdf';

const SkillGaps = () => {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState(null);
  const [formData, setFormData] = useState({
    senioridade: 'Pleno',
    salario: '',
    beneficios: ''
  });
  const [generating, setGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        api.getAllProjetos(),
        api.getAllAlocacoes()
      ]);
      setProjetos(p);
      setAlocacoes(a);
    } catch (e) {
      console.error(e);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getGaps = () => {
    const gaps = [];
    projetos.forEach(p => {
      // Ignoramos apenas projetos já concluídos
      if (p.status === 'Concluído') return;
      
      const projAloc = alocacoes.filter(a => a.projetoId == p.id);
      p.requisitos.forEach(req => {
        const alocadosReq = projAloc.filter(a => a.competencia === req.competencia).length;
        const missing = req.quantidade - alocadosReq;
        if (missing > 0) {
          gaps.push({
            projeto: p,
            competencia: req.competencia,
            faltam: missing
          });
        }
      });
    });
    return gaps;
  };

  const gaps = getGaps();

  const handleOpenModal = (gap) => {
    setSelectedGap(gap);
    setGeneratedText('');
    setFormData({ senioridade: 'Pleno', salario: '', beneficios: '' });
    setModalOpen(true);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedText('');
    try {
      const text = await aiService.generateJobPosting({
        skill: selectedGap.competencia,
        projeto: selectedGap.projeto,
        senioridade: formData.senioridade,
        salario: formData.salario,
        beneficios: formData.beneficios
      });
      setGeneratedText(text);
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar a vaga: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.text(`Vaga: Desenvolvedor(a) ${selectedGap.competencia}`, 20, 20);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Projeto: ${selectedGap.projeto.nome}`, 20, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 20, 38);

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    
    const splitText = doc.splitTextToSize(generatedText, 170);
    doc.text(splitText, 20, 50);

    doc.save(`vaga-${selectedGap.competencia.toLowerCase()}-${selectedGap.projeto.nome.toLowerCase().replace(/\\s+/g, '-')}.pdf`);
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Carregando...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/projetos')} 
          style={{ padding: '0.6rem', borderRadius: '12px', width: '42px', height: '42px', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: '800', letterSpacing: '-0.025em' }}>Gaps de Skill</h1>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontWeight: '500' }}>Identifique necessidades e gere postagens para contratação</p>
        </div>
      </div>

      {gaps.length === 0 ? (
        <div style={{ backgroundColor: '#fff', padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: '#f0fdf4', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Check size={40} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '700' }}>Tudo sob controle!</h3>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Nenhum gap de skill detectado nos projetos ativos. Sua equipe está completa.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {gaps.map((gap, index) => (
            <div 
              key={index} 
              style={{ 
                backgroundColor: '#fff', 
                borderRadius: '20px', 
                padding: '2rem', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', 
                display: 'flex', 
                flexDirection: 'column',
                border: '1px solid #f1f5f9',
                transition: 'transform 0.2s',
              }}
              className="gap-card"
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: '#fff1f2', padding: '0.75rem', borderRadius: '14px' }}>
                  <AlertTriangle size={24} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>{gap.projeto.nome}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className={`status-badge status-${gap.projeto.status.toLowerCase().replace(' ', '-')}`} style={{ fontSize: '0.65rem' }}>
                      {gap.projeto.status}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: '600' }}>{gap.faltam} vaga(s) aberta(s)</span>
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: '2rem', flex: 1, backgroundColor: '#f8faff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #eef2ff' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Skill Necessária
                </span>
                <span className="skill-tag" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{gap.competencia}</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}
                onClick={() => handleOpenModal(gap)}
              >
                <FileText size={18} /> Gerar Vaga com IA
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Geração de Vaga */}
      {modalOpen && selectedGap && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px', width: '95%', padding: isMobile ? '1.5rem' : '3rem' }}>
            <div className="modal-header" style={{ marginBottom: '2.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '800' }}>Postagem de Vaga</h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Configure os detalhes para a IA redigir a vaga</p>
              </div>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Projeto</span>
                  <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{selectedGap.projeto.nome}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Competência</span>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary-color)' }}>{selectedGap.competencia}</p>
                </div>
              </div>

              {!generatedText && !generating && (
                <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Qual a senioridade desejada?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                      {['Júnior', 'Pleno', 'Sênior', 'Especialista'].map(s => (
                        <button
                          key={s}
                          type="button"
                          className={`btn ${formData.senioridade === s ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setFormData({...formData, senioridade: s})}
                          style={{ fontSize: '0.75rem', padding: '0.5rem' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Faixa Salarial (Opcional)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Ex: R$ 8.000 - R$ 12.000"
                      value={formData.salario}
                      onChange={e => setFormData({...formData, salario: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diferenciais e Benefícios</label>
                    <textarea 
                      className="form-input"
                      rows="3" 
                      placeholder="Ex: Cartão Caju, Home Office total, PLR, Inglês in-company..."
                      value={formData.beneficios}
                      onChange={e => setFormData({...formData, beneficios: e.target.value})}
                      style={{ resize: 'none' }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
                    <FileText size={20} /> Redigir Vaga com IA
                  </button>
                </form>
              )}

              {generating && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                  <div className="spinner" style={{ 
                    border: '4px solid #f1f5f9', 
                    borderTop: '4px solid var(--primary-color)', 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    animation: 'spin 1s linear infinite', 
                    margin: '0 auto 1.5rem' 
                  }}></div>
                  <p style={{ color: '#64748b', fontWeight: '600' }}>A IA está elaborando uma descrição incrível...</p>
                </div>
              )}

              {generatedText && !generating && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s ease' }}>
                  <div style={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'inherit', 
                    fontSize: '0.9rem', 
                    color: '#334155',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    lineHeight: '1.6',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    {generatedText}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => setGeneratedText('')} style={{ border: 'none', color: '#64748b' }}>
                      Refazer Configuração
                    </button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn btn-secondary" onClick={handleCopy} style={{ borderColor: copied ? 'var(--success-color)' : '' }}>
                        {copied ? <Check size={18} color="var(--success-color)" /> : <Copy size={18} />}
                        {copied ? 'Copiado!' : 'Copiar Texto'}
                      </button>
                      <button className="btn btn-primary" onClick={handleDownloadPDF}>
                        <Download size={18} /> Baixar PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .gap-card:hover { transform: translateY(-5px); border-color: var(--primary-color) !important; }
      `}</style>
    </div>
  );
};

export default SkillGaps;
