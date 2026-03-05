import Papa from 'papaparse';
const DB_KEY = 'funcionarios_db';
const CSV_PATH = '/banco.csv';

const generateId = (data) => {
  if (!data || data.length === 0) return 1;
  return Math.max(...data.map(item => parseInt(item.id))) + 1;
};
export const api = {
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
        console.error(error);
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
  }
};
