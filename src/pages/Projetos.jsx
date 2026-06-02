import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Briefcase, Plus, Users, AlertTriangle, CheckCircle, Search, Trash2, Edit3, ClipboardList, TrendingUp, ChevronDown, ChevronUp, X, RefreshCw, Save } from 'lucide-react';

const Projetos = () => {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState({});
  const [loadingModal, setLoadingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleCollapse = (id) => {
    setCollapsedProjects(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const [projetoForm, setProjetoForm] = useState({
    nome: '',
    descricao: '',
    status: 'Em Planejamento',
    requisitos: []
  });

  const [newRequisito, setNewRequisito] = useState({
    competencia: '',
    quantidade: 1,
    esforço_por_pessoa: 20
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await api.init();
      const [projData, funcData, alocData] = await Promise.all([
        api.getAllProjetos(),
        api.getAll(),
        api.getAllAlocacoes()
      ]);
      setProjetos(projData);
      setFuncionarios(funcData);
      setAlocacoes(alocData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setLoadingModal(true);
    try {
      if (editingProjeto) {
        await api.updateProjeto(editingProjeto.id, projetoForm);
      } else {
        await api.createProjeto(projetoForm);
      }
      setShowModal(false);
      setEditingProjeto(null);
      setProjetoForm({ nome: '', descricao: '', status: 'Em Planejamento', requisitos: [] });
      await fetchData();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      alert('Erro ao salvar projeto.');
    } finally {
      setLoadingModal(false);
    }
  };

  const addRequisito = () => {
    if (newRequisito.competencia) {
      setProjetoForm(prev => ({
        ...prev,
        requisitos: [...prev.requisitos, { ...newRequisito }]
      }));
      setNewRequisito({ competencia: '', quantidade: 1, esforço_por_pessoa: 20 });
    }
  };

  const removeRequisito = (index) => {
    setProjetoForm(prev => ({
      ...prev,
      requisitos: prev.requisitos.filter((_, i) => i !== index)
    }));
  };

  const handleAlocar = async (funcionarioId, projetoId, competencia, esforco) => {
    await api.updateAlocacao({ funcionarioId, projetoId, competencia, esforco });
    fetchData();
  };

  const getEsforcoAtual = (funcionarioId) => {
    return alocacoes
      .filter(a => a.funcionarioId == funcionarioId)
      .reduce((sum, a) => sum + parseInt(a.esforco), 0);
  };

  const getAlocacoesProjeto = (projetoId) => {
    return alocacoes.filter(a => a.projetoId == projetoId);
  };

  const filteredProjetos = projetos.filter(projeto => {
    if (!searchTerm) return true;
    
    const projAloc = getAlocacoesProjeto(projeto.id);
    const hasFuncionario = projAloc.some(aloc => {
      const func = funcionarios.find(f => f.id == aloc.funcionarioId);
      return func?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || hasFuncionario;
  });

  const getSugeridos = (competencia, projetoId) => {
    return funcionarios
      .filter(f => (f.competencias || []).includes(competencia))
      .map(f => {
        const esforcoAtual = getEsforcoAtual(f.id);
        const jaAlocado = alocacoes.some(a => a.funcionarioId == f.id && a.projetoId == projetoId && a.competencia == competencia);
        return { ...f, esforcoAtual, jaAlocado };
      })
      .sort((a, b) => a.esforcoAtual - b.esforcoAtual);
  };

  const StatCard = ({ title, value, icon: IconComponent, color, onClick, highlighted }) => (
    <div 
      className={`stat-card ${highlighted ? 'highlighted' : ''}`} 
      onClick={onClick} 
      style={{ 
        padding: isMobile ? '1.25rem' : '1.5rem', 
        borderRadius: '16px', 
        boxShadow: highlighted ? `0 10px 15px -3px ${color}20` : '0 4px 6px -1px rgba(0,0,0,0.05)', 
        backgroundColor: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem', 
        flexGrow: '1',
        cursor: onClick ? 'pointer' : 'default',
        border: highlighted ? `2px solid ${color}` : '1px solid #f1f5f9',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        backgroundColor: `${color}15`, 
        padding: isMobile ? '0.75rem' : '1rem', 
        borderRadius: '12px', 
        display: 'flex',
        color: color
      }}>
        <IconComponent size={isMobile ? 24 : 30} strokeWidth={2.5} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label" style={{ 
          fontSize: '0.7rem', 
          color: '#64748b', 
          fontWeight: '700', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem'
        }}>{title}</div>
        <div className="stat-value" style={{ 
          fontSize: isMobile ? '1.5rem' : '1.75rem', 
          fontWeight: '800', 
          color: '#0f172a',
          lineHeight: 1
        }}>{value}</div>
      </div>
      {onClick && (
        <div style={{ 
          position: 'absolute', 
          right: '1rem', 
          bottom: '1rem', 
          fontSize: '0.6rem', 
          fontWeight: '800', 
          color: color,
          textTransform: 'uppercase',
          opacity: 0.8,
          display: isMobile ? 'none' : 'block'
        }}>
          Ver Detalhes →
        </div>
      )}
    </div>
  );

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>Carregando projetos...</div>;

  return (
    <div className="container" style={{ paddingBottom: isMobile ? '80px' : '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem' }}>Gestão de Projetos</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Planejamento de capacidade e alocação de recursos</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingProjeto(null);
          setProjetoForm({ nome: '', descricao: '', status: 'Em Planejamento', requisitos: [] });
          setShowModal(true);
        }}>
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      <div className="stats-grid" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard title="Projetos Ativos" value={projetos.length} icon={Briefcase} color="#3b82f6" />
        <StatCard title="Alocados" value={[...new Set(alocacoes.map(a => a.funcionarioId))].length} icon={Users} color="#10b981" />
        <StatCard 
          title="Gaps de Skill" 
          value={projetos.reduce((total, p) => {
            if (p.status === 'Concluído') return total;
            const projAloc = getAlocacoesProjeto(p.id);
            return total + p.requisitos.reduce((gap, req) => {
              const alocadosReq = projAloc.filter(a => a.competencia === req.competencia).length;
              return gap + Math.max(0, req.quantidade - alocadosReq);
            }, 0);
          }, 0)} 
          icon={AlertTriangle} 
          color="#ef4444" 
          onClick={() => navigate('/skill-gaps')}
          highlighted={true}
        />
      </div>

      {/* Barra de Busca */}
      <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Procurar funcionário em projetos..."
          aria-label="Procurar funcionário em projetos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: '3rem',
            paddingRight: searchTerm ? '3rem' : '1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            style={{ 
              position: 'absolute', 
              right: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {projetos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #e5e7eb', background: 'transparent', boxShadow: 'none' }}>
          <ClipboardList size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#374151' }}>Nenhum projeto cadastrado</h3>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Inicie um novo projeto para gerenciar sua equipe e recursos.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setShowModal(true)}>
            Começar Agora
          </button>
        </div>
      ) : (
        <div className="projects-list">
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => {
              const allCollapsed = filteredProjetos.every(p => collapsedProjects[p.id]);
              const newState = {};
              filteredProjetos.forEach(p => newState[p.id] = !allCollapsed);
              setCollapsedProjects(newState);
            }}>
              {filteredProjetos.every(p => collapsedProjects[p.id]) ? 'Expandir Todos' : 'Colapsar Todos'}
            </button>
          </div>

          {filteredProjetos.map(projeto => {
            const projAloc = getAlocacoesProjeto(projeto.id);
            const requisitos = projeto.requisitos || [];
            const esforcoTotal = requisitos.reduce((sum, r) => sum + (r.quantidade * r.esforço_por_pessoa), 0);
            const esforcoAlocado = projAloc.reduce((sum, a) => sum + parseInt(a.esforco), 0);
            const isCollapsed = collapsedProjects[projeto.id];

            return (
              <div 
                key={projeto.id} 
                className="project-card"
                style={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '12px', 
                  marginBottom: '1.5rem', 
                  boxShadow: isCollapsed ? '0 1px 3px rgba(0,0,0,0.1)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
                  border: isCollapsed ? '1px solid #e5e7eb' : '1px solid var(--primary-color)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div 
                  className="project-header"
                  onClick={() => toggleCollapse(projeto.id)} 
                  style={{ 
                    padding: isMobile ? '1.25rem' : '1.5rem', 
                    cursor: 'pointer',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundColor: isCollapsed ? '#fff' : '#f8faff',
                    borderBottom: isCollapsed ? 'none' : '1px solid #eef2ff'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div style={{ 
                      backgroundColor: isCollapsed ? '#f3f4f6' : 'var(--primary-color)', 
                      padding: '0.5rem', 
                      borderRadius: '8px',
                      color: isCollapsed ? '#6b7280' : 'white',
                      display: 'flex',
                      transition: 'all 0.2s'
                    }}>
                      {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <h2 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '700', color: '#111827' }}>{projeto.nome}</h2>
                        <span className={`status-badge status-${projeto.status.toLowerCase().replace(' ', '-')}`}>
                          {projeto.status}
                        </span>
                      </div>
                      {isCollapsed && projeto.descricao && (
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {projeto.descricao.length > 70 ? `${projeto.descricao.substring(0, 70)}...` : projeto.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }} onClick={() => {
                      setEditingProjeto(projeto);
                      setProjetoForm(projeto);
                      setShowModal(true);
                    }}><Edit3 size={16} /></button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none' }} onClick={async () => {
                      if(confirm('Deseja excluir este projeto?')) {
                        await api.deleteProjeto(projeto.id);
                        fetchData();
                      }
                    }}><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Conteúdo Expansível */}
                {!isCollapsed && (
                  <div style={{ padding: isMobile ? '1.5rem' : '2rem', animation: 'slideDown 0.3s ease-out' }}>
                    <p style={{ color: '#4b5563', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', borderLeft: '4px solid #e5e7eb', paddingLeft: '1rem' }}>
                      {projeto.descricao || 'Nenhuma descrição fornecida.'}
                    </p>

                    <div className="form-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2.5rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <Users size={18} color="var(--primary-color)" /> Requisitos e Alocação
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {requisitos.map((req, idx) => {
                            const alocadosParaEsteReq = projAloc.filter(a => a.competencia === req.competencia);
                            const falta = req.quantidade - alocadosParaEsteReq.length;
                            const sugeridos = getSugeridos(req.competencia, projeto.id);

                            return (
                              <div key={idx} style={{ padding: '1.25rem', border: '1px solid #f3f4f6', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '700', color: '#111827', fontSize: '0.95rem' }}>{req.competencia}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Necessário: {req.quantidade} profissional(is)</span>
                                  </div>
                                  <span className={falta <= 0 ? 'match-success' : 'match-danger'} style={{ fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '9999px', backgroundColor: falta <= 0 ? '#f0fdf4' : '#fef2f2' }}>
                                    {falta <= 0 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    {falta <= 0 ? 'COMPLETO' : `${falta} PENDENTE`}
                                  </span>
                                </div>

                                <div className="skills-container" style={{ gap: '0.75rem', marginBottom: alocadosParaEsteReq.length > 0 ? '1rem' : '0' }}>
                                  {alocadosParaEsteReq.map(aloc => {
                                    const func = funcionarios.find(f => f.id == aloc.funcionarioId);
                                    const esforcoTotalFunc = getEsforcoAtual(aloc.funcionarioId);
                                    const isOverloaded = esforcoTotalFunc > (func?.carga_horaria_max || 40);

                                    return (
                                      <div key={aloc.funcionarioId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                        <div style={{ 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'space-between',
                                          padding: '0.6rem 0.8rem',
                                          borderRadius: '8px',
                                          backgroundColor: isOverloaded ? '#fff1f2' : '#f8faff',
                                          border: `1px solid ${isOverloaded ? '#fecaca' : '#e0e7ff'}`
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <div style={{ 
                                              width: '32px', 
                                              height: '32px', 
                                              borderRadius: '50%', 
                                              backgroundColor: isOverloaded ? '#ef4444' : 'var(--primary-color)',
                                              color: 'white',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '0.75rem',
                                              fontWeight: 'bold'
                                            }}>
                                              {func?.nome.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>{func?.nome}</span>
                                              <span style={{ fontSize: '0.7rem', color: isOverloaded ? '#b91c1c' : '#6b7280' }}>
                                                {esforcoTotalFunc}h alocadas no total
                                              </span>
                                            </div>
                                          </div>
                                          <button 
                                            onClick={() => handleAlocar(aloc.funcionarioId, projeto.id, aloc.competencia, 0)} 
                                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}
                                            title="Remover do projeto"
                                          >
                                            &times;
                                          </button>
                                        </div>
                                        
                                        {isOverloaded && (
                                          <div style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#991b1b', 
                                            background: '#fff', 
                                            padding: '0.75rem', 
                                            borderRadius: '8px', 
                                            border: '1px solid #fecaca',
                                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)'
                                          }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontWeight: '700' }}>
                                              <AlertTriangle size={14} /> SOBRECARGA! Sugestões de troca:
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                              {sugeridos
                                                .filter(s => !s.jaAlocado && (s.esforcoAtual + req.esforço_por_pessoa) <= (s.carga_horaria_max || 40))
                                                .slice(0, 3)
                                                .map(s => (
                                                  <button 
                                                    key={s.id}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.7rem', padding: '0.35rem 0.6rem', whiteSpace: 'nowrap', borderStyle: 'dashed' }}
                                                    onClick={() => {
                                                      handleAlocar(aloc.funcionarioId, projeto.id, aloc.competencia, 0);
                                                      handleAlocar(s.id, projeto.id, req.competencia, req.esforço_por_pessoa);
                                                    }}
                                                  >
                                                    + {s.nome} ({s.esforcoAtual}h)
                                                  </button>
                                                ))
                                              }
                                              {sugeridos.filter(s => !s.jaAlocado && (s.esforcoAtual + req.esforço_por_pessoa) <= (s.carga_horaria_max || 40)).length === 0 && (
                                                <span style={{ fontStyle: 'italic', opacity: 0.7, fontSize: '0.7rem' }}>Sem substitutos disponíveis</span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {falta > 0 && (
                                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Funcionários Disponíveis:</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {sugeridos.filter(s => !s.jaAlocado).length > 0 ? (
                                        sugeridos.filter(s => !s.jaAlocado).map(s => (
                                          <button 
                                            key={s.id} 
                                            className="btn btn-secondary" 
                                            style={{ 
                                              fontSize: '0.75rem', 
                                              padding: '0.4rem 0.75rem', 
                                              whiteSpace: 'nowrap', 
                                              backgroundColor: '#fff',
                                              borderColor: 'var(--primary-color)',
                                              color: 'var(--primary-color)'
                                            }}
                                            onClick={() => handleAlocar(s.id, projeto.id, req.competencia, req.esforço_por_pessoa)}
                                            title={`Capacidade: ${s.esforcoAtual}/${s.carga_horaria_max}h`}
                                          >
                                            + {s.nome} ({s.esforcoAtual}h)
                                          </button>
                                        ))
                                      ) : (
                                        <div style={{ 
                                          padding: '0.75rem', 
                                          backgroundColor: '#fff7ed', 
                                          borderRadius: '8px', 
                                          fontSize: '0.75rem', 
                                          color: '#9a3412',
                                          width: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                          border: '1px solid #ffedd5'
                                        }}>
                                          <AlertTriangle size={14} /> Sem recursos disponíveis. Considere contratação.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ alignSelf: 'start', position: 'sticky', top: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <TrendingUp size={18} color="var(--primary-color)" /> Panorama de Esforço
                        </h3>
                        <div style={{ background: '#f8faff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eef2ff' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Carga Total Planejada:</span>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>{esforcoTotal}h/semana</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '500' }}>Carga Total Alocada:</span>
                            <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{esforcoAlocado}h/semana</span>
                          </div>

                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: '700', color: '#475569' }}>Preenchimento de Vagas</span>
                              <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>{Math.round((esforcoAlocado / (esforcoTotal || 1)) * 100)}%</span>
                            </div>
                            <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: esforcoAlocado >= esforcoTotal ? 'var(--success-color)' : 'linear-gradient(90deg, var(--primary-color), #60a5fa)', 
                                width: `${Math.min(100, (esforcoAlocado / (esforcoTotal || 1)) * 100)}%`,
                                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                              }}></div>
                            </div>
                          </div>
                          <div style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eef2ff', fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                            O esforço é calculado com base nas horas semanais estimadas para cada requisito de competência do projeto.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loadingModal && setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProjeto ? 'Detalhes do Projeto' : 'Arquitetar Novo Projeto'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleCreateOrUpdate} style={{ 
              maxHeight: '75vh',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              padding: '0.5rem'
            }}>
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label className="form-label">Nome do Projeto</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={projetoForm.nome} 
                    onChange={e => setProjetoForm({...projetoForm, nome: e.target.value})} 
                    placeholder="Ex: Transformação Digital 2026"
                    required 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                  <label className="form-label">Missão e Objetivos</label>
                  <textarea 
                    className="form-input" 
                    value={projetoForm.descricao} 
                    onChange={e => setProjetoForm({...projetoForm, descricao: e.target.value})} 
                    rows="3"
                    placeholder="Descreva o impacto esperado desta iniciativa..."
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Operacional</label>
                  <select 
                    className="form-input" 
                    value={projetoForm.status} 
                    onChange={e => setProjetoForm({...projetoForm, status: e.target.value})}
                  >
                    <option>Em Planejamento</option>
                    <option>Iniciado</option>
                    <option>Pausado</option>
                    <option>Concluído</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Definição de Requisitos (Skills)</label>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  marginBottom: '1rem',
                  scrollbarWidth: 'thin'
                }}>
                  {projetoForm.requisitos.map((req, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem 1rem', 
                      backgroundColor: '#fff', 
                      borderRadius: '8px', 
                      border: '1px solid #e2e8f0'
                    }}>
                      <div>
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{req.competencia}</span>
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                          ({req.quantidade}x • {req.esforço_por_pessoa}h)
                        </span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeRequisito(idx)} 
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {projetoForm.requisitos.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      Nenhum requisito técnico definido.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2, minWidth: '150px' }}>
                    <input 
                      list="competencias-projeto"
                      className="form-input" 
                      value={newRequisito.competencia} 
                      onChange={e => setNewRequisito({...newRequisito, competencia: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRequisito())}
                      placeholder="Skill..."
                    />
                    <datalist id="competencias-projeto">
                      {api.getCompetenciasPadrao().map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ flex: 0.5, minWidth: '60px' }} 
                    placeholder="Qtd" 
                    value={newRequisito.quantidade} 
                    onChange={e => setNewRequisito({...newRequisito, quantidade: parseInt(e.target.value)})} 
                  />
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ flex: 0.5, minWidth: '60px' }} 
                    placeholder="Horas" 
                    value={newRequisito.esforço_por_pessoa} 
                    onChange={e => setNewRequisito({...newRequisito, esforço_por_pessoa: parseInt(e.target.value)})} 
                  />
                  <button type="button" className="btn btn-secondary" onClick={addRequisito} style={{ height: '42px' }}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={loadingModal}
                  style={{ backgroundColor: '#22c55e', color: 'white', flex: 1 }}
                >
                  {loadingModal ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingProjeto ? 'Salvar Alterações' : 'Criar Projeto'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={loadingModal}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;
