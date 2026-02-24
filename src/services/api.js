import Papa from 'papaparse';

const DB_KEY = 'funcionarios_db';
const CSV_PATH = '/banco.csv';

// Função auxiliar para gerar IDs únicos
const generateId = (data) => {
  if (!data || data.length === 0) return 1;
  return Math.max(...data.map(item => parseInt(item.id))) + 1;
};

export const api = {
  // Inicializa o banco lendo do CSV se necessário
  init: async () => {
    const existingData = localStorage.getItem(DB_KEY);
    if (!existingData) {
      try {
        const response = await fetch(CSV_PATH);
        const csvText = await response.text();
        
        return new Promise((resolve) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              localStorage.setItem(DB_KEY, JSON.stringify(results.data));
              resolve(results.data);
            }
          });
        });
      } catch (error) {
        console.error("Erro ao carregar CSV inicial:", error);
        return [];
      }
    }
    return JSON.parse(existingData);
  },

  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },

  create: (funcionario) => {
    const data = api.getAll();
    const newFuncionario = { ...funcionario, id: generateId(data) };
    const newData = [...data, newFuncionario];
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return newFuncionario;
  },

  update: (id, updatedFuncionario) => {
    const data = api.getAll();
    const newData = data.map(item => 
      item.id == id ? { ...item, ...updatedFuncionario } : item
    );
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return updatedFuncionario;
  },

  delete: (id) => {
    const data = api.getAll();
    const newData = data.filter(item => item.id != id);
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
  },

  // Simula o download do CSV atualizado
  exportCsv: () => {
    const data = api.getAll();
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

  // Importa dados de um CSV (sobrescreve ou mescla, aqui vamos sobrescrever para simplificar)
  importData: (novosDados) => {
    if (!Array.isArray(novosDados)) return false;
    // Validação simples: verifica se tem pelo menos um item e se tem campos obrigatórios
    // Se o array estiver vazio, aceitamos também (limpar banco)
    if (novosDados.length > 0) {
       const primeiro = novosDados[0];
       if (!primeiro.hasOwnProperty('nome') || !primeiro.hasOwnProperty('cargo')) {
           return false; // CSV inválido
       }
    }
    
    // Tratamento para garantir IDs únicos se o CSV não tiver
    // Mas assumindo que vem de um export nosso, já deve ter IDs.
    // Se não tiver, poderíamos gerar. Por enquanto, confiamos no CSV.
    
    localStorage.setItem(DB_KEY, JSON.stringify(novosDados));
    return true;
  }
};
