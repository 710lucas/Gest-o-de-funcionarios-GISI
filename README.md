# 🚀 GISI - Sistema de Gestão de Talentos e Recursos Inteligente

O **GISI** (Gestão Integrada de Sistemas de Informação) é um ERP moderno para gestão de capital humano e planejamento de recursos (ERM). Desenvolvido com React + Vite, o sistema evoluiu de um simples CRUD para uma plataforma de inteligência de dados robusta, integrando Inteligência Artificial para análise preditiva, alocação estratégica e automação de relatórios.

![Dashboard Preview](https://img.shields.io/badge/UI-Premium_Executive-0f172a?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Estável_/_Completo-10b981?style=for-the-badge)

---

## 🌟 Pilares do Sistema

### 📊 1. Inteligência de Analytics
Transformamos dados brutos em decisões estratégicas. O painel de Analytics monitora a saúde operacional da empresa em tempo real:
*   **Ocupação por Competência:** Gráficos interativos com identificação de zonas críticas (>80% de uso) e ociosas (<30%).
*   **Recomendações de Gestão:** A IA analisa a carga horária e sugere automaticamente contratações ou realocações.
*   **Saúde da Equipe:** Monitoramento de stress e sobrecarga de profissionais com visualização de barras de calor.

### 🤖 2. Assistente de Dados IA
Um copiloto integrado que entende o seu banco de dados:
*   **Consultas Dinâmicas:** Pergunte qualquer coisa (ex: "Qual departamento é mais caro?") e receba gráficos e interpretações textuais automáticas.
*   **Geração de Relatórios:** Criação de relatórios executivos mensais em PDF com análise de tendências, diversidade de cargos e custos.
*   **Draft de Vagas:** Identifica Gaps de Skill nos projetos e gera descrições de vagas completas prontas para publicação.

### 🏗️ 3. Gestão de Projetos e Alocação
Planejamento de recursos de ponta a ponta:
*   **Requisitos Dinâmicos:** Definição de skills necessárias e esforço semanal por projeto.
*   **Smart Swapping:** Sugestão inteligente de substitutos para profissionais sobrecarregados.
*   **Timeline e Gaps:** Visualização clara de onde faltam profissionais para atingir os objetivos do projeto.

---

## 🛠️ Tecnologias

*   **Frontend:** React 18, Vite, Recharts (Visualização de Dados).
*   **UI/UX:** Design System customizado (Modern Dark/Light), Lucide Icons, Framer Motion (Transições).
*   **IA:** Integração nativa com Google Gemini, OpenAI e Custom Proxies.
*   **Exportação:** jspdf + html2canvas para relatórios profissionais.
*   **Persistência:** Suporte dual para LocalStorage (Auto-migração) e API REST Spring Boot.

---

## 🚀 Como Iniciar

1.  **Clonar e Instalar:**
    ```bash
    git clone https://github.com/710lucas/Gest-o-de-funcionarios-GISI.git
    cd gestao-funcionarios
    npm install
    ```

2.  **Executar:**
    ```bash
    npm run dev
    ```

3.  **Configurar IA (Opcional, mas recomendado):**
    *   Vá em **Configurações** no menu lateral.
    *   Insira sua **Google Gemini Key** ou **OpenAI Key**.
    *   O sistema passará a gerar insights automáticos no Dashboard e Relatórios.

---

## 📂 Estrutura do Projeto

*   `src/pages`: Telas principais (Dashboard, Projetos, Analytics, SkillGaps, Relatórios).
*   `src/components`: Componentes premium (AIChat, Modais, Navbars customizadas).
*   `src/services`: Motores de inteligência (`ai.js`) e integração de dados (`api.js`).
*   `.gemini/`: Documentação de arquitetura, histórico de sprints e decisões técnicas (ADR).

---

## ⚙️ Modos de Operação

### Modo Local (Padrão)
Os dados são armazenados no `localStorage`. Ao iniciar pela primeira vez, o sistema gera automaticamente **80 profissionais** e **15 projetos** para demonstração de analytics. Você pode resetar este estado a qualquer momento nas configurações.

### Modo API Externa
Conecta o sistema a um backend Java Spring Boot. 
*   Consulte [API_CONFIG.md](API_CONFIG.md) para especificações de endpoints e DTOs.
*   Scripts para população em massa da API estão disponíveis na raiz (`populate-api.js`).

---

## 📈 Cenários de Stress
Nas configurações, você pode ativar o **"Modo Stress"**. O sistema gerará um cenário onde 30% da equipe está sobrecarregada e existem múltiplos projetos com Gaps de Skill, permitindo testar as ferramentas de realocação e geração de vagas da IA.

---

**Desenvolvido com foco em escalabilidade e tomada de decisão orientada a dados.** 🚀
