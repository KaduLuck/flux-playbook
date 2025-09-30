import { useState, useEffect } from "react";
import { LogOut, User, Settings, GitGraph, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import GameStats from './GameStats';
import KanbanBoard from './KanbanBoard';
import NodeFlow from './NodeFlow';
import ProjectBoard from './ProjectBoard';
import JsonImport from './JsonImport';
import { useProjectData } from '@/hooks/useProjectData';
import { ProjectData } from '@/hooks/useProjectData';

const Dashboard = () => {
  const { user, signOut, profile } = useAuth();
  const { projectData, loadProjectData } = useProjectData();
  const [activeView, setActiveView] = useState<'kanban' | 'node' | 'project'>('kanban');
  const [showImport, setShowImport] = useState(false);

  // Load initial project data from the modelo-base.json file
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // In a real implementation, we would load from the actual file
        // For now, we'll use a hardcoded version of the data
        const initialData: ProjectData = {
          "__instrucoes": "Preencha 'cards' com suas tarefas. 'id' é único. 'status_inicial' pode ser Backlog, Em andamento, Concluído. 'proximos' são os IDs dos próximos cards liberados. 'xp' é opcional para gamificação. 'categoria' serve para filtros.",
          "cards": [
            {
              "id": "1",
              "titulo": "Definir Marca e Nome",
              "descricao": "Escolher nome comercial (ex.: Igor Tech Solutions), logo simples no Canva.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 20,
              "categoria": "Estruturação",
              "proximos": ["2","3"]
            },
            {
              "id": "2",
              "titulo": "Criar Catálogo de Serviços",
              "descricao": "Listar serviços físicos (formatação, upgrades) e digitais (social media, edição vídeos) com preços iniciais.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 30,
              "categoria": "Estruturação",
              "proximos": ["4"]
            },
            {
              "id": "3",
              "titulo": "Montar Canais de Contato",
              "descricao": "Criar WhatsApp Business, Instagram, Linktree com links para serviços.",
              "status_inicial": "Backlog",
              "prioridade": "Média",
              "xp": 15,
              "categoria": "Marketing",
              "proximos": ["4"]
            },
            {
              "id": "4",
              "titulo": "Primeiros Pacotes Presenciais",
              "descricao": "Formatação + SSD + Backup (combo), limpeza + pasta térmica.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 50,
              "categoria": "Serviços Presenciais",
              "proximos": ["5"]
            },
            {
              "id": "5",
              "titulo": "Primeiros Pacotes Digitais",
              "descricao": "Pacote Social Media Básico (4 posts/semana), edição de vídeos curtos.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 50,
              "categoria": "Serviços Digitais",
              "proximos": ["6"]
            },
            {
              "id": "6",
              "titulo": "Criar Automação Interna",
              "descricao": "No N8N: leads do site → WhatsApp; orçamentos automáticos.",
              "status_inicial": "Backlog",
              "prioridade": "Média",
              "xp": 40,
              "categoria": "Automação",
              "proximos": ["7","8"]
            },
            {
              "id": "7",
              "titulo": "Rodar Primeiro Anúncio Local",
              "descricao": "Investir R$5–10/dia para impulsionar serviços em Salvador.",
              "status_inicial": "Backlog",
              "prioridade": "Média",
              "xp": 25,
              "categoria": "Marketing",
              "proximos": ["9"]
            },
            {
              "id": "8",
              "titulo": "Fechar Primeiro Contrato Mensal",
              "descricao": "Pacote manutenção preventiva + suporte remoto ou social media.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 60,
              "categoria": "Operação",
              "proximos": ["9"]
            },
            {
              "id": "9",
              "titulo": "Pacote Tech + Automação",
              "descricao": "Oferecer combo (manutenção + automação de leads + social media) para microempresas.",
              "status_inicial": "Backlog",
              "prioridade": "Alta",
              "xp": 80,
              "categoria": "Expansão",
              "proximos": []
            }
          ]
        };
        
        loadProjectData(initialData);
      } catch (error) {
        console.error("Failed to load initial project data:", error);
        setShowImport(true);
      }
    };

    if (!projectData) {
      loadInitialData();
    }
  }, [projectData, loadProjectData]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Flux Business</h1>
              <p className="text-sm text-muted-foreground">
                Olá, {profile?.name || user?.email}! 👋
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Game Stats */}
        <GameStats />
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={activeView === 'kanban' ? 'default' : 'outline'}
            onClick={() => setActiveView('kanban')}
          >
            <Table className="w-4 h-4 mr-2" />
            Kanban
          </Button>
          <Button
            variant={activeView === 'node' ? 'default' : 'outline'}
            onClick={() => setActiveView('node')}
          >
            <GitGraph className="w-4 h-4 mr-2" />
            Fluxo de Tarefas
          </Button>
          <Button
            variant={activeView === 'project' ? 'default' : 'outline'}
            onClick={() => setActiveView('project')}
          >
            <GitGraph className="w-4 h-4 mr-2" />
            Projeto Gamificado
          </Button>
        </div>

        {/* Content based on active view */}
        {activeView === 'kanban' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestão de Projetos</h2>
            </div>
            <KanbanBoard />
          </div>
        ) : activeView === 'node' ? (
          <NodeFlow />
        ) : (
          <div className="space-y-6">
            {showImport || !projectData ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Importar Projeto</h2>
                  <p className="text-muted-foreground">
                    Importe um arquivo JSON para começar a gerenciar seu projeto gamificado
                  </p>
                </div>
                <JsonImport />
                <div className="text-center">
                  <Button variant="link" onClick={() => setShowImport(false)}>
                    Pular importação e usar projeto padrão
                  </Button>
                </div>
              </div>
            ) : (
              <ProjectBoard />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;