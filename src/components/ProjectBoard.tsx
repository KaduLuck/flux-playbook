import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectCard, useProjectData } from "@/hooks/useProjectData";
import { cn } from "@/lib/utils";

const ProjectBoard = () => {
  const { projectData, getCardsByStatus, updateCardStatus } = useProjectData();
  const [selectedCard, setSelectedCard] = useState<ProjectCard | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Status columns
  const statuses = ["Backlog", "Em andamento", "Concluído"];
  
  // Priority colors
  const priorityColors = {
    Baixa: "bg-green-100 text-green-800",
    Média: "bg-yellow-100 text-yellow-800",
    Alta: "bg-red-100 text-red-800"
  };

  // Category colors
  const categoryColors = {
    "Estruturação": "bg-blue-100 text-blue-800",
    "Marketing": "bg-purple-100 text-purple-800",
    "Serviços Presenciais": "bg-orange-100 text-orange-800",
    "Serviços Digitais": "bg-cyan-100 text-cyan-800",
    "Automação": "bg-pink-100 text-pink-800",
    "Operação": "bg-indigo-100 text-indigo-800",
    "Expansão": "bg-teal-100 text-teal-800"
  };

  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Carregue um arquivo JSON para começar</p>
      </div>
    );
  }

  const handleCardMove = (cardId: string, newStatus: "Backlog" | "Em andamento" | "Concluído") => {
    updateCardStatus(cardId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quadro de Projetos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Adicionar Card
          </Button>
          <Button variant="outline" size="sm">
            Importar JSON
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Connections SVG */}
        <svg 
          ref={svgRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        >
          {/* Connection lines would be drawn here */}
        </svg>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {statuses.map((status) => {
            const cards = getCardsByStatus(status);
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-center">
                  {status} ({cards.length})
                </h3>
                <div className="space-y-3">
                  {cards.map((card) => (
                    <Card 
                      key={card.id}
                      className={cn(
                        "cursor-pointer hover:shadow-md transition-shadow",
                        selectedCard?.id === card.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedCard(card)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {card.titulo}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {card.descricao}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge 
                            className={cn("text-xs", priorityColors[card.prioridade] || "bg-gray-100 text-gray-800")}
                          >
                            {card.prioridade}
                          </Badge>
                          <Badge 
                            className={cn("text-xs", categoryColors[card.categoria] || "bg-gray-100 text-gray-800")}
                          >
                            {card.categoria}
                          </Badge>
                          {card.xp && (
                            <Badge variant="secondary" className="text-xs">
                              💎 {card.xp} XP
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>ID: {card.id}</span>
                          {card.proximos.length > 0 && (
                            <span>Libera: {card.proximos.length}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{selectedCard.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedCard.descricao}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Badge 
                  className={cn("text-xs", priorityColors[selectedCard.prioridade] || "bg-gray-100 text-gray-800")}
                >
                  Prioridade: {selectedCard.prioridade}
                </Badge>
                <Badge 
                  className={cn("text-xs", categoryColors[selectedCard.categoria] || "bg-gray-100 text-gray-800")}
                >
                  Categoria: {selectedCard.categoria}
                </Badge>
                {selectedCard.xp && (
                  <Badge variant="secondary" className="text-xs">
                    💎 {selectedCard.xp} XP
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <div className="flex gap-2">
                  {statuses.map((status) => (
                    <Button
                      key={status}
                      variant={selectedCard.status_inicial === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCardMove(selectedCard.id, status as any)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedCard.proximos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Próximas tarefas liberadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedCard.proximos.map((nextId) => (
                      <Badge key={nextId} variant="outline">
                        {nextId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedCard(null)}>
                  Fechar
                </Button>
                <Button>Editar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;