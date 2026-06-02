# Documentacao Tecnica do Codigo

Este documento descreve a implementacao do aplicativo **Gestao de Funcionarios**, desenvolvido em React com Vite.

## 1. Visao Geral

O sistema e um CRUD de funcionarios com dois modos de persistencia (LocalStorage e API REST) e um modulo avançado de **Gestão de Capacidade e Projetos**.

A aplicacao e composta por:

- Roteamento com `react-router-dom`
- Camada de servico em `src/services/api.js` (Funcionários, Projetos e Alocações)
- Paginas em `src/pages` (incluindo o novo módulo de Projetos)
- Componentes reutilizaveis em `src/components`
- Visualizacoes graficas no Dashboard com `recharts`
- Planejamento de recursos com Matching de competências

## 2. Stack e Dependencias Principais

- `react`, `react-dom`: UI
- `vite`: build e servidor de desenvolvimento
- `react-router-dom`: navegacao entre paginas
- `papaparse`: leitura e escrita de CSV
- `recharts`: graficos do dashboard
- `lucide-react`: icones

## 3. Estrutura de Pastas

```txt
src/
  App.jsx
  main.jsx
  index.css
  components/
    Navbar.jsx
    FuncionarioModal.jsx
  pages/
    Dashboard.jsx
    Cadastro.jsx
    ListaFuncionarios.jsx
    Projetos.jsx
    Config.jsx
  services/
    api.js
```

## 4. Camada de Dados (Service)

Arquivo principal: `src/services/api.js`

### 4.1 Entidades Suportadas

- **Funcionários (`DB_KEY`):** Cadastro básico acrescido de `competencias` (array) e `carga_horaria_max`.
- **Projetos (`PROJETOS_KEY`):** `id`, `nome`, `descricao`, `status` e `requisitos` (vagas com competência e esforço).
- **Alocações (`ALOCACOES_KEY`):** Vincula `funcionarioId` a `projetoId` especificando a `competencia` e o `esforco` (horas).

### 4.2 Lógica de Matching

O sistema utiliza as `competencias` cadastradas nos funcionários para sugerir alocações em projetos que possuam `requisitos` técnicos similares.

## 5. Paginas Principais

### `src/pages/Projetos.jsx` (Novo)

Responsável pelo planejamento de capacidade:
- Cadastro e edição de projetos.
- Definição de requisitos (quais skills e quantas pessoas).
- **Matching:** Sugestão de funcionários baseada em competências e disponibilidade de horas.
- **Gap Analysis:** Identificação visual de vagas não preenchidas ou falta de especialistas no quadro atual.
- **Visão de Esforço:** Barra de progresso comparando esforço estimado vs. alocado.

### `src/pages/Dashboard.jsx`

Exibe indicadores gerais, agora incluindo métricas de projetos e alocações.

## 6. Componentes

### `src/components/FuncionarioModal.jsx` (Atualizado)

Agora permite a gestão de competências do funcionário através de um sistema de tags e a definição de sua carga horária máxima semanal.

## 7. Estilos e Responsividade

O arquivo `index.css` foi expandido para suportar:
- `form-grid`: Layouts de formulários em duas colunas.
- `skill-tag`: Estilização de etiquetas de competências.
- `status-badge`: Indicadores coloridos para status de projetos.
- `gap-indicator`: Alertas visuais para falta de recursos.

## 8. Fluxo de Planejamento

1. Cadastrar competências no perfil do Funcionário.
2. Criar um Projeto e definir seus requisitos técnicos.
3. O sistema sugere funcionários aptos (Matching).
4. O gestor aloca o funcionário, e o sistema abate a carga horária da disponibilidade do mesmo.
5. Gaps são sinalizados para indicar necessidade de novas contratações ou realocações.
