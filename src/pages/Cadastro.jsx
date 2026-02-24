import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Cadastro = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        cargo: '',
        departamento: '',
        salario: '',
        data_admissao: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simples validação
        if (!formData.nome || !formData.cargo || !formData.salario) {
            alert('Preencha os campos obrigatórios!');
            return;
        }

        api.create(formData);
        alert('Funcionário cadastrado com sucesso!');
        navigate('/funcionarios');
    };

    return (
        <div className="container">
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

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary">
                            Cadastrar
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate('/')}
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
