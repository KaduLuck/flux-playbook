
import { useState } from 'react';
import { Card as TaskCardType } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, GripVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  card: TaskCardType;
  onEdit: (card: TaskCardType) => void;
}

const priorityStyles = cva("border-l-4", {
  variants: {
    priority: {
      low: 'border-l-gray-400',
      medium: 'border-l-blue-400',
      high: 'border-l-orange-400',
      urgent: 'border-l-red-500',
    },
  },
  defaultVariants: {
    priority: "medium",
  },
});

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

export const TaskCard = ({ card, onEdit }: TaskCardProps) => {
  const [isMouseOver, setIsMouseOver] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      card,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-[100px] min-h-[100px] rounded-lg border-2 border-primary bg-card opacity-50"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className={cn(
        "touch-none min-h-[120px] rounded-lg border bg-card/60 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200",
        priorityStyles({ priority: card.priority as any })
      )}
      onClick={() => onEdit(card)}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between gap-2">
        <div {...listeners} className="flex items-center gap-2 cursor-grab w-full pr-4">
           {isMouseOver && <GripVertical className="h-5 w-5 text-muted-foreground" />}
          <CardTitle className="text-base font-medium leading-tight line-clamp-2">
            {card.title}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleDropdownClick}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent onClick={handleDropdownClick} align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(card); }}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
          {card.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {card.description}
            </p>
          )}
          
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
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              💎 {card.points} pts
            </span>
            {card.due_date && (
              <span>
                📅 {new Date(card.due_date).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
      </CardContent>
    </Card>
  );
};
