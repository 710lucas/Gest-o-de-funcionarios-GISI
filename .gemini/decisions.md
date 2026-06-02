# Decision Log

## Format
Each decision follows this structure:

---
### [YYYY-MM-DD] Title
**Status:** Proposed | Accepted | Deprecated  
**Context:** Why this decision was needed  
**Decision:** What was decided  
**Alternatives considered:** What was rejected and why  
**Consequences:** What this implies going forward  

---

## Log

---
### [2026-06-02] Robustez na Execução de Scripts de IA e Padronização de Prompt
**Status:** Accepted  
**Context:** O Assistente de IA do Dashboard falhava intermitentemente em renderizar gráficos devido a respostas malformadas ou scripts (queryScript) que não retornavam explicitamente um objeto, além da falta de campos contextuais como `data_admissao`.  
**Decision:** 
1. Implementar um invólucro (wrapper) automático no `new Function` para injetar `return` se a IA omitir.
2. Tornar o prompt do sistema explícito sobre os campos obrigatórios em `charts`.
3. Adicionar lógica defensiva no componente `AIChat.jsx` para evitar quebras por datasets nulos.
**Alternatives considered:** 
- *Hardcoding de queries:* Rejeitado por limitar a flexibilidade da IA.
- *Uso exclusivo de ferramentas (Function Calling):* Considerado promissor, mas exigiria refatoração maior; a melhoria no prompt e execução é uma solução imediata eficaz.
**Consequences:** Melhora a taxa de sucesso da IA em gerar visualizações úteis e facilita o diagnóstico de erros através de mensagens específicas na interface.

---