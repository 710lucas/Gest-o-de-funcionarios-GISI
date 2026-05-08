import { api } from './api';

export const aiService = {
  async query(userPrompt) {
    const config = api.getAIConfig();
    if (!config.apiKey && config.provider !== 'proxy') {
      throw new Error('API Key não configurada');
    }

    const allData = await api.getAll();
    const dataSchema = {
      entidade: 'funcionario',
      campos: ['id', 'nome', 'cargo', 'departamento', 'salario', 'data_admissao']
    };

    const systemPrompt = `
      Você é um assistente de análise de dados para um sistema de gestão de funcionários.
      O banco de dados possui a seguinte estrutura: ${JSON.stringify(dataSchema)}.
      
      Sua tarefa é responder a perguntas do usuário gerando um plano de execução em JSON.
      O plano deve conter:
      1. "entities": lista de entidades afetadas (neste caso, sempre ['funcionario']).
      2. "queryScript": um script JavaScript (função anônima) que recebe um array 'data' e retorna os dados filtrados/agrupados necessários para o gráfico.
      3. "chartConfig": configuração do gráfico para Recharts. Deve incluir:
         - "type": 'bar', 'line', 'pie', ou 'area'.
         - "xAxis": o campo para o eixo X.
         - "dataKey": o campo para os valores.
         - "title": título do gráfico.
      4. "explanation": breve explicação do que será feito.

      Exemplo de resposta para "Crescimento de funcionários nos últimos 3 anos":
      {
        "entities": ["funcionario"],
        "queryScript": "const years = [2023, 2024, 2025]; return years.map(y => ({ year: y, count: data.filter(f => f.data_admissao.startsWith(y.toString())).length }))",
        "chartConfig": {
          "type": "line",
          "xAxis": "year",
          "dataKey": "count",
          "title": "Crescimento de Funcionários (Últimos 3 Anos)"
        },
        "explanation": "Vou agrupar os funcionários por ano de admissão para os últimos 3 anos."
      }

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
    let chartData = [];
    try {
      const executeQuery = new Function('data', aiResult.queryScript);
      chartData = executeQuery(allData);
    } catch (e) {
      console.error('Erro ao executar queryScript da IA:', e);
      throw new Error('A IA gerou um script de consulta inválido.');
    }

    // Gerar interpretação final
    const interpretationPrompt = `
      Com base nos dados abaixo retornados para a consulta "${userPrompt}":
      ${JSON.stringify(chartData)}
      
      Gere um pequeno texto interpretando esses resultados para o usuário.
    `;

    const finalInterpretation = await this.callAIForText(config, interpretationPrompt);

    return {
      ...aiResult,
      chartData,
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
  }
};
