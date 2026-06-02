# Project Features

## Implemented
- **Dashboard (`/`):** Summary cards (total employees, departments, payroll, average salary), charts, and top 10 salary ranking.
- **Employee Registration (`/cadastrar`):** Form to add new employees with validation and skills.
- **Employee Listing (`/funcionarios`):** Searchable table with skills management via modal.
- **Gestão de Projetos e Capacidade (`/projetos`):** Full management of projects, requirement definitions, and resource allocation. Inclui busca por funcionário alocado e alertas de sobrecarga com sugestão de troca automática.
- **Skill Gaps (`/skill-gaps`):** **(New)** Dedicated page to view projects lacking resources. Includes AI integration to automatically generate job postings and export them as PDFs.
- **Matching & Gap Analysis:** Automatic suggestion of employees for projects based on skills and workload. Identification of hiring needs. Sugestão inteligente de substitutos para funcionários sobrecarregados.
- **Cenários Analíticos (Stress Testing):** Geração de dados sintéticos para simular sobrecarga de pessoal, ociosidade e lacunas de competência (skills que ninguém possui).
- **Configuration (`/configuracoes`):** Toggle between LocalStorage and API, configure API URL, and trigger stress scenarios.
- **CSV Import/Export:** Support for data portability.
- **AI Assistant (Dashboard):** Chat interativo que analisa dados reais para gerar insights e visualizações automáticas (Gráficos Recharts). Recuperado e robustecido para garantir consistência estrutural e suporte a análises temporais (data de admissão).

## Pending / Future
- Real-time notifications for overallocated employees.
- Advanced project timeline (Gantt chart).
- User authentication levels.
