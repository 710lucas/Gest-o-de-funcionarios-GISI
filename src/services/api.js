import Papa from 'papaparse';

const DB_KEY = 'funcionarios_db';
const PROJETOS_KEY = 'projetos_db';
const ALOCACOES_KEY = 'alocacoes_db';
const CONFIG_KEY = 'api_config';
const AI_CONFIG_KEY = 'ai_config';

// Definições Globais para Sincronia de Dados
const SKILLS_POR_CARGO = {
  'Desenvolvedor': ['React', 'JavaScript', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Clean Code', 'Inglês'],
  'Analista de Sistemas': ['Java', 'Spring Boot', 'SQL', 'NoSQL', 'UML', 'Metodologias Ágeis', 'Azure'],
  'Especialista em Cloud': ['AWS', 'Docker', 'Kubernetes', 'Python', 'Terraform', 'Linux', 'Segurança da Informação'],
  'Engenheiro DevOps': ['Docker', 'Kubernetes', 'AWS', 'Python', 'CI/CD', 'Jenkins', 'Monitoramento'],
  'Designer': ['Design UI/UX', 'Figma', 'Adobe XD', 'Photoshop', 'Prototipagem', 'Criatividade'],
  'Especialista em UX': ['Design UI/UX', 'Figma', 'Pesquisa de Usuário', 'Testes A/B', 'Arquitetura de Informação'],
  'Gerente': ['Gestão de Projetos', 'Liderança', 'Comunicação', 'Resolução de Conflitos', 'Planejamento Estratégico'],
  'Analista': ['Análise de Dados', 'SQL', 'Python', 'Excel Avançado', 'Power BI', 'Storytelling de Dados'],
  'Coordenador': ['Gestão de Equipes', 'Liderança', 'Mentoria', 'KPIs', 'Gestão de Tempo'],
  'Financeiro': ['Análise Financeira', 'ERP', 'Tesouraria', 'Contabilidade', 'Excel Avançado', 'Compliance'],
  'Marketing': ['Estratégia Digital', 'SEO', 'Copywriting', 'Google Ads', 'Redes Sociais', 'Análise de Mercado']
};

const CARGOS_POR_DEPTO = {
  'TI': ['Desenvolvedor', 'Analista de Sistemas', 'Especialista em Cloud', 'Engenheiro DevOps'],
  'Marketing': ['Designer', 'Especialista em UX', 'Marketing'],
  'RH': ['Gerente', 'Analista', 'Coordenador'],
  'Financeiro': ['Financeiro', 'Analista'],
  'Vendas': ['Coordenador', 'Analista', 'Marketing'],
  'Operações': ['Coordenador', 'Analista', 'Gerente']
};

const COMPETENCIAS_SOFT = ['Comunicação', 'Liderança', 'Trabalho em Equipe', 'Proatividade', 'Inteligência Emocional', 'Adaptabilidade', 'Pensamento Crítico'];

const COMPETENCIAS_PADRAO = [...new Set([...Object.values(SKILLS_POR_CARGO).flat(), ...COMPETENCIAS_SOFT])];

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
    model: 'gemini-2.5-flash',
    baseUrl: ''
  };
};

const setAIConfig = (config) => {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
};

const generateId = (data) => {
  if (!data || data.length === 0) return 1;
  const ids = data.map(item => parseInt(item.id)).filter(id => !isNaN(id));
  if (ids.length === 0) return 1;
  return Math.max(...ids) + 1;
};

