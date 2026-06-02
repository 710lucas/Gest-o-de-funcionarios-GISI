import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import FuncionarioModal from '../components/FuncionarioModal';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, X, UserPlus, FileDown, MoreVertical, Briefcase, RefreshCw, TrendingUp } from 'lucide-react';

const ListaFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [alocacoes, setAlocacoes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await api.init();
      const [data, alocs] = await Promise.all([
        api.getAll(),
        api.getAllAlocacoes()
      ]);
      setFuncionarios(data);
      setAlocacoes(alocs);
    } catch (err) {
      setError('Falha ao carregar funcionários. Verifique sua conexão.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedFuncionario) => {
    try {
      await api.update(updatedFuncionario.id, updatedFuncionario);
      await loadData();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar alterações.');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(id);
        await loadData();
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar funcionário.');
        throw err;
      }
    }
  };

  const getEffort = (id) => {
    return alocacoes.filter(a => a.funcionarioId == id).reduce((s, a) => s + parseInt(a.esforco), 0);
  };

  const uniqueDepts = ['all', ...new Set(funcionarios.map(f => f.departamento).filter(Boolean))].sort();
  const uniqueSkills = ['all', ...new Set(funcionarios.flatMap(f => f.competencias || []).filter(Boolean))].sort();

  const filteredFuncionarios = funcionarios.filter(f => {
    const matchesSearch = (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (f.cargo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Filtro de Departamento
    if (deptFilter !== 'all' && f.departamento !== deptFilter) return false;

    // Filtro de Skill
    if (skillFilter !== 'all' && !(f.competencias || []).includes(skillFilter)) return false;

    if (availabilityFilter === 'all') return true;

    const effort = getEffort(f.id);
    const maxHours = f.carga_horaria_max || 40;
    const availableHours = maxHours - effort;

    if (availabilityFilter === 'available') return availableHours >= 10;
    if (availabilityFilter === 'busy') return effort > 0 && effort <= maxHours;
    if (availabilityFilter === 'overloaded') return effort > maxHours;
    
    return true;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setAvailabilityFilter('all');
    setDeptFilter('all');
    setSkillFilter('all');
  };

  const stats = {
    total: funcionarios.length,
    available: funcionarios.filter(f => (f.carga_horaria_max || 40) - getEffort(f.id) >= 10).length,
    overloaded: funcionarios.filter(f => getEffort(f.id) > (f.carga_horaria_max || 40)).length
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#64748b' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
      <p style={{ marginTop: '1rem', fontWeight: '600' }}>Carregando força de trabalho...</p>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: isMobile ? '100px' : '4rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        
        {/* Cabeçalho */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>
              Equipe de Profissionais
            </h1>
            <p style={{ color: '#64748b', marginTop: '0.4rem', fontSize: '1.1rem' }}>Gerencie talentos, disponibilidades e competências da organização.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => api.exportCsv()} style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', backgroundColor: '#fff' }}>
              <FileDown size={18} /> {!isMobile && 'Exportar CSV'}
            </button>
            <a href="/cadastrar" className="btn btn-primary" style={{ backgroundColor: '#0f172a', border: 'none', padding: '0.75rem 1.5rem' }}>
              <UserPlus size={18} /> {!isMobile && 'Novo Profissional'}
            </a>
          </div>
        </div>

        {/* Resumo Rápido */}
        {!isMobile && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '10px' }}><Briefcase size={20} color="#64748b" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Total Ativos</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{stats.total} especialistas</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '10px' }}><CheckCircle size={20} color="#10b981" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Disponíveis</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a' }}>{stats.available} para alocação</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '10px' }}><AlertTriangle size={20} color="#ef4444" /></div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Sobrecarga</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#dc2626' }}>{stats.overloaded} em alerta</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="card" style={{ 
          padding: '1.5rem', 
          borderRadius: '20px', 
          border: 'none',
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)', 
          marginBottom: '2rem',
          backgroundColor: '#fff'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Linha 1: Busca e Reset */}
            <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar profissional por nome ou cargo..." 
                  className="form-input"
                  style={{ paddingLeft: '3.25rem', paddingRight: searchTerm ? '3rem' : '1rem', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Buscar profissionais"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {(searchTerm || availabilityFilter !== 'all' || deptFilter !== 'all' || skillFilter !== 'all') && (
                <button 
                  onClick={handleResetFilters}
                  className="btn btn-secondary"
                  style={{ border: 'none', color: '#ef4444', fontWeight: '700', backgroundColor: '#fef2f2', padding: '0 1.5rem' }}
                >
                  <RefreshCw size={16} /> Limpar Filtros
                </button>
              )}
            </div>

            {/* Linha 2: Filtros Granulares */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1rem' }}>
              {/* Depto */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.2rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <Briefcase size={16} color="#64748b" />
                <select 
                  className="form-input" 
                  style={{ border: 'none', boxShadow: 'none', margin: 0, backgroundColor: 'transparent', fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="all">Todos Departamentos</option>
                  {uniqueDepts.filter(d => d !== 'all').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.2rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <TrendingUp size={16} color="#64748b" />
                <select 
                  className="form-input" 
                  style={{ border: 'none', boxShadow: 'none', margin: 0, backgroundColor: 'transparent', fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                >
                  <option value="all">Todas as Competências</option>
                  {uniqueSkills.filter(s => s !== 'all').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Disponibilidade */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.2rem 1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <Filter size={16} color="#64748b" />
                <select 
                  className="form-input" 
                  style={{ border: 'none', boxShadow: 'none', margin: 0, backgroundColor: 'transparent', fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                >
                  <option value="all">Todas Disponibilidades</option>
                  <option value="available">Disponíveis (≥10h livres)</option>
                  <option value="busy">Ocupados (1-40h)</option>
                  <option value="overloaded">Sobrecarregados (&gt;40h)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Funcionários */}
        {filteredFuncionarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', backgroundColor: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Search size={40} color="#cbd5e1" />
            </div>
            <h3 style={{ color: '#0f172a', margin: 0 }}>Nenhum profissional encontrado</h3>
            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Tente ajustar os filtros ou o termo de busca para encontrar o que precisa.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <table className="table" style={{ backgroundColor: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1.25rem 1.5rem' }}>Profissional</th>
                  <th>Departamento</th>
                  <th>Skills Principais</th>
                  <th style={{ textAlign: 'center' }}>Carga Semanal</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.map(f => {
                  const effort = getEffort(f.id);
                  const maxHours = f.carga_horaria_max || 40;
                  const percent = Math.round((effort / maxHours) * 100);
                  
                  return (
                    <tr key={f.id} style={{ transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '42px', 
                            height: '42px', 
                            borderRadius: '12px', 
                            backgroundColor: effort > maxHours ? '#fef2f2' : '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: effort > maxHours ? '#ef4444' : '#3b82f6',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            border: `1px solid ${effort > maxHours ? '#fee2e2' : '#dbeafe'}`
                          }}>
                            {f.nome.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{f.nome}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{f.cargo}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '6px', 
                          backgroundColor: '#f1f5f9', 
                          color: '#475569', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          {f.departamento}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {(f.competencias || []).slice(0, 3).map(skill => (
                            <span key={skill} style={{ 
                              fontSize: '0.7rem', 
                              backgroundColor: '#fff', 
                              color: '#3b82f6', 
                              border: '1px solid #dbeafe',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}>{skill}</span>
                          ))}
                          {f.competencias?.length > 3 && (
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', alignSelf: 'center', fontWeight: '600' }}>
                              +{f.competencias.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '100px' }}>
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${Math.min(100, percent)}%`, 
                              height: '100%', 
                              backgroundColor: percent > 100 ? '#ef4444' : percent > 80 ? '#f59e0b' : '#3b82f6',
                              transition: 'width 0.5s ease'
                            }}></div>
                          </div>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: '800', 
                            color: percent > 100 ? '#ef4444' : '#1e293b' 
                          }}>
                            {effort}h / {maxHours}h
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => {
                            setSelectedFuncionario(f);
                            setModalOpen(true);
                          }}
                          style={{ padding: '0.5rem', border: 'none', color: '#64748b' }}
                        >
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <FuncionarioModal 
          funcionario={selectedFuncionario}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ListaFuncionarios;
