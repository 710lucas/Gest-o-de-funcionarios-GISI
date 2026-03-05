import React, { useState } from 'react';
import { api } from '../services/api';
import { Trash2, RefreshCw, AlertTriangle, Database } from 'lucide-react';

const Config = () => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleClearDatabase = () => {
    api.clearDatabase();
    setShowConfirmClear(false);
    alert('Base de dados limpa com sucesso!');
    window.location.reload();
  };

  const handleResetToDefault = () => {
    api.resetToDefault();
    setShowConfirmReset(false);
    alert('Base de dados resetada para os 50 funcionários padrão!');
    window.location.reload();
  };

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={32} color="#3b82f6" />
          Configurações
        </h1>
        <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
          Gerencie a base de dados do sistema
        </p>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Card Reset to Default */}
        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ backgroundColor: '#10b98120', padding: '0.75rem', borderRadius: '50%' }}>
              <RefreshCw size={24} color="#10b981" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>
                Resetar para Base Padrão
              </h3>
              <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                Substitui todos os dados atuais pelos 50 funcionários padrão do sistema. 
                Esta ação não pode ser desfeita.
              </p>
              {!showConfirmReset ? (
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowConfirmReset(true)}
                  style={{ 
                    marginTop: '1rem', 
                    backgroundColor: '#10b981', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}
                >
                  <RefreshCw size={16} />
                  Resetar Base de Dados
                </button>
              ) : (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '6px',
                  border: '1px solid #f59e0b'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={20} color="#f59e0b" />
                    <strong style={{ color: '#92400e' }}>Tem certeza?</strong>
                  </div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#78350f' }}>
                    Isso irá substituir todos os dados atuais pelos 50 funcionários padrão.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleResetToDefault}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      Sim, resetar
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setShowConfirmReset(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Clear Database */}
        <div className="card" style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ef444420', padding: '0.75rem', borderRadius: '50%' }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.25rem' }}>
                Limpar Base de Dados
              </h3>
              <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                Remove todos os funcionários da base de dados. 
                Você ficará com uma base vazia. Esta ação não pode ser desfeita.
              </p>
              {!showConfirmClear ? (
                <button 
                  className="btn" 
                  onClick={() => setShowConfirmClear(true)}
                  style={{ 
                    marginTop: '1rem', 
                    backgroundColor: '#ef4444', 
                    color: 'white',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    border: 'none'
                  }}
                >
                  <Trash2 size={16} />
                  Limpar Todos os Dados
                </button>
              ) : (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#fee2e2', 
                  borderRadius: '6px',
                  border: '1px solid #ef4444'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={20} color="#ef4444" />
                    <strong style={{ color: '#7f1d1d' }}>Atenção!</strong>
                  </div>
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', color: '#991b1b' }}>
                    Isso irá apagar TODOS os funcionários permanentemente. Esta ação não pode ser desfeita!
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn" 
                      onClick={handleClearDatabase}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                    >
                      Sim, apagar tudo
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setShowConfirmClear(false)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card" style={{ 
          backgroundColor: '#eff6ff', 
          padding: '1rem', 
          borderRadius: '8px', 
          border: '1px solid #3b82f6'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
            <strong>💡 Dica:</strong> Antes de limpar ou resetar os dados, você pode exportar um backup usando a opção "Baixar CSV Atual" no Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Config;
