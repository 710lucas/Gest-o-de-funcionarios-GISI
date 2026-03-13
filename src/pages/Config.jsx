import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trash2, RefreshCw, AlertTriangle, Database, Server, HardDrive } from 'lucide-react';

const Config = () => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [config, setConfig] = useState({ useApi: false, apiUrl: '' });
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const currentConfig = api.getConfig();
    setConfig(currentConfig);
    setApiUrl(currentConfig.apiUrl);
  }, []);

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

  const handleToggleDataSource = (useApi) => {
    if (useApi && !apiUrl) {
      alert('Por favor, informe a URL da API antes de ativar esta opção.');
      return;
    }
    api.setApiConfig(useApi, apiUrl || 'http://localhost:8080/funcionarios');
    setConfig({ useApi, apiUrl: apiUrl || 'http://localhost:8080/funcionarios' });
    alert(`Fonte de dados alterada para ${useApi ? 'API Externa' : 'LocalStorage'}. A página será recarregada.`);
    window.location.reload();
  };

  const handleSaveApiUrl = () => {
    if (!apiUrl) {
      alert('Por favor, informe a URL da API.');
      return;
    }
    api.setApiConfig(config.useApi, apiUrl);
    setConfig({ ...config, apiUrl });
    alert('URL da API salva com sucesso!');
  };

  return (
    <div className="container" style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: isMobile ? '80px' : '2rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database size={isMobile ? 28 : 32} color="#3b82f6" />
          Configurações
        </h1>
        <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: isMobile ? '0.875rem' : '1rem' }}>
          Gerencie a base de dados do sistema
        </p>
      </div>

      <div style={{ marginTop: isMobile ? '1rem' : '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Card Data Source Configuration */}
        <div className="card" style={{ backgroundColor: '#fff', padding: isMobile ? '1rem' : '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ backgroundColor: '#3b82f620', padding: '0.75rem', borderRadius: '50%' }}>
              {config.useApi ? <Server size={isMobile ? 20 : 24} color="#3b82f6" /> : <HardDrive size={isMobile ? 20 : 24} color="#3b82f6" />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                Fonte de Dados
              </h3>
              <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
                Escolha entre usar o LocalStorage do navegador ou uma API externa para gerenciar os dados.
              </p>
              
              {/* Status atual */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: config.useApi ? '#dbeafe' : '#f3f4f6', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {config.useApi ? <Server size={18} color="#3b82f6" /> : <HardDrive size={18} color="#6b7280" />}
                <strong style={{ color: config.useApi ? '#1e40af' : '#374151' }}>
                  Modo Atual: {config.useApi ? 'API Externa' : 'LocalStorage'}
                </strong>
              </div>

              {/* Configuração da URL da API */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: isMobile ? '0.875rem' : '0.95rem' }}>
                  URL da API:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8080/funcionarios"
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: isMobile ? '0.875rem' : '0.95rem'
                    }}
                  />
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleSaveApiUrl}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Salvar URL
                  </button>
                </div>
              </div>

              {/* Botões de alternância */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: isMobile ? 'column' : 'row' }}>
                <button 
                  className="btn" 
                  onClick={() => handleToggleDataSource(false)}
                  disabled={!config.useApi}
                  style={{ 
                    backgroundColor: !config.useApi ? '#6b7280' : '#fff',
                    color: !config.useApi ? '#fff' : '#374151',
                    border: '1px solid #d1d5db',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: !config.useApi ? 0.6 : 1,
                    cursor: !config.useApi ? 'not-allowed' : 'pointer'
                  }}
                >
                  <HardDrive size={16} />
                  Usar LocalStorage
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleToggleDataSource(true)}
                  disabled={config.useApi}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: config.useApi ? 0.6 : 1,
                    cursor: config.useApi ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Server size={16} />
                  Usar API Externa
                </button>
              </div>

              {config.useApi && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#fef3c7', 
                  borderRadius: '6px',
                  border: '1px solid #f59e0b',
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <strong style={{ color: '#92400e' }}>Atenção:</strong>
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#78350f' }}>
                    No modo API, as funções de limpar e resetar base de dados não estão disponíveis. 
                    Use a API backend para gerenciar os dados.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Reset to Default */}
        <div className="card" style={{ backgroundColor: '#fff', padding: isMobile ? '1rem' : '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ backgroundColor: '#10b98120', padding: '0.75rem', borderRadius: '50%' }}>
              <RefreshCw size={isMobile ? 20 : 24} color="#10b981" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                Resetar para Base Padrão
              </h3>
              <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
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
        <div className="card" style={{ backgroundColor: '#fff', padding: isMobile ? '1rem' : '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ backgroundColor: '#ef444420', padding: '0.75rem', borderRadius: '50%' }}>
              <Trash2 size={isMobile ? 20 : 24} color="#ef4444" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                Limpar Base de Dados
              </h3>
              <p style={{ color: '#6b7280', margin: '0.5rem 0', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
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
