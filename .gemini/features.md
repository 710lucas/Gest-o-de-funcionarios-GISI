# Project Features

## Implemented
- **Dashboard (`/`):** Summary cards (total employees, departments, payroll, average salary), charts, and top 10 salary ranking.
- **Employee Registration (`/cadastrar`):** Form to add new employees with validation and skills.
- **Employee Listing (`/funcionarios`):** Searchable table with skills management via modal.
- **Gestão de Projetos e Capacidade (`/projetos`):** **(New)** Full management of projects, requirement definitions, and resource allocation. Inclui busca por funcionário alocado e alertas de sobrecarga com sugestão de troca automática.
- **Matching & Gap Analysis:** Automatic suggestion of employees for projects based on skills and workload. Identification of hiring needs. Sugestão inteligente de substitutos para funcionários sobrecarregados.
- **Cenários Analíticos (Stress Testing):** **(New)** Geração de dados sintéticos para simular sobrecarga de pessoal, ociosidade e lacunas de competência (skills que ninguém possui).
- **Configuration (`/configuracoes`):** Toggle between LocalStorage and API, configure API URL, and trigger stress scenarios.
- **CSV Import/Export:** Support for data portability.
- **AI Chat:** Interactive chat component for AI-assisted queries.

## Pending / Future
- Real-time notifications for overallocated employees.
- Advanced project timeline (Gantt chart).
- User authentication levels.
