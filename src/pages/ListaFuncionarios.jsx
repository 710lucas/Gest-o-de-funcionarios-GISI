import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import FuncionarioModal from '../components/FuncionarioModal';
const ListaFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      const data = await api.getAll();
      console.log('Dados carregados:', data);
      setFuncionarios(data || []);
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
    console.log('handleOpenModal chamado', funcionario);
    setSelectedFuncionario(funcionario);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    console.log('handleCloseModal chamado');
    setModalOpen(false);
    setSelectedFuncionario(null);
  };
  const handleSave = async (updatedFuncionario) => {
    console.log('handleSave chamado', updatedFuncionario);
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
    console.log('handleDelete chamado', id);
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
  const filteredFuncionarios = funcionarios.filter(f => 
    (f.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
    <div className="container" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <h1>Lista de Funcionários</h1>
        <input 
          type="text" 
          placeholder="Buscar funcionário..." 
          className="form-input"
          style={{ width: '100%', maxWidth: '400px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Carregando...</p>
        </div>
      ) : (
        <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredFuncionarios.length > 0 ? (
              filteredFuncionarios.map(func => (
                <tr key={func.id}>
                  <td>{func.id}</td>
                  <td>{func.nome}</td>
                  <td>{func.cargo}</td>
                  <td>{func.departamento}</td>
                  <td>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleOpenModal(func)}
                    >
                      Detalhes / Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  Nenhum funcionário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
