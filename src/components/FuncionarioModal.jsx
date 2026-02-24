import React, { useState } from 'react';

const FuncionarioModal = ({ funcionario, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(funcionario || {});
  const [isEditing, setIsEditing] = useState(false);

  // Atualiza o form ao abrir com dados diferentes
  React.useEffect(() => {
    if (funcionario) {
      setFormData(funcionario);
      setIsEditing(false);
    }
  }, [funcionario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalhes do Funcionário</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cargo</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Departamento</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Salário</label>
            <input
              type="number"
              name="salario"
              value={formData.salario || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Admissão</label>
            <input
              type="date"
              name="data_admissao"
              value={formData.data_admissao || ''}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
            {!isEditing ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Editar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => onDelete(formData.id)}
                >
                  Excluir
                </button>
              </>
            ) : (
              <>
                <button type="submit" className="btn btn-success">
                  Salvar Alterações
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(funcionario);
                  }}
                >
                  Cancelar Edição
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncionarioModal;