const generateDefaultData = () => {
  const nomes = ['Ana Silva', 'Bruno Costa', 'Carlos Santos', 'Diana Oliveira', 'Eduardo Lima', 'Fernanda Souza', 'Gabriel Alves', 'Helena Rodrigues', 'Igor Pereira', 'Juliana Martins', 'Kevin Ferreira', 'Larissa Ribeiro', 'Marcos Carvalho', 'Natalia Gomes', 'Otávio Mendes', 'Paula Araújo', 'Rafael Barros', 'Sabrina Dias', 'Thiago Monteiro', 'Vanessa Cardoso', 'Wagner Teixeira', 'Yasmin Correia', 'André Barbosa', 'Beatriz Castro', 'Caio Pinto', 'Daniela Rocha', 'Elias Freitas', 'Flávia Moreira', 'Gustavo Ramos', 'Isabela Cunha', 'João Nascimento', 'Kamila Nunes', 'Leonardo Pires', 'Mariana Campos', 'Nicolas Viana', 'Olivia Azevedo', 'Pedro Duarte', 'Raquel Moura', 'Samuel Batista', 'Tatiana Melo', 'Ulisses Macedo', 'Vitória Rezende', 'William Lopes', 'Ximena Farias', 'Yuri Tavares', 'Zilda Medeiros', 'Alberto Fonseca', 'Bruna Guimarães', 'Cristiano Sales', 'Débora Xavier', 'Enzo Silva', 'Felipe Nunes', 'Giovanna Lima', 'Henrique Souza', 'Iris Machado', 'Jorge Viana', 'Karina Dias', 'Luiz Gonzaga', 'Marta Suplicy', 'Nelson Rodrigues', 'Olga Benário', 'Patrícia Pillar', 'Quirino Santos', 'Roberto Carlos', 'Simone Tebet', 'Tadeu Schmidt', 'Uriel Oliveira', 'Valéria Valenssa', 'Walcyr Carrasco', 'Xuxa Meneghel', 'Yago Pikachu', 'Zeca Pagodinho', 'Aline Barros', 'Belo Silva', 'Claudia Leitte', 'Daniela Mercury', 'Ed Motta', 'Fábio Jr', 'Gretchen Cantora', 'Humberto Gessinger', 'Ivete Sangalo', 'Jão Medeiros'];
  
  const departamentos = Object.keys(CARGOS_POR_DEPTO);
  
  const funcionarios = [];
  // Aumentado para 80 funcionários para maior cobertura de skills
  for (let i = 0; i < 80; i++) {
    const depto = departamentos[i % departamentos.length]; // Distribuição equilibrada de depto
    const cargosDisponiveis = CARGOS_POR_DEPTO[depto];
    const cargo = cargosDisponiveis[Math.floor(Math.random() * cargosDisponiveis.length)];
    
    const salarioBase = [3000, 4500, 5500, 6800, 7500, 8200, 9500, 11000, 13500, 16000];
    const ano = 2018 + Math.floor(Math.random() * 8);
    const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    // Atribuir competências baseadas no cargo + Algumas Soft Skills
    let poolSkills = SKILLS_POR_CARGO[cargo] || SKILLS_POR_CARGO[cargo.split(' ')[0]] || COMPETENCIAS_PADRAO;
    const numCompTech = 3;
    const numCompSoft = 2;
    
    const compFunc = [
      ...[...poolSkills].sort(() => 0.5 - Math.random()).slice(0, numCompTech),
      ...[...COMPETENCIAS_SOFT].sort(() => 0.5 - Math.random()).slice(0, numCompSoft)
    ];

    funcionarios.push({
      id: i + 1,
      nome: nomes[i] || `Profissional ${i+1}`,
      cargo: cargo,
      departamento: depto,
      salario: salarioBase[Math.floor(Math.random() * salarioBase.length)],
      data_admissao: `${ano}-${mes}-${dia}`,
      competencias: [...new Set(compFunc)],
      carga_horaria_max: 40
    });
  }
  return funcionarios;
};

const generateDefaultProjetos = (forceStress = false) => {
  const nomesProjetos = [
    'Expansão Cloud AWS', 'App Vendas Mobile', 'Portal Transparência', 'Recomendação IA', 
    'Processos RH v2', 'Dashboard 2026', 'Migração Legacy', 'E-learning Interno', 
    'Integração Pagamentos', 'Redesign UI/UX', 'Fidelidade Clientes', 'Automação Industrial',
    'Segurança Cibernética', 'Análise de Mercado', 'Treinamento Soft Skills'
  ];

  const statusPossiveis = ['Em Planejamento', 'Iniciado', 'Pausado'];
  const projetos = [];
  
  // Garantir que todas as competências padrão sejam solicitadas ao menos uma vez
  const shuffledSkills = [...COMPETENCIAS_PADRAO].sort(() => 0.5 - Math.random());
  const skillsPerProject = Math.ceil(shuffledSkills.length / 12);

  for (let i = 0; i < 12; i++) {
    const nome = nomesProjetos[i % nomesProjetos.length];
    const requisitos = [];
    
    // Pega um pedaço das skills padrão para este projeto
    const startIdx = i * skillsPerProject;
    const projectSkills = shuffledSkills.slice(startIdx, startIdx + skillsPerProject);
    
    // Adiciona as skills obrigatórias para cobertura
    projectSkills.forEach(skill => {
      requisitos.push({
        competencia: skill,
        quantidade: 1 + Math.floor(Math.random() * 2),
        esforço_por_pessoa: 10 + Math.floor(Math.random() * 2) * 10
      });
    });

    // Se for stress, insere competências raras
    if (forceStress && Math.random() > 0.6) {
      requisitos.push({
        competencia: 'Computação Quântica',
        quantidade: 1,
        esforço_por_pessoa: 20
      });
    }

    projetos.push({
      id: i + 1,
      nome: forceStress ? `[CRÍTICO] ${nome}` : nome,
      descricao: `Iniciativa estratégica focada em ${nome.toLowerCase()}.`,
      status: statusPossiveis[Math.floor(Math.random() * 3)],
      requisitos
    });
  }
  return projetos;
};

