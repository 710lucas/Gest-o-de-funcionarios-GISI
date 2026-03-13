import Papa from 'papaparse';
const DB_KEY = 'funcionarios_db';
const CONFIG_KEY = 'api_config';
const CSV_PATH = '/banco.csv';

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

// Funções de conversão entre formatos
const toApiFormat = (funcionario) => {
  const apiObj = {
    nome: funcionario.nome || '',
    cargo: funcionario.cargo || '',
    departamento: funcionario.departamento || '',
    salario: parseFloat(funcionario.salario || 0),
    dataAdmissao: funcionario.data_admissao || ''
  };
  
  // Inclui ID apenas se existir (para PUT)
  if (funcionario.id) {
    apiObj.id = funcionario.id;
  }
  
  return apiObj;
};

const fromApiFormat = (funcionario) => {
  if (!funcionario) {
    console.warn('[API] Funcionário inválido recebido:', funcionario);
    return null;
  }
  
  return {
    id: funcionario.id || 0,
    nome: funcionario.nome || '',
    cargo: funcionario.cargo || '',
    departamento: funcionario.departamento || '',
    salario: funcionario.salario || 0,
    data_admissao: funcionario.dataAdmissao || ''
  };
};

// Funções auxiliares para API REST
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
    // Converte para o formato da API antes de enviar
    const apiBody = toApiFormat(body);
    options.body = JSON.stringify(apiBody);
    console.log(`[API] ${method} ${url}`, 'Enviando:', apiBody);
  } else {
    console.log(`[API] ${method} ${url}`);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] Erro ${response.status}:`, errorText);
      throw new Error(`Erro na API: ${response.statusText}`);
    }
    
    if (method === 'DELETE') {
      console.log(`[API] DELETE bem-sucedido`);
      return;
    }
    
    const data = await response.json();
    console.log(`[API] Resposta recebida:`, data);
    
    // Converte do formato da API para o formato do frontend
    if (Array.isArray(data)) {
      const converted = data.map(fromApiFormat).filter(item => item !== null);
      console.log(`[API] Convertido para frontend:`, converted);
      return converted;
    } else if (data && typeof data === 'object') {
      const converted = fromApiFormat(data);
      console.log(`[API] Convertido para frontend:`, converted);
      return converted;
    }
    
    return data;
  } catch (error) {
    console.error('[API] Erro na requisição:', error);
    throw error;
  }
};

export const api = {
  // Gerenciamento de configuração
  getConfig: () => getConfig(),
  
  setApiConfig: (useApi, apiUrl) => {
    setConfig({ useApi, apiUrl });
  },

  init: async () => {
    const config = getConfig();
    
    if (config.useApi) {
      // Se usar API, não precisa inicializar localStorage
      return [];
    }
    
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
    
    if (config.useApi) {
      return await apiRequest('', 'GET');
    }
    
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  create: async (funcionario) => {
    const config = getConfig();
    
    if (config.useApi) {
      return await apiRequest('', 'POST', funcionario);
    }
    
    const data = await api.getAll();
    const newFuncionario = { ...funcionario, id: generateId(data) };
    const newData = [...data, newFuncionario];
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return newFuncionario;
  },
  
  update: async (id, updatedFuncionario) => {
    const config = getConfig();
    
    if (config.useApi) {
      return await apiRequest(`/${id}`, 'PUT', updatedFuncionario);
    }
    
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
    if (novosDados.length > 0) {
       const primeiro = novosDados[0];
       if (!primeiro.hasOwnProperty('nome') || !primeiro.hasOwnProperty('cargo')) {
           return false;
       }
    }
    localStorage.setItem(DB_KEY, JSON.stringify(novosDados));
    return true;
  },
  
  clearDatabase: () => {
    const config = getConfig();
    
    if (config.useApi) {
      alert('Esta função não está disponível no modo API. Use a API backend para limpar os dados.');
      return false;
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return true;
  },
  
  resetToDefault: () => {
    const config = getConfig();
    
    if (config.useApi) {
      alert('Esta função não está disponível no modo API. Use a API backend para resetar os dados.');
      return false;
    }
    
    const defaultData = generateDefaultData();
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
};
