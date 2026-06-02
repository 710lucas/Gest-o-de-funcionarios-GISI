import { api } from './api';

export const aiService = {
  async query(userPrompt) {
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      throw new Error('API Key não configurada');
    }

    const [allData, projects, allocations] = await Promise.all([
      api.getAll(),
      api.getAllProjetos(),
      api.getAllAlocacoes()
    ]);

    const dataSchema = {
      funcionarios: ['id', 'nome', 'cargo', 'departamento', 'salario', 'competencias', 'carga_horaria_max'],
      projetos: ['id', 'nome', 'descricao', 'status', 'requisitos'],
      alocacoes: ['funcionarioId', 'projetoId', 'competencia', 'esforco']
    };

    const systemPrompt = `
      Você é um assistente de análise de dados para um sistema de planejamento de recursos (ERM).
      O banco de dados possui as seguintes entidades: ${JSON.stringify(dataSchema)}.
      
      Sua tarefa é responder a perguntas do usuário gerando um plano de execução em JSON.
      O plano deve conter:
      1. "entities": lista de entidades afetadas (ex: ['funcionarios', 'projetos']).
      2. "queryScript": um script JavaScript (função anônima) que recebe um objeto 'context' contendo { funcionarios, projetos, alocacoes } e retorna um objeto contendo os datasets necessários para os gráficos. 
         Exemplo: { data1: [...], data2: [...] }
      3. "charts": lista de configurações de gráficos para Recharts.
      4. "explanation": breve explicação do que será feito.

      Regras de Negócio:
      - Carga Horária: Cada funcionário tem um 'carga_horaria_max' (geralmente 40h).
      - Ocupação: A soma do 'esforco' nas 'alocacoes' de um funcionário define seu uso atual.
      - Gaps: Se um projeto tem um requisito de skill e não há alocações suficientes, existe um GAP.

      IMPORTANTE: Retorne APENAS o JSON.
    `;

    let response;
    if (config.provider === 'gemini') {
      response = await this.callGemini(config, systemPrompt, userPrompt);
    } else if (config.provider === 'openai') {
      response = await this.callOpenAI(config, systemPrompt, userPrompt);
    } else if (config.provider === 'proxy') {
      response = await this.callProxy(config, systemPrompt, userPrompt);
    } else {
      throw new Error('Provedor de IA não suportado');
    }

    const aiResult = JSON.parse(response);
    
    // Executar o script gerado
    let datasets = {};
    try {
      const executeQuery = new Function('context', aiResult.queryScript);
      datasets = executeQuery({ funcionarios: allData, projetos: projects, alocacoes: allocations });
    } catch (e) {
      console.error('Erro ao executar queryScript da IA:', e);
      throw new Error('A IA gerou um script de consulta inválido.');
    }

    // Gerar interpretação final com base em todos os dados
    const interpretationPrompt = `
      Com base nos dados abaixo retornados para a consulta "${userPrompt}":
      ${JSON.stringify(datasets)}
      
      Gere um pequeno texto interpretando esses resultados para o usuário.
    `;

    const finalInterpretation = await this.callAIForText(config, interpretationPrompt);

    return {
      ...aiResult,
      datasets,
      finalInterpretation
    };
  },

  async callGemini(config, systemPrompt, userPrompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${systemPrompt}\n\nUsuário: ${userPrompt}` }]
        }]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.candidates || data.candidates.length === 0) {
      console.error('Resposta do Gemini sem candidatos:', data);
      throw new Error('A IA não retornou uma resposta válida. Verifique se o conteúdo não foi bloqueado.');
    }
    let text = data.candidates[0].content.parts[0].text;
    // Limpar markdown se houver
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return text;
  },

  async callOpenAI(config, systemPrompt, userPrompt) {
    const url = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    if (!data.choices || data.choices.length === 0) {
      throw new Error('A OpenAI não retornou uma resposta válida.');
    }
    let text = data.choices[0].message.content;
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return text;
  },

  async callProxy(config, systemPrompt, userPrompt) {
    if (!config.baseUrl) throw new Error('URL do Proxy não configurada');
    const response = await fetch(config.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt, model: config.model })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.response;
  },

  async callAIForText(config, prompt) {
    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates || data.candidates.length === 0) {
        return 'Não foi possível gerar uma interpretação para estes dados.';
      }
      return data.candidates[0].content.parts[0].text;
    } else if (config.provider === 'openai') {
      const url = config.baseUrl || 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.choices || data.choices.length === 0) {
        return 'Não foi possível gerar uma interpretação para estes dados.';
      }
      return data.choices[0].message.content;
    } else if (config.provider === 'proxy') {
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: config.model })
      });
      const data = await response.json();
      return data.response || 'Sem resposta do proxy.';
    }
    return '';
  },

  async callAI(config, systemPrompt, userPrompt) {
    if (config.provider === 'gemini') {
      return await this.callGemini(config, systemPrompt, userPrompt);
    } else if (config.provider === 'openai') {
      return await this.callOpenAI(config, systemPrompt, userPrompt);
    } else if (config.provider === 'proxy') {
      return await this.callProxy(config, systemPrompt, userPrompt);
    }
    throw new Error('Provedor de IA não suportado');
  },

  async generateReport(userPrompt) {
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      throw new Error('API Key não configurada');
    }

    const [allData, projects, allocations] = await Promise.all([
      api.getAll(),
      api.getAllProjetos(),
      api.getAllAlocacoes()
    ]);

    const dataSchema = {
      funcionarios: ['id', 'nome', 'cargo', 'departamento', 'salario', 'competencias', 'carga_horaria_max'],
      projetos: ['id', 'nome', 'descricao', 'status', 'requisitos'],
      alocacoes: ['funcionarioId', 'projetoId', 'competencia', 'esforco']
    };

    const finalPrompt = userPrompt && userPrompt.trim() !== '' ? userPrompt : "Gere um relatório mensal padrão cobrindo panorama de pessoas, diversidade de cargos, análise salarial e ocupação de projetos.";

    const systemPrompt = `
      Você é um Desenvolvedor Sênior e Analista de Dados. Gere o plano de um RELATÓRIO EXECUTIVO FORMAL.
      Banco de dados (Objeto 'context'): ${JSON.stringify(dataSchema)}.
      Objetivo: "${finalPrompt}"

      RETORNE APENAS UM JSON NO FORMATO:
      {
        "reportTitle": "Título Formal",
        "period": "Referência Temporal",
        "queryScript": "CÓDIGO JS VÁLIDO. Recebe 'context' { funcionarios, projetos, alocacoes }. Deve retornar um objeto com os datasets mapeados.",
        "sections": [
          {
            "id": "s1",
            "title": "Título da Seção",
            "type": "chart", // 'chart' para gráficos ou 'cards' para métricas
            "chartConfig": { // Obrigatório se type for 'chart'
              "type": "bar", // bar, line, pie, area
              "xAxis": "campo_x",
              "dataKey": "valor",
              "datasetName": "nome_no_objeto_de_retorno"
            },
            "metrics": [ // Obrigatório se type for 'cards'
              { "label": "Título", "dataKey": "chave", "datasetName": "nome_no_objeto_de_retorno" }
            ],
            "insightPrompt": "Comando curto para análise destes dados."
          }
        ]
      }

      REGRAS CRÍTICAS DE ENGENHARIA:
      1. SINTAXE JS: O 'queryScript' deve ser executável. NUNCA use espaços em nomes de variáveis (ex: use 'cargosUnicos' em vez de 'cargos Unicos').
      2. FOCO EM GRÁFICOS: Para relatórios detalhados, priorize seções do tipo 'chart' para visualização de tendências e distribuições.
      3. RETORNO DO SCRIPT: O script deve terminar com 'return { chave1: dado1, chave2: dado2 };'.
      4. MAPEAMENTO: Garanta que 'datasetName' em cada seção corresponda exatamente a uma chave no objeto retornado pelo script.
    `;

    const reportPlanRaw = await this.callAI(config, systemPrompt, "");
    
    // Extração robusta de JSON (ignora textos extras e markdown)
    const jsonMatch = reportPlanRaw.match(/\{[\s\S]*\}/);
    const reportPlan = JSON.parse(jsonMatch ? jsonMatch[0] : reportPlanRaw);

    // 2. Executar QueryScript
    let datasets = {};
    try {
      const executeQuery = new Function('context', `
        ${reportPlan.queryScript.includes('return') ? reportPlan.queryScript : 'return ' + reportPlan.queryScript}
      `);
      datasets = executeQuery({ funcionarios: allData, projetos: projects, alocacoes: allocations });
    } catch (e) {
      console.error('Erro ao executar queryScript da IA:', e);
      throw new Error('A IA gerou um script de consulta inválido.');
    }

    // 3. Obter Insights (textos) para cada seção
    for (let section of reportPlan.sections) {
      const sectionData = datasets[section.id] || datasets[section.chartConfig?.datasetName] || datasets[section.metrics?.[0]?.datasetName];
      
      const promptInsight = `
        Atuando como analista executivo, gere um texto explicativo e objetivo (1 a 2 parágrafos).
        Contexto: ${section.insightPrompt}
        Dados encontrados: ${JSON.stringify(sectionData)}
      `;

      section.insight = await this.callAIForText(config, promptInsight);
    }

    return {
      ...reportPlan,
      datasets
    };
  },

  async generateJobPosting({ skill, projeto, senioridade, salario, beneficios }) {
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      throw new Error('API Key não configurada');
    }

    const prompt = `
      Atue como um Tech Recruiter sênior. Escreva uma descrição de vaga de emprego atraente e profissional para a seguinte necessidade:
      
      - Cargo/Skill: Desenvolvedor(a) ${skill} (${senioridade})
      - Projeto: ${projeto.nome} (${projeto.descricao || 'Projeto confidencial'})
      - Salário/Faixa: ${salario || 'A combinar'}
      - Benefícios/Observações: ${beneficios || 'Benefícios padrão de mercado'}
      
      Estruture a vaga com:
      1. Título chamativo
      2. Sobre o projeto (breve resumo)
      3. Responsabilidades (o que a pessoa fará)
      4. Requisitos (além do ${skill})
      5. O que oferecemos (Salário e benefícios)
      
      Use um tom engajador e moderno. Retorne APENAS o texto da vaga em formato Markdown simples (use apenas ** para negrito, ### para títulos e * para listas). NÃO use emojis ou ícones especiais, pois eles quebram a exportação para PDF.
    `;

    return await this.callAIForText(config, prompt);
  }
};