const generateDefaultAlocacoes = (funcionarios, projetos, forceStress = false) => {
  const alocacoes = [];
  const esforcoOcupado = {};

  projetos.forEach(projeto => {
    projeto.requisitos.forEach(req => {
      // Tentar alocar mais pessoas para preencher a demanda
      const vagasParaPreencher = req.quantidade;
      let alocadosCount = 0;

      const candidatos = funcionarios.filter(f => {
        const temSkill = (f.competencias || []).includes(req.competencia);
        if (!temSkill) return false;
        
        const esforcoAtual = esforcoOcupado[f.id] || 0;
        const limite = (f.carga_horaria_max || 40);
        
        if (forceStress && Math.random() > 0.8) return true;
        return esforcoAtual + req.esforço_por_pessoa <= limite;
      });

      // Ordenar candidatos por quem tem MENOS esforço atual para distribuir melhor
      candidatos.sort((a, b) => (esforcoOcupado[a.id] || 0) - (esforcoOcupado[b.id] || 0));

      for (const cand of candidatos) {
        if (alocadosCount >= vagasParaPreencher) break;
        
        const jaAlocado = alocacoes.some(a => a.funcionarioId == cand.id && a.projetoId == projeto.id);
        if (jaAlocado) continue;

        alocacoes.push({
          funcionarioId: cand.id,
          projetoId: projeto.id,
          competencia: req.competencia,
          esforco: req.esforço_por_pessoa
        });

        esforcoOcupado[cand.id] = (esforcoOcupado[cand.id] || 0) + req.esforço_por_pessoa;
        alocadosCount++;
      }
    });
  });

  return alocacoes;
};

