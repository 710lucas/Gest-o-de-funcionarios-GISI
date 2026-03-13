# Documentacao Tecnica do Codigo

Este documento descreve a implementacao do aplicativo **Gestao de Funcionarios**, desenvolvido em React com Vite.

## 1. Visao Geral

O sistema e um CRUD de funcionarios com dois modos de persistencia:

- `LocalStorage` (padrao)
- `API REST externa` (configuravel na pagina de configuracoes)

A aplicacao e composta por:

- Roteamento com `react-router-dom`
- Camada de servico unica em `src/services/api.js`
- Paginas em `src/pages`
- Componentes reutilizaveis em `src/components`
- Visualizacoes graficas no Dashboard com `recharts`
- Importacao/exportacao CSV com `papaparse`

## 2. Stack e Dependencias Principais

Arquivo de referencia: `package.json`

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
    Config.jsx
  services/
    api.js
```

## 4. Ponto de Entrada e Roteamento

### `src/main.jsx`

- Importa estilos globais (`index.css`)
- Renderiza `<App />` dentro de `StrictMode`

### `src/App.jsx`

Configura o roteamento principal:

- `/` -> `Dashboard`
- `/cadastrar` -> `Cadastro`
- `/funcionarios` -> `ListaFuncionarios`
- `/configuracoes` -> `Config`

A `Navbar` e exibida em todas as rotas.

## 5. Camada de Dados (Service)

Arquivo principal: `src/services/api.js`

### 5.1 Chaves e configuracao

- `DB_KEY = "funcionarios_db"`: dados locais
- `CONFIG_KEY = "api_config"`: configuracao do modo de dados
- `CSV_PATH = "/banco.csv"`: declarado, mas nao utilizado na versao atual

Configuracao padrao retornada por `getConfig()`:

```js
{ useApi: false, apiUrl: 'http://localhost:8080/funcionarios' }
```

### 5.2 Formato interno x formato da API

O frontend usa:

- `data_admissao`

A API usa:

- `dataAdmissao`

Conversao implementada por:

- `toApiFormat(funcionario)`
- `fromApiFormat(funcionario)`

Isso permite manter o contrato interno do front estavel, mesmo com nomenclatura diferente no backend.

### 5.3 Operacoes CRUD

Objeto exportado: `api`

- `init()`
  - Se `useApi = true`: nao inicializa local
  - Se `useApi = false`: inicializa `localStorage` com 50 funcionarios gerados em `generateDefaultData()`
- `getAll()`
  - API: `GET /`
  - Local: le `localStorage`
- `create(funcionario)`
  - API: `POST /`
  - Local: gera ID incremental e persiste
- `update(id, funcionario)`
  - API: `PUT /{id}`
  - Local: atualiza item por `id`
- `delete(id)`
  - API: `DELETE /{id}`
  - Local: remove item por `id`

### 5.4 Utilitarios de dados

- `exportCsv()`
  - Busca os dados atuais com `getAll()`
  - Converte para CSV com `Papa.unparse`
  - Dispara download de `funcionarios_atualizado.csv`

- `importData(novosDados)`
  - Valida estrutura minima (`nome`, `cargo`)
  - Salva no `localStorage`

- `clearDatabase()`
  - Disponivel apenas em LocalStorage
  - Em modo API exibe alerta e retorna `false`

- `resetToDefault()`
  - Disponivel apenas em LocalStorage
  - Regenera os 50 funcionarios padrao

## 6. Toggle entre API e LocalStorage

O aplicativo permite alternar dinamicamente a fonte de dados entre `LocalStorage` e `API REST` sem alterar o codigo das paginas.

Como funciona tecnicamente:

- A configuracao fica em `localStorage` na chave `api_config`.
- O campo `useApi` define o modo atual.
- A URL da API fica em `apiUrl`.
- Todas as paginas usam a mesma interface (`api.getAll`, `api.create`, `api.update`, `api.delete`).
- O service (`src/services/api.js`) roteia internamente para requisicao HTTP ou `localStorage`.

Onde o toggle e feito na interface:

- Pagina `src/pages/Config.jsx`
- Acao `Usar LocalStorage`
- Acao `Usar API Externa`
- Botao para salvar URL da API

Fluxo de troca:

1. Usuario escolhe o modo na tela de configuracoes.
2. A aplicacao salva `useApi` e `apiUrl`.
3. A pagina recarrega.
4. As proximas operacoes CRUD passam a usar a fonte selecionada.

### 6.1 Vantagens e desvantagens do LocalStorage

Vantagens:

- Simples de usar e configurar
- Funciona offline
- Nao depende de backend ativo
- Ideal para testes locais e demos

Desvantagens:

- Dados ficam apenas no navegador/dispositivo
- Nao ha compartilhamento entre usuarios
- Limite de armazenamento do navegador
- Pode ser apagado ao limpar dados do navegador
- Menor controle de seguranca e auditoria

### 6.2 Vantagens e desvantagens da API

Vantagens:

- Dados centralizados e compartilhados
- Persistencia real em servidor/banco
- Melhor para multiusuario
- Permite regras de negocio e validacoes no backend
- Facilita integracoes futuras

Desvantagens:

- Depende de conectividade de rede
- Exige backend em execucao
- Requer tratamento de erros de comunicacao
- Introduz custo de infraestrutura/manutencao

### 6.3 Repositorio da API

Repositorio informado:

- `https://github.com/710lucas/api-gestao-funcionarios`

