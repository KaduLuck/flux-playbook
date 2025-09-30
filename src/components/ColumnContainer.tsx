import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Card as TaskCardType } from "@/types";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TaskCard } from "./TaskCard";

interface Props {
  column: Column;
  cards: TaskCardType[];
}

export function ColumnContainer({ column, cards }: Props) {
  const cardsIds = useMemo(() => {
    return cards.map((card) => card.id);
  }, [cards]);

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80"
    >
      {/* Column title */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
            <h3 className="font-semibold text-foreground">{column.name}</h3>
            <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
          </div>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* Column task container */}
      <div className="space-y-3 min-h-[200px]">
        <SortableContext items={cardsIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <TaskCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}