# Coding & Workflow Conventions

## Sprint Flow Workflow
1. Todas as novas demandas devem passar por uma triagem.
2. Ao receber uma nova demanda, verificamos:
   - Já está na Sprint atual (`.gemini/current_sprint.md`)? Se sim, segue-se a ordem de implementação.
   - Se não, a demanda deve ser adicionada ao Backlog (`.gemini/sprint_backlog.md`), indicando uma previsão de em qual sprint será alocada (podendo mudar conforme urgência).
3. O arquivo `current_sprint.md` deve conter:
   - Checkmarks (`- [ ]`) para controle de conclusão.
   - Título da tarefa.
   - Descrição clara da tarefa.
   - Condição de Aceite (Acceptance Criteria).
4. **Fechamento da Sprint:**
   - No fim da Sprint, é OBRIGATÓRIO executar o processo de build (ex: `npm run build`) para verificar se o código não quebrou.
   - Quaisquer novas funcionalidades, arquiteturas ou decisões tomadas durante a Sprint devem ser documentadas nos arquivos apropriados (`.gemini/features.md`, `DOCUMENTACAO_CODIGO.md`, etc.).

## Naming & Styling
- Componentes React: PascalCase (ex: `ListaFuncionarios.jsx`)
- Variáveis/Funções: camelCase (ex: `calculaSalario`)
- CSS: Classes em kebab-case, preferencialmente usando Vanilla CSS.
- Dados API vs Frontend:
  - Frontend usa snake_case internamente (ex: `data_admissao`).
  - Backend usa camelCase na API (ex: `dataAdmissao`).
  - A camada de serviço em `api.js` deve lidar com as conversões.
