import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Briefcase, Plus, Users, AlertTriangle, CheckCircle, Search, Trash2, Edit3, ClipboardList, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const Projetos = () => {
  const [projetos, setProjetos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collapsedProjects, setCollapsedProjects] = useState({});
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
    if (editingProjeto) {
      await api.updateProjeto(editingProjeto.id, projetoForm);
    } else {
      await api.createProjeto(projetoForm);
    }
    setShowModal(false);
    setEditingProjeto(null);
    setProjetoForm({ nome: '', descricao: '', status: 'Em Planejamento', requisitos: [] });
    fetchData();
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

  const StatCard = ({ title, value, icon: IconComponent, color }) => (
    <div className="stat-card" style={{ 
      padding: isMobile ? '1rem' : '1.5rem', 
      borderRadius: '8px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
      backgroundColor: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1rem', 
      flexGrow: '1' 
    }}>
      <div style={{ backgroundColor: `${color}20`, padding: isMobile ? '0.75rem' : '1rem', borderRadius: '50%', display: 'flex' }}>
        <IconComponent size={isMobile ? 24 : 32} color={color} />
      </div>
      <div>
        <div className="stat-label" style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{title}</div>
        <div className="stat-value" style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</div>
      </div>
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Novo Projeto
        </button>
      </div>

      <div className="stats-grid" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatCard title="Projetos Ativos" value={projetos.length} icon={Briefcase} color="#3b82f6" />
        <StatCard title="Alocados" value={[...new Set(alocacoes.map(a => a.funcionarioId))].length} icon={Users} color="#10b981" />
        <StatCard 
          title="Gaps de Skill" 
          value={projetos.reduce((total, p) => {
            const projAloc = getAlocacoesProjeto(p.id);
            return total + p.requisitos.reduce((gap, req) => {
              const alocadosReq = projAloc.filter(a => a.competencia === req.competencia).length;
              return gap + Math.max(0, req.quantidade - alocadosReq);
            }, 0);
          }, 0)} 
          icon={AlertTriangle} 
          color="#ef4444" 
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '1rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        />
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
              <div key={projeto.id} className="card" style={{ marginBottom: '1.5rem', padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {/* Header sempre visível */}
                <div 
                  onClick={() => toggleCollapse(projeto.id)}
                  style={{ 
                    padding: isMobile ? '1.25rem' : '1.5rem', 
                    cursor: 'pointer',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    backgroundColor: isCollapsed ? '#fff' : '#fcfcfc',
                    borderBottom: isCollapsed ? 'none' : '1px solid #f3f4f6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    {isCollapsed ? <ChevronDown size={20} color="#6b7280" /> : <ChevronUp size={20} color="#6b7280" />}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h2 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>{projeto.nome}</h2>
                        <span className={`status-badge status-${projeto.status.toLowerCase().replace(' ', '-')}`}>
                          {projeto.status}
                        </span>
                      </div>
                      {isCollapsed && <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>{projeto.descricao.substring(0, 60)}...</p>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => {
                      setEditingProjeto(projeto);
                      setProjetoForm(projeto);
                      setShowModal(true);
                    }}><Edit3 size={16} /></button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={async () => {
                      if(confirm('Deseja excluir este projeto?')) {
                        await api.deleteProjeto(projeto.id);
                        fetchData();
                      }
                    }}><Trash2 size={16} /></button>
                  </div>
                </div>

                {/* Conteúdo Expansível */}
                {!isCollapsed && (
                  <div style={{ padding: isMobile ? '1.25rem' : '1.5rem' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{projeto.descricao}</p>

                    <div className="form-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '2rem' }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={18} /> Requisitos e Alocação
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {requisitos.map((req, idx) => {
                            const alocadosParaEsteReq = projAloc.filter(a => a.competencia === req.competencia);
                            const falta = req.quantidade - alocadosParaEsteReq.length;
                            const sugeridos = getSugeridos(req.competencia, projeto.id);

                            return (
                              <div key={idx} style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                  <span style={{ fontWeight: '600', color: '#374151' }}>{req.competencia} <span style={{ fontWeight: 'normal', color: '#6b7280' }}>({req.quantidade} vagas)</span></span>
                                  <span className={falta <= 0 ? 'match-success' : 'match-danger'} style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    {falta <= 0 ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    {falta <= 0 ? 'COBERTO' : `${falta} PENDENTE`}
                                  </span>
                                </div>

                                <div className="skills-container" style={{ gap: '0.75rem' }}>
                                  {alocadosParaEsteReq.map(aloc => {
                                    const func = funcionarios.find(f => f.id == aloc.funcionarioId);
                                    const esforcoTotalFunc = getEsforcoAtual(aloc.funcionarioId);
                                    const isOverloaded = esforcoTotalFunc > (func?.carga_horaria_max || 40);

                                    return (
                                      <div key={aloc.funcionarioId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <span className="skill-tag" style={{ 
                                            background: isOverloaded ? '#fee2e2' : '#dcfce7', 
                                            color: isOverloaded ? '#991b1b' : '#166534', 
                                            border: `1px solid ${isOverloaded ? '#fecaca' : '#bbf7d0'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                          }}>
                                            {isOverloaded && <AlertTriangle size={14} color="#ef4444" />}
                                            {func?.nome} ({esforcoTotalFunc}h alocadas)
                                            <button onClick={() => handleAlocar(aloc.funcionarioId, projeto.id, aloc.competencia, 0)} className="remove-skill">&times;</button>
                                          </span>
                                        </div>
                                        
                                        {isOverloaded && (
                                          <div style={{ 
                                            fontSize: '0.7rem', 
                                            color: '#991b1b', 
                                            background: '#fff1f2', 
                                            padding: '0.5rem', 
                                            borderRadius: '6px', 
                                            border: '1px dashed #fda4af'
                                          }}>
                                            <strong>⚠️ Sobrecarga detectada!</strong> Trocar por:
                                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                                              {sugeridos
                                                .filter(s => !s.jaAlocado && (s.esforcoAtual + req.esforço_por_pessoa) <= (s.carga_horaria_max || 40))
                                                .slice(0, 3)
                                                .map(s => (
                                                  <button 
                                                    key={s.id}
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem', whiteSpace: 'nowrap' }}
                                                    onClick={() => {
                                                      handleAlocar(aloc.funcionarioId, projeto.id, aloc.competencia, 0);
                                                      handleAlocar(s.id, projeto.id, req.competencia, req.esforço_por_pessoa);
                                                    }}
                                                  >
                                                    {s.nome} ({s.esforcoAtual}h totais)
                                                  </button>
                                                ))
                                              }
                                              {sugeridos.filter(s => !s.jaAlocado && (s.esforcoAtual + req.esforço_por_pessoa) <= (s.carga_horaria_max || 40)).length === 0 && (
                                                <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Sem substitutos disponíveis</span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {falta > 0 && (
                                  <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '0.75rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Sugestões de Matching:</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                                      {sugeridos.filter(s => !s.jaAlocado).length > 0 ? (
                                        sugeridos.filter(s => !s.jaAlocado).map(s => (
                                          <button 
                                            key={s.id} 
                                            className="btn btn-secondary" 
                                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}
                                            onClick={() => handleAlocar(s.id, projeto.id, req.competencia, req.esforço_por_pessoa)}
                                            title={`Capacidade: ${s.esforcoAtual}/${s.carga_horaria_max}h`}
                                          >
                                            + {s.nome} ({s.esforcoAtual}h totais)
                                          </button>
                                        ))
                                      ) : (
                                        <div className="gap-indicator" style={{ margin: 0, padding: '0.5rem', fontSize: '0.75rem', width: '100%' }}>
                                          ⚠️ Sem recursos disponíveis. Recomenda-se contratação.
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

                      <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TrendingUp size={18} /> Resumo de Esforço
                        </h3>
                        <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ color: '#6b7280' }}>Total Estimado:</span>
                            <span style={{ fontWeight: 'bold' }}>{esforcoTotal}h</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                            <span style={{ color: '#6b7280' }}>Total Alocado:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{esforcoAlocado}h</span>
                          </div>

                          <div style={{ marginBottom: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 'bold' }}>Progresso de Alocação</span>
                              <span>{Math.round((esforcoAlocado / (esforcoTotal || 1)) * 100)}%</span>
                            </div>
                            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: esforcoAlocado >= esforcoTotal ? 'var(--success-color)' : 'var(--primary-color)', 
                                width: `${Math.min(100, (esforcoAlocado / (esforcoTotal || 1)) * 100)}%`,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1rem' }}>
                            * O esforço alocado é baseado na carga horária semanal definida para cada vaga do projeto.
                          </p>
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
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px', padding: isMobile ? '1.5rem' : '2rem' }}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>{editingProjeto ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label className="form-label">Nome do Projeto</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={projetoForm.nome} 
                  onChange={e => setProjetoForm({...projetoForm, nome: e.target.value})} 
                  placeholder="Ex: Novo App Mobile"
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea 
                  className="form-input" 
                  value={projetoForm.descricao} 
                  onChange={e => setProjetoForm({...projetoForm, descricao: e.target.value})} 
                  rows="2"
                  placeholder="Breve descrição do objetivo do projeto..."
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
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

              <div style={{ marginTop: '1.5rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <label className="form-label" style={{ marginBottom: '1rem' }}>Definição de Requisitos (Skills)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <select 
                    className="form-input" 
                    style={{ flex: 2, minWidth: '150px' }}
                    value={newRequisito.competencia} 
                    onChange={e => setNewRequisito({...newRequisito, competencia: e.target.value})}
                  >
                    <option value="">Competência...</option>
                    {api.getCompetenciasPadrao().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ flex: 0.5, minWidth: '70px' }} 
                    placeholder="Qtd" 
                    value={newRequisito.quantidade} 
                    onChange={e => setNewRequisito({...newRequisito, quantidade: parseInt(e.target.value)})} 
                    min="1"
                  />
                  <input 
                    type="number" 
                    className="form-input" 
                    style={{ flex: 0.8, minWidth: '80px' }} 
                    placeholder="Horas" 
                    value={newRequisito.esforço_por_pessoa} 
                    onChange={e => setNewRequisito({...newRequisito, esforço_por_pessoa: parseInt(e.target.value)})} 
                    min="1"
                  />
                  <button type="button" className="btn btn-secondary" onClick={addRequisito} style={{ height: '44px' }}>Add</button>
                </div>

                <div className="skills-container">
                  {projetoForm.requisitos.map((req, idx) => (
                    <span key={idx} className="skill-tag" style={{ background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <strong>{req.competencia}</strong>: {req.quantidade}x ({req.esforço_por_pessoa}h)
                      <button type="button" onClick={() => removeRequisito(idx)} className="remove-skill">&times;</button>
                    </span>
                  ))}
                  {projetoForm.requisitos.length === 0 && <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontStyle: 'italic' }}>Nenhum requisito adicionado.</span>}
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1 }}>{editingProjeto ? 'Salvar Alterações' : 'Criar Projeto'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projetos;
