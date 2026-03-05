import Papa from 'papaparse';
const DB_KEY = 'funcionarios_db';
const CSV_PATH = '/banco.csv';

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
              if (results.data && results.data.length > 0) {
                localStorage.setItem(DB_KEY, JSON.stringify(results.data));
                resolve(results.data);
              } else {
                const defaultData = generateDefaultData();
                localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
                resolve(defaultData);
              }
            }
          });
        });
      } catch (error) {
        console.error(error);
        const defaultData = generateDefaultData();
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
        return defaultData;
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
  },
  clearDatabase: () => {
    localStorage.setItem(DB_KEY, JSON.stringify([]));
    return true;
  },
  resetToDefault: () => {
    const defaultData = generateDefaultData();
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
};