Recomendacao de uso:

- Use `LocalStorage` para desenvolvimento rapido, prototipacao e demonstracoes.
- Use `API` para cenarios reais com dados persistentes e multiplos usuarios.

## 7. Paginas

### `src/pages/Dashboard.jsx`

Responsabilidades:

- Inicializar dados (`api.init()`)
- Carregar funcionarios e calcular indicadores
- Filtrar por departamento
- Importar CSV para substituir base atual
- Exportar CSV atualizado
- Exibir graficos e ranking salarial

Indicadores calculados:

- Total de funcionarios
- Quantidade de departamentos
- Folha salarial
- Media salarial

Conjuntos para graficos:

- Funcionarios por departamento (barra)
- Distribuicao de cargos (pizza)
- Faixas salariais (area)
- Folha por departamento (linha)
- Top 10 maiores salarios (tabela)

### `src/pages/Cadastro.jsx`

- Formulario de cadastro
- Validacoes obrigatorias (`nome`, `cargo`, `salario`)
- Envio via `api.create(formData)`
- Redirecionamento para `/funcionarios` apos sucesso

### `src/pages/ListaFuncionarios.jsx`

- Carrega funcionarios com `api.getAll()`
- Busca local por nome ou cargo
- Estados de carregamento e erro
- Abre `FuncionarioModal` para visualizar/editar/excluir

Fluxos:

- Salvar alteracoes: `api.update(...)` + recarga da lista
- Excluir: `api.delete(...)` + recarga da lista

### `src/pages/Config.jsx`

Gerencia comportamento de persistencia:

- Alterar modo entre LocalStorage e API
- Salvar URL da API
- Resetar base para dados padrao
- Limpar toda base

Observacao importante:

- Acoes de limpar/resetar nao funcionam no modo API (bloqueadas por regra no service)

## 8. Componentes

### `src/components/Navbar.jsx`

- Navbar responsiva
- Desktop: barra superior com links de texto
- Mobile: barra fixa inferior com icones (`lucide-react`)
- Estado ativo baseado em `useLocation()`

### `src/components/FuncionarioModal.jsx`

- Modal de detalhes de funcionario
- Modo visualizacao e modo edicao
- Campos controlados por estado local (`formData`)
- Callback para salvar (`onSave`) e excluir (`onDelete`)
- Fecha ao clicar no overlay fora do conteudo

## 9. Estilos e Responsividade

Arquivo: `src/index.css`

Pontos principais:

- Variaveis CSS globais (`:root`) para cores
- Estilos compartilhados para `container`, `card`, `btn`, `form`, `table`, `modal`
- Media query para `max-width: 768px`
- Ajustes mobile:
  - espacamentos reduzidos
  - tipografia menor
  - ocultacao de colunas da tabela
  - botoes em largura total

## 10. Fluxo de Dados Resumido

1. Usuario interage com pagina/componente.
2. Pagina chama metodos de `api`.
3. `api` decide destino:
   - `localStorage` (modo local)
   - requisicoes HTTP (modo API)
4. Dados retornam para a pagina.
5. Estado React e atualizado e a UI re-renderiza.

## 11. Convencoes de Dados

Objeto de funcionario usado no frontend:

```js
{
  id,
  nome,
  cargo,
  departamento,
  salario,
  data_admissao
}
```

No modo API, ha conversao automatica para `dataAdmissao` no envio/recebimento.

## 12. Pontos de Atencao Tecnica

- `CSV_PATH` esta declarado em `api.js`, mas nao e utilizado atualmente.
- O app utiliza `window.alert` e `window.confirm` para feedback e confirmacao.
- Ha logs de depuracao (`console.log`) em alguns fluxos de lista/modal e requisicoes API.
- No modo local, os IDs sao incrementais; no import CSV, podem ser gerados por `Date.now()` quando ausentes.

## 13. Arquivos de Referencia

- `src/services/api.js`: regra de negocio e persistencia
- `src/pages/Dashboard.jsx`: estatisticas, graficos, import/export
- `src/pages/ListaFuncionarios.jsx`: listagem, busca, modal
- `src/pages/Cadastro.jsx`: criacao de funcionario
- `src/pages/Config.jsx`: troca de fonte de dados e manutencao
- `src/components/FuncionarioModal.jsx`: edicao/exclusao
- `src/components/Navbar.jsx`: navegacao responsiva
- `src/index.css`: estilos globais e responsividade
