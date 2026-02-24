import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import FuncionarioModal from '../components/FuncionarioModal';

const ListaFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Carrega e atualiza a lista
  const loadData = () => {
    const data = api.getAll();
    setFuncionarios(data);
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

  const handleSave = (updatedFuncionario) => {
    api.update(updatedFuncionario.id, updatedFuncionario);
    loadData();
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      api.delete(id);
      loadData();
      handleCloseModal();
    }
  };

  const filteredFuncionarios = funcionarios.filter(f => 
    f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Lista de Funcionários</h1>
        <input 
          type="text" 
          placeholder="Buscar funcionário..." 
          className="form-input"
          style={{ width: '300px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

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
