import React, { useState } from 'react';
import { api } from '../services/api';

const FuncionarioModal = ({ funcionario, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState(funcionario || {});
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const competenciasDisponiveis = api.getCompetenciasPadrao();

  React.useEffect(() => {
    if (funcionario) {
      setFormData({
        ...funcionario,
        competencias: funcionario.competencias || [],
        carga_horaria_max: funcionario.carga_horaria_max || 40
      });
      setIsEditing(false);
    }
  }, [funcionario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill && !formData.competencias.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        competencias: [...prev.competencias, newSkill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      competencias: prev.competencias.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: funcionario.id });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Detalhes do Funcionário</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                required
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
                required
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
                required
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
                required
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
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carga Horária Máx (h/semana)</label>
              <input
                type="number"
                name="carga_horaria_max"
                value={formData.carga_horaria_max || 40}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Competências / Skills</label>
            <div className="skills-container">
              {formData.competencias?.map(skill => (
                <span key={skill} className="skill-tag">
                  {skill}
                  {isEditing && (
                    <button 
                      type="button" 
                      className="remove-skill" 
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
            
            {isEditing && (
              <div className="add-skill-box" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-input" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)}
                >
                  <option value="">Selecionar Competência...</option>
                  {competenciasDisponiveis
                    .filter(c => !formData.competencias?.includes(c))
                    .map(c => <option key={c} value={c}>{c}</option>)
                  }
                </select>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleAddSkill}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Adicionar
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '2rem' }}>
            {!isEditing ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  Editar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(formData.id);
                  }}
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
