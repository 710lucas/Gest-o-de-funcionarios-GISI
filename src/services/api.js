import Papa from 'papaparse';
const DB_KEY = 'funcionarios_db';
const CONFIG_KEY = 'api_config';
const AI_CONFIG_KEY = 'ai_config';

// Configuração padrão
const getConfig = () => {
  const config = localStorage.getItem(CONFIG_KEY);
  return config ? JSON.parse(config) : { 
    useApi: false, 
    apiUrl: 'http://localhost:8080/funcionarios' 
  };
};

const setConfig = (config) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

const getAIConfig = () => {
  const config = localStorage.getItem(AI_CONFIG_KEY);
  return config ? JSON.parse(config) : {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash',
    baseUrl: ''
  };
};

const setAIConfig = (config) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

const generateId = (data) => {
  if (!data || data.length === 0) return 1;
  return Math.max(...data.map(item => parseInt(item.id))) + 1;
};

const generateDefaultData = () => {
  const nomes = ['Ana Silva', 'Bruno Costa', 'Carlos Santos', 'Diana Oliveira', 'Eduardo Lima', 'Fernanda Souza', 'Gabriel Alves', 'Helena Rodrigues', 'Igor Pereira', 'Juliana Martins', 'Kevin Ferreira', 'Larissa Ribeiro', 'Marcos Carvalho', 'Natalia Gomes', 'Otávio Mendes', 'Paula Araújo', 'Rafael Barros', 'Sabrina Dias', 'Thiago Monteiro', 'Vanessa Cardoso', 'Wagner Teixeira', 'Yasmin Correia', 'André Barbosa', 'Beatriz Castro', 'Caio Pinto', 'Daniela Rocha', 'Elias Freitas', 'Flávia Moreira', 'Gustavo Ramos', 'Isabela Cunha', 'João Nascimento', 'Kamila Nunes', 'Leonardo Pires', 'Mariana Campos', 'Nicolas Viana', 'Olivia Azevedo', 'Pedro Duarte', 'Raquel Moura', 'Samuel Batista', 'Tatiana Melo', 'Ulisses Macedo', 'Vitória Rezende', 'William Lopes', 'Ximena Farias', 'Yuri Tavares', 'Zilda Medeiros', 'Alberto Fonseca', 'Bruna Guimarães', 'Cristiano Sales', 'Débora Xavier'];
  const cargos = ['Desenvolvedor', 'Designer', 'Gerente', 'Analista', 'Coordenador', 'Assistente', 'Supervisor', 'Diretor', 'Especialista', 'Consultor'];
  const departamentos = ['TI', 'Marketing', 'Vendas', 'RH', 'Financeiro', 'Operações', 'Jurídico', 'Compras'];
  
  const funcionarios = [];
  for (let i = 0; i < 50; i++) {
    const salarioBase = [3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000];
    const ano = 2020 + Math.floor(Math.random() * 6);
    const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    funcionarios.push({
      id: i + 1,
      nome: nomes[i],
      cargo: cargos[Math.floor(Math.random() * cargos.length)],
      departamento: departamentos[Math.floor(Math.random() * departamentos.length)],
      salario: salarioBase[Math.floor(Math.random() * salarioBase.length)],
      data_admissao: `${ano}-${mes}-${dia}`
    });
  }
  return funcionarios;
};

const toApiFormat = (funcionario) => {
  const apiObj = {
    nome: funcionario.nome || '',
    cargo: funcionario.cargo || '',
    departamento: funcionario.departamento || '',
    salario: parseFloat(funcionario.salario || 0),
    dataAdmissao: funcionario.data_admissao || ''
  };
  if (funcionario.id) {
    apiObj.id = funcionario.id;
  }
  return apiObj;
};

const fromApiFormat = (funcionario) => {
  if (!funcionario) return null;
  return {
    id: funcionario.id || 0,
    nome: funcionario.nome || '',
    cargo: funcionario.cargo || '',
    departamento: funcionario.departamento || '',
    salario: funcionario.salario || 0,
    data_admissao: funcionario.dataAdmissao || ''
  };
};

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const config = getConfig();
  const url = `${config.apiUrl}${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (body) {
    const apiBody = toApiFormat(body);
    options.body = JSON.stringify(apiBody);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    
    if (method === 'DELETE') return;
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(fromApiFormat).filter(item => item !== null);
    } else if (data && typeof data === 'object') {
      return fromApiFormat(data);
    }
    
    return data;
  } catch (error) {
    console.error('[API] Erro na requisição:', error);
    throw error;
  }
};

export const api = {
  getConfig: () => getConfig(),
  setApiConfig: (useApi, apiUrl) => {
    setConfig({ useApi, apiUrl });
  },
  getAIConfig: () => getAIConfig(),
  setAIConfig: (config) => setAIConfig(config),

  init: async () => {
    const config = getConfig();
    if (config.useApi) return [];
    
    const existingData = localStorage.getItem(DB_KEY);
    if (!existingData) {
      const defaultData = generateDefaultData();
      localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(existingData);
  },
  
  getAll: async () => {
    const config = getConfig();
    if (config.useApi) return await apiRequest('', 'GET');
    
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  create: async (funcionario) => {
    const config = getConfig();
    if (config.useApi) return await apiRequest('', 'POST', funcionario);
    
    const data = await api.getAll();
    const newFuncionario = { ...funcionario, id: generateId(data) };
    const newData = [...data, newFuncionario];
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return newFuncionario;
  },
  
  update: async (id, updatedFuncionario) => {
    const config = getConfig();
    if (config.useApi) return await apiRequest(`/${id}`, 'PUT', updatedFuncionario);
    
    const data = await api.getAll();
    const newData = data.map(item => 
      item.id == id ? { ...item, ...updatedFuncionario } : item
    );
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return updatedFuncionario;
  },
  
  delete: async (id) => {
    const config = getConfig();
    if (config.useApi) {
      await apiRequest(`/${id}`, 'DELETE');
      return;
    }
    const data = await api.getAll();
    const newData = data.filter(item => item.id != id);
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
  },
  
  exportCsv: async () => {
    const data = await api.getAll();
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'funcionarios_atualizado.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  importData: (novosDados) => {
    if (!Array.isArray(novosDados)) return false;
    localStorage.setItem(DB_KEY, JSON.stringify(novosDados));
    return true;
  },
  
  clearDatabase: () => {
    const config = getConfig();
    if (config.useApi) return false;
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return true;
  },
  
  resetToDefault: () => {
    const config = getConfig();
    if (config.useApi) return false;
    const defaultData = generateDefaultData();
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
};
