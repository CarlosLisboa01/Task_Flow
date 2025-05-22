# TaskFlow - Gerenciador de Tarefas

Um sistema completo de gerenciamento de tarefas com autenticação de usuários, criação e edição de tarefas, filtros, tipos personalizados e visualização em calendário.

## Características

- Autenticação completa (login, registro, logout)
- Dashboard de tarefas com filtros
- Criação e edição de tarefas
- Personalização de tipos de tarefas
- Visualização em calendário
- Interface responsiva e moderna

## Executando no GitHub Pages

Este projeto foi otimizado para ser facilmente implantado no GitHub Pages. Siga os passos abaixo:

1. Faça um fork deste repositório para sua conta GitHub
2. Ative o GitHub Pages:
   - Vá para Settings > Pages
   - Selecione a branch principal como source (main ou master)
   - Clique em Save

Seu aplicativo estará disponível em: `https://[seu-usuario].github.io/[nome-do-repositorio]/`

## Configuração do Banco de Dados

O sistema já está configurado para usar o Supabase como banco de dados. Por padrão, está configurado com as seguintes credenciais:

```
SUPABASE_URL: https://kvwsfagncbamiezjdlms.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2d3NmYWduY2JhbWllempkbG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDM5NzMsImV4cCI6MjA2MzMxOTk3M30.ly782UFmGElGyt9lcuPwJeczcDH9pDcKXf8K7HF9ULY
```

Para configurar seu próprio banco de dados:

1. Crie uma conta no [Supabase](https://supabase.com/)
2. Crie um novo projeto
3. Crie uma tabela chamada `tarefas` com a seguinte estrutura:
   - id (gerado automaticamente)
   - nome_da_tarefa (text)
   - status (text)
   - data_limite (date)
   - prioridade (text)
   - tipo_de_tarefa (text)
   - descricao (text)
   - nivel_de_esforco (text)
   - usuario_id (uuid, referência à tabela auth.users)
4. Configure as políticas de segurança apropriadas
5. Substitua as credenciais nos arquivos JavaScript

## Desenvolvimento Local

Para executar o projeto localmente:

1. Clone o repositório
2. Use qualquer servidor HTTP simples:
   ```
   # Com Python:
   python -m http.server 8000
   
   # Com Node.js:
   npx serve .
   ```
3. Acesse `http://localhost:8000` no navegador

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript (vanilla)
- Supabase para autenticação e banco de dados
- Bootstrap Icons para ícones 