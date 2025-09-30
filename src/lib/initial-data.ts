
// src/lib/initial-data.ts

// Dados iniciais dos cartões baseados no plano de negócio
// Esta é a estrutura que simula a resposta da IA
export const initialCardsData = [
    {
      title: "Definir Marca e Nome",
      description: "Escolher nome comercial (ex.: Igor Tech Solutions), logo simples no Canva.",
      priority: 'high',
      points: 20,
      service_type: 'both',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Criar Catálogo de Serviços",
      description: "Listar serviços físicos (formatação, upgrades) e digitais (social media, edição vídeos) com preços iniciais.",
      priority: 'high',
      points: 30,
      service_type: 'both',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Montar Canais de Contato",
      description: "Criar WhatsApp Business, Instagram, Linktree com links para serviços.",
      priority: 'medium',
      points: 15,
      service_type: 'digital',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Primeiros Pacotes Presenciais",
      description: "Formatação + SSD + Backup (combo), limpeza + pasta térmica.",
      priority: 'high',
      points: 50,
      service_type: 'physical',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Primeiros Pacotes Digitais",
      description: "Pacote Social Media Básico (4 posts/semana), edição de vídeos curtos.",
      priority: 'high',
      points: 50,
      service_type: 'digital',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Criar Automação Interna",
      description: "No N8N: leads do site → WhatsApp; orçamentos automáticos.",
      priority: 'medium',
      points: 40,
      service_type: 'digital',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Rodar Primeiro Anúncio Local",
      description: "Investir R$5–10/dia para impulsionar serviços em Salvador.",
      priority: 'medium',
      points: 25,
      service_type: 'digital',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Fechar Primeiro Contrato Mensal",
      description: "Pacote manutenção preventiva + suporte remoto ou social media.",
      priority: 'high',
      points: 60,
      service_type: 'both',
      progress: 0,
      estimated_value: 0,
    },
    {
      title: "Pacote Tech + Automação",
      description: "Oferecer combo (manutenção + automação de leads + social media) para microempresas.",
      priority: 'high',
      points: 80,
      service_type: 'both',
      progress: 0,
      estimated_value: 0,
    },
];

// Definição das colunas padrão do quadro Kanban
export const defaultColumns = [
  { name: 'Backlog', color: '#FF6B6B' },
  { name: 'Em andamento', color: '#FFD166' },
  { name: 'Concluído', color: '#06D6A0' },
];
