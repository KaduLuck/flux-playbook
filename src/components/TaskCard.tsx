
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

interface TaskCardProps {
  card: TaskCardType;
}

const priorityStyles = cva("", {
  variants: {
    priority: {
      low: "border-t-green-500",
      medium: "border-t-yellow-500",
      high: "border-t-orange-500",
      urgent: "border-t-red-500",
    },
  },
  defaultVariants: {
    priority: "medium",
  },
});

export const TaskCard = ({ card }: TaskCardProps) => {
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
      className={`touch-none min-h-[120px] rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-200 ${priorityStyles({ priority: card.priority as any })}`}
    >
      <CardHeader className="p-4 flex flex-row items-start justify-between">
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
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {card.service_type && (
          <Badge variant="outline" className="capitalize">
            {card.service_type === 'both' ? 'Físico & Digital' : (card.service_type === 'physical' ? 'Físico' : 'Digital')}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
