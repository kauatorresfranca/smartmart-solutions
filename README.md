🛒 SmartMart Solutions - Fullstack Challenge
Este projeto é uma plataforma completa para cadastro, visualização e análise de produtos e vendas. A solução integra um backend robusto em Django com uma interface moderna em React.

📂 Estrutura do Repositório
/backend: API REST desenvolvida com Django REST Framework.

/frontend: Interface do usuário desenvolvida com React e Vite.

/data: Arquivos CSV utilizados para a carga inicial de dados.

🚀 Como Executar o Projeto
1. Backend (Django)
Bash

cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py import_data  # Popula o banco com os CSVs
python manage.py runserver
2. Frontend (React)
Bash

cd frontend
npm install
npm run dev
🛠️ Funcionalidades Implementadas
Importação de Dados: Script customizado para leitura e tratamento de arquivos CSV.

API REST: Endpoints para CRUD de produtos e vendas usando Function-Based Views.

Análise de Dados: Endpoint especializado em métricas de faturamento e performance.

Interface Responsiva: Visualização clara de tabelas e indicadores (a ser finalizado).

📡 Endpoints Principais
GET/POST /api/products/: Gerenciamento de produtos.

GET/POST /api/sales/: Gerenciamento de vendas.

GET /api/analysis/: Dashboard de métricas.