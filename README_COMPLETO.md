# Sistema de Gestão de Negócios - Flux Business

## Visão Geral

O Flux Business é um sistema de gestão de negócios completo que permite organizar, acompanhar e aplicar o planejamento do seu negócio físico e digital. Baseado no arquivo [Contexto.txt](file:///c%3A/Users/Administrator/Desktop/Negocio/flux-playbook-main/Contexto.txt), o sistema foi desenvolvido para atender às necessidades específicas de empreendedores que desejam estruturar seus serviços de manutenção técnica (física) e serviços digitais (edição de vídeo, social media, automação) com uma abordagem gamificada e visual.

## Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React + TypeScript
- **Backend**: Supabase (BaaS - Backend as a Service)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL via Supabase
- **Gerenciamento de Estado**: React Query
- **UI Components**: shadcn/ui + Tailwind CSS
- **Gamificação**: Sistema de pontos, níveis e conquistas

### Estrutura de Dados

O sistema utiliza as seguintes tabelas no banco de dados:

1. **profiles** - Informações do usuário e estatísticas de jogo
2. **columns** - Colunas do Kanban (Backlog, Em Progresso, Concluído, Ideias Futuras)
3. **cards** - Cards/tarefas com detalhes como título, descrição, prioridade, etc.
4. **checklist_items** - Itens de checklist para cada card
5. **card_connections** - Conexões entre cards para o fluxo de nodes
6. **achievements** - Conquistas/badges disponíveis
7. **user_achievements** - Conquistas ganhas pelos usuários

### Campos Importantes nos Cards
- **title**: Título da tarefa
- **description**: Descrição detalhada
- **priority**: Prioridade (baixa, média, alta, urgente)
- **progress**: Progresso em porcentagem
- **due_date**: Data de entrega
- **points**: Pontos de XP
- **service_type**: Tipo de serviço (físico, digital, ambos)
- **estimated_value**: Valor estimado em R$
- **status**: Status da tarefa (pendente, em progresso, concluído, bloqueado)

## Funcionalidades Principais

### 1. Sistema Kanban
Visualização em colunas estilo Trello com as seguintes colunas:
- **Backlog**: Tarefas planejadas para o futuro
- **Em Progresso**: Tarefas atualmente em execução
- **Concluído**: Tarefas finalizadas
- **Ideias Futuras**: Ideias e sugestões para implementação futura

Cada card contém:
- Título e descrição
- Checklist de itens
- Prioridade (baixa, média, alta, urgente)
- Data de entrega
- Status
- Progresso (barra %)
- Tipo de serviço (físico/digital/híbrido)
- Valor estimado em R$

### 2. Sistema de Nodes (Fluxo de Tarefas)
Visualização gráfica das tarefas conectadas, permitindo:
- Conexão entre tarefas relacionadas
- Fluxos não lineares e ramificados
- Visualização de dependências
- Avanço automático ou manual entre nós

### 3. Gamificação
Sistema completo de gamificação com:
- **Pontos de XP**: Ganhe pontos ao concluir tarefas
- **Níveis**: Suba de nível conforme acumula XP
- **Conquistas/Badges**: Desbloqueie conquistas especiais
- **Progresso Visual**: Barra de progresso para o próximo nível

Conquistas disponíveis:
- Primeiro Passo (50 pts): Complete sua primeira tarefa
- Produtivo (200 pts): Complete 10 tarefas
- Mestre (500 pts): Complete 50 tarefas
- Especialista Físico (300 pts): Complete 5 serviços físicos
- Guru Digital (400 pts): Complete 10 serviços digitais
- Milionário em Pontos (1000 pts): Acumule 1000 pontos

### 4. Tipos de Serviços
O sistema suporta três tipos de serviços:
- **Físico (🔧)**: Serviços de manutenção, upgrades e reparos em Salvador e região metropolitana
- **Digital (💻)**: Serviços de edição de vídeo, social media, automação com n8n em nível local/nacional
- **Híbrido (⚡)**: Serviços que combinam ambos os tipos

## Interface do Usuário

### Dashboard Principal
- Informações do usuário e nível atual
- Estatísticas de jogo (XP, nível, pontos, conquistas)
- Alternância entre visualização Kanban e Fluxo de Tarefas
- Botão de saída

### Tela de Tarefas (Kanban)
- Visualização em colunas das tarefas
- Cards com informações detalhadas
- Botões para criar novas tarefas em cada coluna
- Indicadores visuais de prioridade e tipo de serviço

### Modal de Tarefas
- Formulário completo para criação/edição de tarefas
- Campos para título, descrição, prioridade, tipo de serviço
- Slider para pontos de XP e progresso
- Input para valor estimado e data de entrega
- Seleção de coluna
- Botões para salvar, cancelar e excluir

## Implementação Técnica

### Componentes Principais
1. **AuthPage.tsx**: Tela de autenticação (login/registro)
2. **Dashboard.tsx**: Painel principal com navegação entre vistas
3. **GameStats.tsx**: Exibição de estatísticas de jogo
4. **KanbanBoard.tsx**: Visualização Kanban das tarefas
5. **TaskDialog.tsx**: Modal para criação/edição de tarefas
6. **NodeFlow.tsx**: Visualização gráfica do fluxo de tarefas (a ser implementado)
7. **GameStats.tsx**: Exibição de estatísticas de jogo

### Hooks Customizados
1. **useAuth.ts**: Gerenciamento de autenticação e perfil do usuário
2. **useCards.ts**: Gerenciamento de cards/tarefas
3. **useGameification.ts**: Sistema de gamificação
4. **useNodeFlow.ts**: Gerenciamento do fluxo de nodes (a ser implementado)

### Tipos e Interfaces
Definidos no arquivo [types/index.ts](file:///c%3A/Users/Administrator/Desktop/Negocio/flux-playbook-main/src/types/index.ts):
- Profile
- Column
- Card
- ChecklistItem
- CardConnection
- Achievement
- UserAchievement
- CreateCardData
- UpdateCardData

## Como Usar o Sistema

### 1. Autenticação
- Acesse o sistema com email e senha
- O sistema criará automaticamente seu perfil e colunas padrão

### 2. Criando Tarefas
- Clique no botão "+" em qualquer coluna do Kanban
- Preencha as informações da tarefa:
  - Título (obrigatório)
  - Descrição (opcional)
  - Prioridade
  - Tipo de serviço (físico/digital/híbrido)
  - Pontos de XP
  - Valor estimado
  - Data de entrega
- Selecione a coluna apropriada
- Clique em "Criar Tarefa"

### 3. Gerenciando Tarefas
- Clique em qualquer card para editá-lo
- Arraste cards entre colunas para atualizar seu status
- Use o slider de progresso para indicar andamento
- Complete tarefas para ganhar XP e subir de nível

### 4. Acompanhando Progresso
- Verifique seu nível e XP no card superior
- Acompanhe conquistas desbloqueadas
- Monitore pontos totais acumulados
- Veja o progresso para o próximo nível

## Configuração e Desenvolvimento

### Pré-requisitos
- Node.js (versão compatível com npm)
- npm ou yarn
- Conta no Supabase

### Instalação
```bash
# Clone o repositório
git clone <seu-repositorio>

# Navegue até o diretório do projeto
cd flux-playbook-main

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/ (componentes base)
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── GameStats.tsx
│   ├── KanbanBoard.tsx
│   ├── TaskDialog.tsx
│   └── NodeFlow.tsx (a ser implementado)
├── hooks/
│   ├── useAuth.ts
│   ├── useCards.ts
│   ├── useGameification.ts
│   └── useNodeFlow.ts (a ser implementado)
├── types/
│   └── index.ts
├── integrations/supabase/
│   ├── client.ts
│   └── types.ts
└── pages/
    ├── Index.tsx
    └── NotFound.tsx
```

### Banco de Dados
O sistema utiliza o Supabase como backend, com as seguintes tabelas principais:

1. **profiles**: Armazena informações do usuário e estatísticas de jogo
2. **columns**: Colunas do Kanban com posição e cor
3. **cards**: Tarefas/cards com todos os detalhes
4. **checklist_items**: Itens de checklist para cada card
5. **card_connections**: Conexões entre cards para o fluxo de nodes
6. **achievements**: Conquistas disponíveis no sistema
7. **user_achievements**: Conquistas desbloqueadas pelos usuários

## Funcionalidades Futuras Planejadas

### 1. Sistema de Nodes Avançado
- Implementação completa do componente NodeFlow
- Conexão visual entre tarefas
- Fluxos ramificados e condicionais
- Avanço automático entre nós conectados

### 2. Relatórios e Analytics
- Gráficos de produtividade
- Relatórios financeiros
- Análise de desempenho por tipo de serviço
- Histórico de tarefas concluídas

### 3. Integração com n8n
- Conexão direta com workflows do n8n
- Automação de tarefas repetitivas
- Sincronização de dados entre sistemas

### 4. Sistema de Notificações
- Alertas para datas de entrega
- Lembretes de tarefas pendentes
- Notificações de conquistas desbloqueadas

## Considerações Finais

O Flux Business foi desenvolvido especificamente para atender às necessidades descritas no [Contexto.txt](file:///c%3A/Users/Administrator/Desktop/Negocio/flux-playbook-main/Contexto.txt), proporcionando uma solução completa para empreendedores que desejam estruturar seus negócios de forma eficiente e gamificada. O sistema combina a praticidade de um Kanban com a visualização poderosa de fluxos de tarefas conectadas, tudo isso com um sistema de gamificação que motiva a produtividade contínua.

Com este sistema, você poderá:
- Organizar seus serviços físicos e digitais de forma eficiente
- Acompanhar seu progresso com métricas visuais
- Ganhar motivação através da gamificação
- Visualizar dependências e fluxos de trabalho complexos
- Planejar e executar suas atividades de forma estruturada

O sistema está pronto para ser expandido com funcionalidades adicionais conforme suas necessidades evoluem.