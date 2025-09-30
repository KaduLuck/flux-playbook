# Sistema de Gestão de Projetos Gamificado

## Visão Geral

Esta atualização adiciona um novo modo de visualização de projetos gamificados ao sistema Flux Business. Baseado no arquivo `modelo-base.json`, o sistema agora permite importar estruturas de projeto com tarefas interconectadas, gamificação e fluxos não-lineares.

## Funcionalidades

### 1. Importação de JSON
- Importe arquivos JSON seguindo o formato do `modelo-base.json`
- Sistema de arrastar e soltar para facilitar a importação
- Validação automática dos dados importados

### 2. Quadro de Projetos Gamificado
- Visualização em colunas baseadas no status inicial das tarefas
- Cards com informações detalhadas:
  - Título e descrição
  - Prioridade (Baixa, Média, Alta)
  - Categoria (Estruturação, Marketing, etc.)
  - Pontos de XP
  - ID único
  - Próximas tarefas liberadas

### 3. Fluxo de Nodes
- Visualização gráfica das conexões entre tarefas
- Setas indicando o fluxo de dependências
- Layout responsivo para diferentes tamanhos de tela

### 4. Gamificação
- Sistema de pontos XP para cada tarefa
- Progresso visual baseado na conclusão de tarefas
- Estrutura para integração futura com o sistema de níveis existente

## Estrutura do Arquivo JSON

O arquivo JSON deve seguir esta estrutura:

```json
{
  "__instrucoes": "Instruções para preenchimento",
  "cards": [
    {
      "id": "1",
      "titulo": "Título da tarefa",
      "descricao": "Descrição detalhada",
      "status_inicial": "Backlog", // ou "Em andamento", "Concluído"
      "prioridade": "Alta", // ou "Média", "Baixa"
      "xp": 20, // Opcional, pontos de experiência
      "categoria": "Estruturação",
      "proximos": ["2", "3"] // IDs das próximas tarefas liberadas
    }
  ]
}
```

## Como Usar

1. **Acesse o modo "Projeto Gamificado"**:
   - Faça login no sistema
   - No dashboard, clique no botão "Projeto Gamificado"

2. **Importe um arquivo JSON**:
   - Arraste e solte um arquivo JSON na área indicada
   - Ou clique para selecionar um arquivo do seu computador

3. **Visualize o projeto**:
   - Veja as tarefas organizadas por status
   - Clique em qualquer card para ver detalhes
   - Mude o status das tarefas conforme for progredindo

4. **Navegue pelo fluxo**:
   - Cada card mostra suas conexões com outras tarefas
   - As setas indicam o fluxo de dependências

## Integrações

### Com o Sistema Existente
- Compartilha a mesma autenticação
- Utiliza os mesmos componentes de UI
- Pode ser alternado com as visualizações Kanban e Fluxo de Tarefas

### Gamificação
- Os pontos XP de cada tarefa contribuem para o sistema de níveis existente
- As conquistas podem ser baseadas na conclusão de tarefas específicas

## Desenvolvimento

### Componentes Novos
1. `useProjectData.ts` - Hook para gerenciar os dados do projeto
2. `ProjectBoard.tsx` - Componente do quadro de projetos
3. `JsonImport.tsx` - Componente para importação de arquivos JSON

### Modificações
1. `Dashboard.tsx` - Adicionado botão e visualização para o modo de projeto
2. `NodeFlow.tsx` - Atualizado para suportar visualização de dados do projeto

## Próximos Passos

1. **Edição de Cards**:
   - Permitir edição dos campos dos cards diretamente na interface
   - Adicionar formulário de edição

2. **Criação de Novos Cards**:
   - Interface para adicionar novas tarefas ao projeto
   - Validação de IDs únicos

3. **Conexões Dinâmicas**:
   - Permitir criar e remover conexões entre tarefas
   - Interface visual para gerenciar fluxos

4. **Persistência de Dados**:
   - Salvar projetos no banco de dados
   - Carregar projetos salvos automaticamente

5. **Integração com Gamificação**:
   - Conectar pontos XP ao sistema de níveis existente
   - Adicionar conquistas baseadas em categorias e progresso