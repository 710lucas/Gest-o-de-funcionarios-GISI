import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import FuncionarioModal from '../components/FuncionarioModal';
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ListaFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all, available, busy, overloaded
  const [alocacoes, setAlocacoes] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.init();
      const [funcData, alocData] = await Promise.all([
        api.getAll(),
        api.getAllAlocacoes()
      ]);
      setFuncionarios(funcData || []);
      setAlocacoes(alocData || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar funcionários');
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFuncionario(null);
  };

  const handleSave = async (updatedFuncionario) => {
    try {
      await api.update(updatedFuncionario.id, updatedFuncionario);
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar funcionário: ' + (err.message || 'Erro desconhecido'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(id);
        await loadData();
        handleCloseModal();
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar funcionário: ' + (err.message || 'Erro desconhecido'));
      }
    }
  };

  const getEffort = (id) => {
    return alocacoes.filter(a => a.funcionarioId == id).reduce((s, a) => s + parseInt(a.esforco), 0);
  };

  const filteredFuncionarios = funcionarios.filter(f => {
    const matchesSearch = (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (f.cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (f.departamento || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (availabilityFilter === 'all') return true;

    const effort = getEffort(f.id);
    const maxHours = f.carga_horaria_max || 40;
    const availableHours = maxHours - effort;

    if (availabilityFilter === 'available') return availableHours >= 10;
    if (availabilityFilter === 'busy') return effort > 0 && effort <= maxHours;
    if (availabilityFilter === 'overloaded') return effort > maxHours;
    
    return true;
  });
  
  if (error) {
    return (
      <div className="container" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444' }}>Erro ao carregar dados</h2>
          <p style={{ color: '#6b7280', margin: '1rem 0' }}>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container" style={{ paddingBottom: isMobile ? '80px' : '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem' }}>Equipe de Funcionários</h1>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Gerencie sua força de trabalho e visualize disponibilidades</p>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar por nome, cargo ou depto..." 
              className="form-input"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', padding: '0.25rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Filter size={18} color="#6b7280" />
            <select 
              className="form-input" 
              style={{ border: 'none', boxShadow: 'none', margin: 0 }}
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">Todas as Disponibilidades</option>
              <option value="available">Disponíveis (≥10h livres)</option>
              <option value="busy">Ocupados (Com alocações)</option>
              <option value="overloaded">Sobrecarregados (&gt; Carga Máx)</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ marginBottom: '1rem' }}></div>
          <p style={{ color: '#6b7280' }}>Carregando dados da equipe...</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Departamento</th>
                  {!isMobile && <th>Carga Horária</th>}
                  <th>Ocupação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredFuncionarios.length > 0 ? (
                  filteredFuncionarios.map(func => {
                    const effort = getEffort(func.id);
                    const max = func.carga_horaria_max || 40;
                    const percent = Math.round((effort / max) * 100);
                    
                    return (
                      <tr key={func.id}>
                        <td>
                          <div style={{ fontWeight: 'bold', color: '#111827' }}>{func.nome}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{func.cargo}</div>
                        </td>
                        <td>
                          <span className="skill-tag" style={{ background: '#f3f4f6', color: '#374151', border: 'none' }}>{func.departamento}</span>
                        </td>
                        {!isMobile && <td>{max}h/semana</td>}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: effort > max ? '#ef4444' : '#374151' }}>
                              {effort}h ({percent}%)
                            </div>
                            <div style={{ width: '100px', height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: effort > max ? '#ef4444' : effort === 0 ? '#9ca3af' : '#3b82f6', 
                                width: `${Math.min(100, percent)}%` 
                              }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            onClick={() => handleOpenModal(func)}
                          >
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem' }}>
                      <div style={{ color: '#9ca3af' }}>
                        <Clock size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Nenhum funcionário encontrado para este filtro.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {modalOpen && (
        <FuncionarioModal
          isOpen={modalOpen}
          funcionario={selectedFuncionario}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ListaFuncionarios;
