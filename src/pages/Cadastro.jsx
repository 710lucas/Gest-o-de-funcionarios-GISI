import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { api } from '../services/api';

const Cadastro = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '',
        departamento: '',
        salario: '',
        data_admissao: '',
        competencias: [],
        carga_horaria_max: 40
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.nome || !formData.cargo || !formData.salario) {
            alert('Preencha os campos obrigatórios!');
            return;
        }

        setLoading(true);
        try {
            await api.create(formData);
            alert('Funcionário cadastrado com sucesso!');
            navigate('/funcionarios');
        } catch (error) {
            console.error('Erro ao cadastrar:', error);
            alert('Erro ao cadastrar funcionário: ' + (error.message || 'Erro desconhecido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ paddingBottom: isMobile ? '80px' : '0' }}>
            <h1 style={{ marginBottom: '2rem' }}>Cadastro de Funcionário</h1>
            
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nome">Nome Completo *</label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            className="form-input"
                            value={formData.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="cargo">Cargo *</label>
                        <input
                            type="text"
                            id="cargo"
                            name="cargo"
                            className="form-input"
                            value={formData.cargo}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="departamento">Departamento</label>
                        <select
                            id="departamento"
                            name="departamento"
                            className="form-input"
                            value={formData.departamento}
                            onChange={handleChange}
                        >
                            <option value="">Selecione...</option>
                            <option value="TI">TI</option>
                            <option value="RH">RH</option>
                            <option value="Vendas">Vendas</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Financeiro">Financeiro</option>
                            <option value="Operações">Operações</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="salario">Salário (R$) *</label>
                        <input
                            type="number"
                            id="salario"
                            name="salario"
                            className="form-input"
                            value={formData.salario}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="data_admissao">Data de Admissão *</label>
                        <input
                            type="date"
                            id="data_admissao"
                            name="data_admissao"
                            className="form-input"
                            value={formData.data_admissao}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Competências / Skills</label>
                        <div className="skills-container" style={{ marginBottom: '0.75rem' }}>
                            {formData.competencias.map(skill => (
                                <span key={skill} className="skill-tag">
                                    {skill}
                                    <button 
                                        type="button" 
                                        className="remove-skill" 
                                        onClick={() => handleRemoveSkill(skill)}
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                list="competencias-sugeridas"
                                className="form-input" 
                                value={newSkill} 
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                placeholder="Digitar ou selecionar skill..."
                                style={{ flex: 1 }}
                            />
                            <datalist id="competencias-sugeridas">
                                {api.getCompetenciasPadrao()
                                    .filter(c => !formData.competencias.includes(c))
                                    .map(c => <option key={c} value={c} />)
                                }
                            </datalist>
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleAddSkill}
                                style={{ whiteSpace: 'nowrap' }}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                            {loading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Cadastro;
