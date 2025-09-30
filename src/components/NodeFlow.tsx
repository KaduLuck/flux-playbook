import { useState, useRef } from "react";
import { Card } from "@/types";
import { useNodeFlow } from "@/hooks/useNodeFlow";
import { Button } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjectData } from "@/hooks/useProjectData";

const NodeFlow = () => {
  const { cards, connections, loading } = useNodeFlow();
  const { projectData } = useProjectData();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceCard, setSourceCard] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleCardClick = (card: Card) => {
    if (isConnecting) {
      if (!sourceCard) {
        // First card selected for connection
        setSourceCard(card.id);
      } else {
        // Second card selected, create connection
        // Here we would call the createConnection function
        setIsConnecting(false);
        setSourceCard(null);
      }
    } else {
      setSelectedCard(card);
    }
  };

  const getConnectionPath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
    // Create a curved path between nodes
    const midX = (sourceX + targetX) / 2;
    return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If we have project data, use that instead of the node flow data
  const displayCards = projectData ? projectData.cards : cards;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {projectData ? "Fluxo de Projeto" : "Fluxo de Tarefas"}
        </h2>
        <Button 
          onClick={() => setIsConnecting(!isConnecting)}
          variant={isConnecting ? "default" : "outline"}
        >
          {isConnecting ? "Cancelar Conexão" : "Conectar Tarefas"}
        </Button>
      </div>

      <div className="relative border rounded-lg p-4 min-h-[400px] bg-background">
        <svg 
          ref={svgRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          {projectData ? (
            // Draw connections based on project data
            projectData.cards.map((card) => {
              return card.proximos.map((nextId) => {
                const nextCard = projectData.cards.find(c => c.id === nextId);
                if (!nextCard) return null;
                
                // Calculate positions (simplified for now)
                const sourceIndex = projectData.cards.findIndex(c => c.id === card.id);
                const targetIndex = projectData.cards.findIndex(c => c.id === nextId);
                
                const sourceX = (sourceIndex % 3) * 300 + 150;
                const sourceY = Math.floor(sourceIndex / 3) * 200 + 100;
                const targetX = (targetIndex % 3) * 300 + 150;
                const targetY = Math.floor(targetIndex / 3) * 200 + 100;
                
                return (
                  <path
                    key={`${card.id}-${nextId}`}
                    d={getConnectionPath(sourceX, sourceY, targetX, targetY)}
                    stroke="#6366f1"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              });
            })
          ) : (
            // Draw connections based on node flow data
            connections.map((connection, index) => {
              const sourceCard = cards.find(c => c.id === connection.source_card_id);
              const targetCard = cards.find(c => c.id === connection.target_card_id);
              
              if (!sourceCard || !targetCard) return null;
              
              return (
                <path
                  key={index}
                  d={getConnectionPath(
                    sourceCard.position * 100 + 50, 
                    50, 
                    targetCard.position * 100 + 50, 
                    150
                  )}
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              );
            })
          )}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
        </svg>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCards.map((card, index) => (
            <UICard
              key={card.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                selectedCard?.id === card.id && "ring-2 ring-primary",
                sourceCard === card.id && "ring-2 ring-green-500"
              )}
              onClick={() => handleCardClick(card as any)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{card.title || card.titulo}</h3>
                </div>
                
                {(card.description || card.descricao) && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {card.description || card.descricao}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">
                    {card.service_type === 'physical' && '🔧 Físico'}
                    {card.service_type === 'digital' && '💻 Digital'}
                    {card.service_type === 'both' && '⚡ Híbrido'}
                    {card.categoria && card.categoria}
                  </Badge>
                  <Badge variant="outline">
                    {card.priority === 'low' && '🟢 Baixa'}
                    {card.priority === 'medium' && '🟡 Média'}
                    {card.priority === 'high' && '🟠 Alta'}
                    {card.priority === 'urgent' && '🔴 Urgente'}
                    {card.prioridade && `_prioridade_`}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>🆔 {card.id}</span>
                  {(card.points || card.xp) && (
                    <span className="text-primary font-medium">
                      💎 {card.points || card.xp} XP
                    </span>
                  )}
                </div>
              </div>
            </UICard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeFlow;