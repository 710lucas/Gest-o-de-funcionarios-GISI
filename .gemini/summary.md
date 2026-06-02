# Project Summary

**Status:** In Development — Core features implemented

The project is a "Gestão de Funcionários" application. It is a React-based CRUD system with a dashboard for visualization and reporting.

## What Exists
- **Frontend:** React + Vite application with routing.
- **Dashboard:** Visual insights using Recharts (total employees, payroll, department distribution, etc.).
- **CRUD:** Full CRUD operations for employees (Create, Read, Update, Delete).
- **Dual Persistence:** Capability to switch between `LocalStorage` and an external REST API (Spring Boot).
- **Import/Export:** Support for importing and exporting data via CSV (PapaParse).
- **Reporting:** PDF generation support (jsPDF, html2canvas).
- **AI Chat:** An AI Chat component (AIChat.jsx) integrated with a service (ai.js).

## In Progress
- Refinement of the AI Chat integration.
- General UI/UX polish.

## Open Questions
- Specific AI provider configuration for `ai.js`.
- Deployment target for the frontend and backend.
