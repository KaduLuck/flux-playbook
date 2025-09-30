import { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCards } from '@/hooks/useCards';
import { Column, Card as TaskCard } from '@/types';
import TaskDialog from './TaskDialog';
import { cn } from '@/lib/utils';

const KanbanBoard = () => {
  const { columns, getCardsByColumn, loading } = useCards();
  const [selectedCard, setSelectedCard] = useState<TaskCard | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-400',
    high: 'border-l-orange-400', 
    urgent: 'border-l-red-500',
  };

  const priorityBadges = {
    low: 'bg-gray-500/10 text-gray-600 border-gray-300',
    medium: 'bg-blue-500/10 text-blue-600 border-blue-300',
    high: 'bg-orange-500/10 text-orange-600 border-orange-300',
    urgent: 'bg-red-500/10 text-red-600 border-red-300',
  };

  const serviceTypeColors = {
    physical: 'bg-success/10 text-success border-success/30',
    digital: 'bg-info/10 text-info border-info/30', 
    both: 'bg-warning/10 text-warning border-warning/30',
  };

  const handleCreateTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setSelectedCard(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (card: TaskCard) => {
    setSelectedCard(card);
    setShowTaskDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnCards = getCardsByColumn(column.id);
          
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-foreground">{column.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnCards.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCreateTask(column.id)}
                    className="h-8 w-8 p-0 hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Progress for completed column */}
                {column.name === 'Concluído' && columnCards.length > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progresso Mensal</span>
                      <span>{columnCards.length} tarefas</span>
                    </div>
                    <Progress value={Math.min((columnCards.length / 20) * 100, 100)} className="h-1" />
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[200px]">
                {columnCards.map((card) => (
                  <Card 
                    key={card.id} 
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow border-l-4 bg-card/60 backdrop-blur-sm",
                      priorityColors[card.priority]
                    )}
                    onClick={() => handleEditTask(card)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium leading-tight line-clamp-2">
                          {card.title}
                        </CardTitle>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-60">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {card.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      
                      {/* Progress Bar */}
                      {card.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium">{card.progress}%</span>
                          </div>
                          <Progress value={card.progress} className="h-1.5" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", priorityBadges[card.priority])}
                        >
                          {card.priority === 'low' && 'Baixa'}
                          {card.priority === 'medium' && 'Média'}
                          {card.priority === 'high' && 'Alta'}
                          {card.priority === 'urgent' && 'Urgente'}
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", serviceTypeColors[card.service_type])}
                        >
                          {card.service_type === 'physical' && '🔧 Físico'}
                          {card.service_type === 'digital' && '💻 Digital'}
                          {card.service_type === 'both' && '⚡ Híbrido'}
                        </Badge>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          💎 {card.points} pts
                        </span>
                        {card.estimated_value > 0 && (
                          <span className="text-success font-medium">
                            R$ {card.estimated_value.toLocaleString('pt-BR')}
                          </span>
                        )}
                        {card.due_date && (
                          <span>
                            📅 {new Date(card.due_date).toLocaleDateString('pt-BR')}
                          </span>
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

      {/* Task Dialog */}
      <TaskDialog
        open={showTaskDialog}
        onOpenChange={setShowTaskDialog}
        card={selectedCard}
        columnId={selectedColumn}
        onSuccess={() => {
          setShowTaskDialog(false);
          setSelectedCard(null);
        }}
      />
    </>
  );
};

export default KanbanBoard;