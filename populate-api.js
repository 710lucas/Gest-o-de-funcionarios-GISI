#!/usr/bin/env node

/**
 * Script para popular a API com 300 funcionários
 * 
 * Uso:
 *   node populate-api.js [URL_DA_API]
 * 
 * Exemplo:
 *   node populate-api.js http://localhost:8080/funcionarios
 */

const API_URL = process.argv[2] || 'http://localhost:8080/funcionarios';

// Dados para gerar funcionários aleatórios
const nomes = [
  'Ana Silva', 'Bruno Costa', 'Carlos Santos', 'Diana Oliveira', 'Eduardo Lima',
  'Fernanda Souza', 'Gabriel Alves', 'Helena Rodrigues', 'Igor Pereira', 'Juliana Martins',
  'Kevin Ferreira', 'Larissa Ribeiro', 'Marcos Carvalho', 'Natalia Gomes', 'Otávio Mendes',
  'Paula Araújo', 'Rafael Barros', 'Sabrina Dias', 'Thiago Monteiro', 'Vanessa Cardoso',
  'Wagner Teixeira', 'Yasmin Correia', 'André Barbosa', 'Beatriz Castro', 'Caio Pinto',
  'Daniela Rocha', 'Elias Freitas', 'Flávia Moreira', 'Gustavo Ramos', 'Isabela Cunha',
  'João Nascimento', 'Kamila Nunes', 'Leonardo Pires', 'Mariana Campos', 'Nicolas Viana',
  'Olivia Azevedo', 'Pedro Duarte', 'Raquel Moura', 'Samuel Batista', 'Tatiana Melo',
  'Ulisses Macedo', 'Vitória Rezende', 'William Lopes', 'Ximena Farias', 'Yuri Tavares',
  'Zilda Medeiros', 'Alberto Fonseca', 'Bruna Guimarães', 'Cristiano Sales', 'Débora Xavier',
  'Emanuel Cardoso', 'Fátima Nogueira', 'Gilberto Miranda', 'Hélio Santana', 'Íris Campos',
  'Jonas Ferreira', 'Karina Monteiro', 'Lucas Andrade', 'Mônica Pires', 'Nelson Rocha',
  'Olga Nascimento', 'Paulo Almeida', 'Queila Ribeiro', 'Rodrigo Teixeira', 'Silvia Barros',
  'Túlio Pereira', 'Ursula Costa', 'Vitor Dias', 'Wanda Oliveira', 'Xavier Santos',
  'Yasmin Silva', 'Zeca Lima', 'Alice Gomes', 'Bernardo Souza', 'Cecília Martins',
  'Diego Araújo', 'Elaine Santos', 'Felipe Rodrigues', 'Glória Mendes', 'Hugo Carvalho',
  'Ígor Lima', 'Joana Freitas', 'Klaus Ramos', 'Luana Cunha', 'Márcio Nunes',
  'Nina Viana', 'Oscar Azevedo', 'Priscila Duarte', 'Quirino Moura', 'Roberta Batista',
  'Sérgio Melo', 'Teresa Macedo', 'Ubiratan Rezende', 'Valéria Lopes', 'Wesley Farias',
  'Xuxa Tavares', 'Yago Medeiros', 'Zuleica Fonseca', 'Adriano Guimarães', 'Bianca Sales'
];

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Lima', 'Pereira', 'Ferreira',
  'Rodrigues', 'Alves', 'Nascimento', 'Araújo', 'Carvalho', 'Ribeiro', 'Barbosa',
  'Martins', 'Rocha', 'Gomes', 'Mendes', 'Cardoso', 'Monteiro', 'Teixeira', 'Castro',
  'Pinto', 'Dias', 'Moreira', 'Ramos', 'Campos', 'Nunes', 'Pires', 'Freitas',
  'Cunha', 'Viana', 'Azevedo', 'Duarte', 'Moura', 'Batista', 'Melo', 'Barros',
  'Andrade', 'Nogueira', 'Miranda', 'Santana', 'Almeida', 'Lopes', 'Correia', 'Xavier'
];

const primeiroNomes = [
  'Ana', 'Bruno', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena',
  'Igor', 'Juliana', 'Kevin', 'Larissa', 'Marcos', 'Natalia', 'Otávio', 'Paula',
  'Rafael', 'Sabrina', 'Thiago', 'Vanessa', 'Wagner', 'Yasmin', 'André', 'Beatriz',
  'Caio', 'Daniela', 'Elias', 'Flávia', 'Gustavo', 'Isabela', 'João', 'Kamila',
  'Leonardo', 'Mariana', 'Nicolas', 'Olivia', 'Pedro', 'Raquel', 'Samuel', 'Tatiana',
  'Lucas', 'Amanda', 'Felipe', 'Carolina', 'Rodrigo', 'Patrícia', 'Ricardo', 'Renata',
  'Marcelo', 'Camila', 'Alexandre', 'Juliana', 'André', 'Fernanda', 'Diego', 'Priscila'
];

const cargos = [
  'Desenvolvedor Junior', 'Desenvolvedor Pleno', 'Desenvolvedor Senior',
  'Designer Junior', 'Designer Pleno', 'Designer Senior',
  'Gerente de Projetos', 'Gerente de TI', 'Gerente Comercial',
  'Analista de Sistemas', 'Analista de Dados', 'Analista Financeiro',
  'Coordenador de TI', 'Coordenador de Marketing', 'Coordenador de Vendas',
  'Assistente Administrativo', 'Assistente de RH', 'Assistente Financeiro',
  'Supervisor de Vendas', 'Supervisor de Operações', 'Supervisor de Produção',
  'Diretor de TI', 'Diretor Financeiro', 'Diretor Comercial',
  'Especialista em SEO', 'Especialista em UX', 'Especialista em Segurança',
  'Consultor de Negócios', 'Consultor de TI', 'Consultor Financeiro',
  'Engenheiro de Software', 'Engenheiro de Dados', 'Engenheiro DevOps',
  'Product Owner', 'Scrum Master', 'Analista de Qualidade',
  'Técnico de Suporte', 'Técnico de Infraestrutura', 'Arquiteto de Software'
];

const departamentos = [
  'TI', 'Marketing', 'Vendas', 'RH', 'Financeiro', 
  'Operações', 'Jurídico', 'Compras', 'Produção', 
  'Logística', 'Qualidade', 'Administrativo'
];

// Função para gerar nome aleatório
function gerarNome() {
  const primeiro = primeiroNomes[Math.floor(Math.random() * primeiroNomes.length)];
  const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  return `${primeiro} ${sobrenome}`;
}

// Função para gerar data aleatória entre 2018 e 2025
function gerarDataAdmissao() {
  const ano = 2018 + Math.floor(Math.random() * 8); // 2018-2025
  const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Função para gerar salário baseado no cargo
function gerarSalario(cargo) {
  if (cargo.includes('Junior')) {
    return 2500 + Math.floor(Math.random() * 2500); // 2500-5000
  } else if (cargo.includes('Pleno')) {
    return 5000 + Math.floor(Math.random() * 3000); // 5000-8000
  } else if (cargo.includes('Senior')) {
    return 7000 + Math.floor(Math.random() * 5000); // 7000-12000
  } else if (cargo.includes('Diretor')) {
    return 15000 + Math.floor(Math.random() * 10000); // 15000-25000
  } else if (cargo.includes('Gerente') || cargo.includes('Coordenador')) {
    return 8000 + Math.floor(Math.random() * 7000); // 8000-15000
  } else if (cargo.includes('Especialista') || cargo.includes('Consultor')) {
    return 6000 + Math.floor(Math.random() * 6000); // 6000-12000
  } else if (cargo.includes('Assistente') || cargo.includes('Técnico')) {
    return 2000 + Math.floor(Math.random() * 3000); // 2000-5000
  } else {
    return 4000 + Math.floor(Math.random() * 4000); // 4000-8000
  }
}

// Função para criar um funcionário
function criarFuncionario(index) {
  const cargo = cargos[Math.floor(Math.random() * cargos.length)];
  
  return {
    nome: gerarNome(),
    cargo: cargo,
    departamento: departamentos[Math.floor(Math.random() * departamentos.length)],
    salario: gerarSalario(cargo),
    dataAdmissao: gerarDataAdmissao()
  };
}

// Função para fazer requisição POST
async function criarFuncionarioNaApi(funcionario, numero) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(funcionario)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return { success: true, id: data.id, numero };
  } catch (error) {
    return { success: false, error: error.message, numero };
  }
}

// Função para criar funcionários em lotes
async function popularApi() {
  console.log('='.repeat(60));
  console.log('  Script de População da API');
  console.log('='.repeat(60));
  console.log(`\nURL da API: ${API_URL}`);
  console.log('\nGerando 300 funcionários...\n');

  // Gerar todos os funcionários
  const funcionarios = [];
  for (let i = 1; i <= 300; i++) {
    funcionarios.push(criarFuncionario(i));
  }

  console.log('✓ 300 funcionários gerados!');
  console.log('\nIniciando envio para a API...\n');

  const batchSize = 10; // Enviar 10 por vez
  let sucessos = 0;
  let falhas = 0;

  // Processar em lotes
  for (let i = 0; i < funcionarios.length; i += batchSize) {
    const batch = funcionarios.slice(i, i + batchSize);
    const promises = batch.map((func, idx) => 
      criarFuncionarioNaApi(func, i + idx + 1)
    );

    const results = await Promise.all(promises);

    results.forEach(result => {
      if (result.success) {
        sucessos++;
        process.stdout.write(`✓ ${result.numero}/300 (ID: ${result.id})\r`);
      } else {
        falhas++;
        console.log(`\n✗ Falha no funcionário ${result.numero}: ${result.error}`);
      }
    });

    // Pequeno delay entre lotes para não sobrecarregar a API
    if (i + batchSize < funcionarios.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n\n' + '='.repeat(60));
  console.log('  Resultado Final');
  console.log('='.repeat(60));
  console.log(`\n✓ Sucessos: ${sucessos}`);
  console.log(`✗ Falhas: ${falhas}`);
  console.log(`\nTotal: ${sucessos + falhas}/300`);
  
  if (sucessos === 300) {
    console.log('\n🎉 Todos os funcionários foram criados com sucesso!');
  } else if (sucessos > 0) {
    console.log('\n⚠️  Alguns funcionários não foram criados.');
  } else {
    console.log('\n❌ Falha ao criar funcionários. Verifique se a API está rodando.');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// Executar
console.log('\nVerificando conexão com a API...\n');

fetch(API_URL)
  .then(response => {
    if (response.ok) {
      console.log('✓ Conexão estabelecida!\n');
      return popularApi();
    } else {
      throw new Error(`Não foi possível conectar à API (HTTP ${response.status})`);
    }
  })
  .catch(error => {
    console.error('❌ Erro de conexão:', error.message);
    console.log('\nVerifique se:');
    console.log('  1. A API está rodando');
    console.log('  2. A URL está correta:', API_URL);
    console.log('  3. O CORS está configurado no backend\n');
    process.exit(1);
  });
