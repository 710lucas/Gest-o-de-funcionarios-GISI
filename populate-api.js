#!/usr/bin/env node

/**
 * Script para popular a API com funcionários e projetos dinâmicos
 * 
 * Uso:
 *   node populate-api.js [URL_DA_API] [--stress]
 */

const API_URL = process.argv[2] || 'http://localhost:8080/funcionarios';
const IS_STRESS = process.argv.includes('--stress');

const primeiroNomes = ['Ana', 'Bruno', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Juliana', 'Kevin', 'Larissa', 'Marcos', 'Natalia', 'Otávio', 'Paula', 'Rafael', 'Sabrina', 'Thiago', 'Vanessa', 'Wagner', 'Yasmin', 'André', 'Beatriz', 'Caio', 'Daniela', 'Elias', 'Flávia', 'Gustavo', 'Isabela', 'João', 'Kamila', 'Leonardo', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Raquel', 'Samuel', 'Tatiana', 'Lucas', 'Amanda', 'Felipe', 'Carolina', 'Rodrigo', 'Patrícia', 'Ricardo', 'Renata'];
const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Lima', 'Pereira', 'Ferreira', 'Rodrigues', 'Alves', 'Nascimento', 'Araújo', 'Carvalho', 'Ribeiro', 'Barbosa', 'Martins', 'Rocha', 'Gomes', 'Mendes', 'Cardoso', 'Monteiro', 'Teixeira', 'Castro'];

const cargosPorDepto = {
  'TI': ['Desenvolvedor', 'Analista de Sistemas', 'Especialista em Cloud', 'Coordenador de TI', 'Engenheiro de Software'],
  'Marketing': ['Designer', 'Analista de Marketing', 'Social Media', 'Consultor de SEO', 'Especialista em UX'],
  'RH': ['Analista de RH', 'Recrutador', 'Gerente de Gente', 'Assistente de RH'],
  'Financeiro': ['Analista Financeiro', 'Contador', 'Diretor Financeiro'],
  'Vendas': ['Consultor de Vendas', 'Supervisor de Vendas'],
  'Operações': ['Coordenador de Operações', 'Analista de Processos']
};

const skillsPorCargo = {
  'Desenvolvedor': ['React', 'JavaScript', 'TypeScript', 'Node.js', 'SQL'],
  'Analista de Sistemas': ['Java', 'Spring Boot', 'SQL', 'NoSQL'],
  'Especialista em Cloud': ['AWS', 'Docker', 'Kubernetes', 'Python'],
  'Designer': ['Design UI/UX', 'Figma', 'React', 'CSS'],
  'Gerente': ['Gestão de Projetos', 'Liderança', 'Análise de Dados'],
  'Analista': ['Análise de Dados', 'SQL', 'Python', 'Excel'],
  'Financeiro': ['Excel', 'ERP', 'Análise de Dados'],
  'Marketing': ['Análise de Dados', 'SEO', 'Copywriting']
};

const nomesProjetos = [
  'Expansão Cloud 2026', 'App Mobile Vendas', 'Portal de Transparência', 
  'IA de Recomendação', 'Reestruturação RH', 'Dashboard Executivo', 
  'Migração DB Legacy', 'E-learning Interno', 'API de Pagamentos', 
  'Redesign Identidade'
];

const departamentos = Object.keys(cargosPorDepto);

function gerarNome() {
  return `${primeiroNomes[Math.floor(Math.random() * primeiroNomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
}

function gerarSalario(cargo) {
  let base = 4000;
  if (cargo.includes('Coordenador') || cargo.includes('Gerente')) base = 8000;
  if (cargo.includes('Diretor')) base = 15000;
  if (cargo.includes('Assistente')) base = 2500;
  return base + Math.floor(Math.random() * 5000);
}

function criarFuncionario() {
  const depto = departamentos[Math.floor(Math.random() * departamentos.length)];
  const cargo = cargosPorDepto[depto][Math.floor(Math.random() * cargosPorDepto[depto].length)];
  const poolSkills = skillsPorCargo[cargo] || skillsPorCargo[cargo.split(' ')[0]] || ['Gestão de Projetos', 'Liderança'];
  const competencias = [...poolSkills].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2));

  return {
    nome: gerarNome(),
    cargo: cargo,
    departamento: depto,
    salario: gerarSalario(cargo),
    dataAdmissao: `20${18 + Math.floor(Math.random() * 8)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    competencias: competencias,
    cargaHorariaMax: 40
  };
}

// Lógica de geração de projetos dinâmicos
function criarProjeto(id) {
  const nome = nomesProjetos[id % nomesProjetos.length];
  const allSkills = Object.values(skillsPorCargo).flat();
  const uniqueSkills = [...new Set(allSkills)];
  
  const requisitos = [];
  const numReqs = 2 + Math.floor(Math.random() * 2);
  const skillsSorteio = uniqueSkills.sort(() => 0.5 - Math.random());

  for (let j = 0; j < numReqs; j++) {
    let competencia = skillsSorteio[j];
    
    // Skill inexistente no modo stress
    if (IS_STRESS && Math.random() > 0.8) {
      competencia = 'Computação Quântica';
    }

    requisitos.push({
      competencia,
      quantidade: IS_STRESS ? 3 : 1 + Math.floor(Math.random() * 2),
      esforço_por_pessoa: 10 + Math.floor(Math.random() * 3) * 10
    });
  }

  return {
    id: id + 1,
    nome: IS_STRESS ? `[CRÍTICO] ${nome}` : `${nome} - Turma ${Math.floor(id / 10) + 1}`,
    descricao: `Projeto dinâmico focado em ${nome.toLowerCase()}.`,
    status: Math.random() > 0.5 ? 'Em Planejamento' : 'Iniciado',
    requisitos
  };
}

async function enviarParaApi(endpoint, data, numero) {
  try {
    const response = await fetch(`${API_URL.replace('/funcionarios', '')}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    return { success: true, id: result.id, numero };
  } catch (error) {
    return { success: false, error: error.message, numero };
  }
}

async function popularApi() {
  console.log(`\n🚀 Iniciando população dinâmica para: ${API_URL}\n`);

  // 1. Criar Funcionários (Foco principal da API atual)
  let sucessosFunc = 0;
  for (let i = 0; i < 300; i += 15) {
    const batch = Array.from({length: 15}, () => enviarParaApi('/funcionarios', criarFuncionario(), i));
    const results = await Promise.all(batch);
    sucessosFunc += results.filter(r => r.success).length;
    process.stdout.write(`Funcionários: ${i + 15}/300...\r`);
    await new Promise(r => setTimeout(r, 50));
  }
  console.log(`\n✅ ${sucessosFunc} Funcionários criados.`);

  // 2. Criar Projetos (Caso a API suporte futuramente ou para simulação)
  console.log(`\nNota: Gerando 10 projetos dinâmicos (Simulação)...`);
  for (let i = 0; i < 10; i++) {
    const proj = criarProjeto(i);
    // Tenta enviar para /projetos, mas não falha o script se o endpoint não existir
    await enviarParaApi('/projetos', proj, i).catch(() => {});
  }
  
  console.log(`\n🎉 População concluída com dados contextualizados!`);
}

console.log('Verificando API...');
fetch(API_URL).then(r => r.ok ? popularApi() : console.error('API Indisponível')).catch(e => console.error('Erro:', e.message));
