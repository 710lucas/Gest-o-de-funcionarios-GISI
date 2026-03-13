# Sistema de Gestão de Funcionários (Simples)

Este é um sistema CRUD simples desenvolvido em React para gestão de funcionários, utilizando um arquivo CSV local como "banco de dados".

## Estrutura do Projeto

O projeto segue uma estrutura organizada e modular:

- `src/services`: Contém a lógica de interação com o CSV e persistência local.
- `src/components`: Componentes reutilizáveis (Navbar, Modal).
- `src/pages`: As telas principais (Dashboard, Cadastro, Listagem).
- `src/index.css`: Estilos globais e componentes visuais.
- `public/banco.csv`: Arquivo CSV base usado para inicializar o sistema.

## Funcionalidades

1.  **Dashboard**: Visão geral com estatísticas (Total de funcionários, departamentos, folha salarial).
2.  **Cadastro**: Formulário para adicionar novos funcionários.
3.  **Gestão (Listagem)**: Tabela de funcionários com opções de visualização, edição e exclusão via Modal.
4.  **Exportar CSV**: Botão no Dashboard para baixar o banco de dados atualizado.

## Como Rodar

1.  No terminal, na pasta do projeto:
    ```bash
    npm install
    npm run dev
    ```

2.  Acesse a aplicação no navegador (geralmente em `http://localhost:5173`).

## Integração com API

O sistema suporta dois modos de operação:
- **LocalStorage** (padrão): Dados armazenados localmente no navegador
- **API Externa**: Conecta com uma API REST Spring Boot

### Configurando a API

1. Acesse a aba **Configurações** no menu
2. Digite a URL da sua API (ex: `http://localhost:8080/funcionarios`)
3. Clique em **"Salvar URL"**
4. Clique em **"Usar API Externa"** para ativar

### Populando a API com Dados de Teste

Dois scripts estão disponíveis para popular sua API com 300 funcionários:

**Opção 1: Node.js** (recomendado)
```bash
node populate-api.js http://localhost:8080/funcionarios
```

**Opção 2: Bash/Curl**
```bash
chmod +x populate-api.sh
./populate-api.sh http://localhost:8080/funcionarios
```

Ambos os scripts:
- Criam 300 funcionários com dados aleatórios
- Enviam em lotes de 10 para não sobrecarregar a API
- Mostram progresso em tempo real
- Geram salários compatíveis com os cargos

Para mais detalhes sobre a API, consulte o arquivo [API_CONFIG.md](API_CONFIG.md).

## Importante: Persistência de Dados

Como esta é uma aplicação puramente Frontend, **não é possível salvar alterações diretamente no arquivo `banco.csv` original no disco**.

**Solução:**
- O sistema lê o arquivo `banco.csv` na primeira execução.
- As alterações são salvas no armazenamento local do navegador (`localStorage`).
- Para salvar definitivo, use o botão **"Baixar CSV do Banco de Dados"** no Dashboard.