const toApiFormat = (funcionario) => {
  const apiObj = {
    nome: funcionario.nome || '',
    cargo: funcionario.cargo || '',
    departamento: funcionario.departamento || '',
    salario: parseFloat(funcionario.salario || 0),
    dataAdmissao: funcionario.data_admissao || '',
    competencias: funcionario.competencias || [],
    cargaHorariaMax: funcionario.carga_horaria_max || 40
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
    data_admissao: funcionario.dataAdmissao || '',
    competencias: funcionario.competencias || [],
    carga_horaria_max: funcionario.cargaHorariaMax || 40
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
  getCompetenciasPadrao: () => COMPETENCIAS_PADRAO,

  init: async () => {
    const config = getConfig();
    if (config.useApi) return [];
    
    // 1. Verificar integridade do banco de funcionários (Schema Check)
    const rawDB = localStorage.getItem(DB_KEY);
    let needsInitialReset = false;

    if (!rawDB) {
      needsInitialReset = true;
    } else {
      try {
        const data = JSON.parse(rawDB);
        // Se o banco existe mas é "antigo" (não tem carga horária ou competências no primeiro item)
        if (data.length > 0 && (data[0].carga_horaria_max === undefined || !data[0].competencias)) {
          console.warn('[DB] Banco legado detectado. Atualizando estrutura...');
          needsInitialReset = true;
        }
      } catch (e) {
        needsInitialReset = true;
      }
    }

    if (needsInitialReset) {
      api.resetToDefault();
      return JSON.parse(localStorage.getItem(DB_KEY));
    }

    // 2. Verificar se as novas entidades existem (Projetos e Alocações)
    if (localStorage.getItem(PROJETOS_KEY) === null) {
      const defaultProjetos = generateDefaultProjetos();
      localStorage.setItem(PROJETOS_KEY, JSON.stringify(defaultProjetos));
    }

    if (localStorage.getItem(ALOCACOES_KEY) === null) {
      const funcs = JSON.parse(localStorage.getItem(DB_KEY));
      const projs = JSON.parse(localStorage.getItem(PROJETOS_KEY));
      const defaultAlocacoes = generateDefaultAlocacoes(funcs, projs);
      localStorage.setItem(ALOCACOES_KEY, JSON.stringify(defaultAlocacoes));
    }

    return JSON.parse(localStorage.getItem(DB_KEY));
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
    const newFuncionario = { ...funcionario, id: generateId(data), competencias: funcionario.competencias || [], carga_horaria_max: funcionario.carga_horaria_max || 40 };
    const newData = [...data, newFuncionario];
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return newFuncionario;
  },
  
  update: async (id, updatedFuncionario) => {
    const config = getConfig();
    if (config.useApi) return await apiRequest(`/${id}`, 'PUT', updatedFuncionario);
    const data = await api.getAll();
    const newData = data.map(item => item.id == id ? { ...item, ...updatedFuncionario } : item);
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    return updatedFuncionario;
  },
  
  delete: async (id) => {
    const config = getConfig();
    if (config.useApi) { await apiRequest(`/${id}`, 'DELETE'); return; }
    const data = await api.getAll();
    const newData = data.filter(item => item.id != id);
    localStorage.setItem(DB_KEY, JSON.stringify(newData));
    const alocacoes = await api.getAllAlocacoes();
    localStorage.setItem(ALOCACOES_KEY, JSON.stringify(alocacoes.filter(a => a.funcionarioId != id)));
  },

  getAllProjetos: async () => {
    const data = localStorage.getItem(PROJETOS_KEY);
    return data ? JSON.parse(data) : [];
  },

  createProjeto: async (projeto) => {
    const data = await api.getAllProjetos();
    const newProjeto = { ...projeto, id: generateId(data), status: projeto.status || 'Em Planejamento', requisitos: projeto.requisitos || [] };
    const newData = [...data, newProjeto];
    localStorage.setItem(PROJETOS_KEY, JSON.stringify(newData));
    return newProjeto;
  },

  updateProjeto: async (id, updatedProjeto) => {
    const data = await api.getAllProjetos();
    const newData = data.map(item => item.id == id ? { ...item, ...updatedProjeto } : item);
    localStorage.setItem(PROJETOS_KEY, JSON.stringify(newData));
    return updatedProjeto;
  },

  deleteProjeto: async (id) => {
    const data = await api.getAllProjetos();
    localStorage.setItem(PROJETOS_KEY, JSON.stringify(data.filter(item => item.id != id)));
    const alocacoes = await api.getAllAlocacoes();
    localStorage.setItem(ALOCACOES_KEY, JSON.stringify(alocacoes.filter(a => a.projetoId != id)));
  },

  getAllAlocacoes: async () => {
    const data = localStorage.getItem(ALOCACOES_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateAlocacao: async (alocacao) => {
    const alocacoes = await api.getAllAlocacoes();
    const index = alocacoes.findIndex(a => a.funcionarioId == alocacao.funcionarioId && a.projetoId == alocacao.projetoId);
    let novasAlocacoes;
    if (index >= 0) {
      if (alocacao.esforco <= 0) novasAlocacoes = alocacoes.filter((_, i) => i !== index);
      else { novasAlocacoes = [...alocacoes]; novasAlocacoes[index] = alocacao; }
    } else if (alocacao.esforco > 0) novasAlocacoes = [...alocacoes, alocacao];
    else novasAlocacoes = alocacoes;
    localStorage.setItem(ALOCACOES_KEY, JSON.stringify(novasAlocacoes));
    return novasAlocacoes;
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
    localStorage.setItem(PROJETOS_KEY, JSON.stringify([]));
    localStorage.setItem(ALOCACOES_KEY, JSON.stringify([]));
    return true;
  },
  
  resetToDefault: (forceStress = false) => {
    const config = getConfig();
    if (config.useApi) return false;
    const defaultData = generateDefaultData();
    const defaultProjetos = generateDefaultProjetos(forceStress);
    const defaultAlocacoes = generateDefaultAlocacoes(defaultData, defaultProjetos, forceStress);
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    localStorage.setItem(PROJETOS_KEY, JSON.stringify(defaultProjetos));
    localStorage.setItem(ALOCACOES_KEY, JSON.stringify(defaultAlocacoes));
    return defaultData;
  },
  
  generateStressScenario: () => {
    return api.resetToDefault(true);
  }
};
