import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCards } from '@/hooks/useCards';
import { Column, Card as TaskCardType } from '@/types';
import { ProjectWizard } from './ProjectWizard';
import { ColumnContainer } from './ColumnContainer';
import { TaskCard } from './TaskCard';
import { initialCardsData } from '@/lib/initial-data';

const KanbanBoard = () => {
  const { columns, cards, setCards, loading, moveCard, generateProjectPlan } = useCards();
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [activeCard, setActiveCard] = useState<TaskCardType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Card') {
      setActiveCard(event.active.data.current.card);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const originalCards = cards;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeCard = originalCards.find(c => c.id === activeId);
    if (!activeCard) return;

    setCards(currentCards => {
        const activeCardIndex = currentCards.findIndex(c => c.id === activeId);
        const overCardIndex = currentCards.findIndex(c => c.id === overId);
        const overCard = currentCards[overCardIndex];
        const activeContainer = active.data.current?.card.column_id;
        const overContainer = over.data.current?.type === 'Column' ? over.id : over.data.current?.card.column_id;

        if (!activeContainer || !overContainer) return currentCards;

        let newCardsState = [...currentCards];

        if (activeContainer === overContainer) {
            // Moving within the same column
            const cardsInColumn = newCardsState.filter(c => c.column_id === activeContainer);
            const oldIndex = cardsInColumn.findIndex(c => c.id === activeId);
            let newIndex = cardsInColumn.findIndex(c => c.id === overId);
            // When hovering over the column itself
            if (over.data.current?.type === 'Column' && oldIndex !== -1) {
                 newIndex = cardsInColumn.length;
            }
            
            const movedCardsInColumn = arrayMove(cardsInColumn, oldIndex, newIndex);
            
            // Re-integrate into the main cards array
            const otherCards = newCardsState.filter(c => c.column_id !== activeContainer);
            newCardsState = [
                ...otherCards,
                ...movedCardsInColumn.map((card, index) => ({ ...card, position: index }))
            ];
        } else {
            // Moving to a different column
            const activeCard = newCardsState[activeCardIndex];
            activeCard.column_id = overContainer;

            const overIsColumn = over.data.current?.type === 'Column';

            let targetIndex;
            if (overIsColumn) {
                targetIndex = newCardsState.filter(c => c.column_id === overContainer).length;
            } else {
                targetIndex = newCardsState.filter(c => c.column_id === overContainer).findIndex(c => c.id === overId);
                if (targetIndex === -1) targetIndex = 0; // Should not happen
            }

            // Remove from old position and insert into new
            const [movedCard] = newCardsState.splice(activeCardIndex, 1);
            newCardsState.splice(activeCardIndex < targetIndex ? targetIndex -1 : targetIndex, 0, movedCard);
            
            // Re-index both affected columns
            const affectedColumns = [activeContainer, overContainer];
            affectedColumns.forEach(columnId => {
                const cardsToReindex = newCardsState.filter(c => c.column_id === columnId);
                cardsToReindex.forEach((card, index) => {
                    const globalIndex = newCardsState.findIndex(c => c.id === card.id);
                    newCardsState[globalIndex].position = index;
                });
            });
        }

        moveCard(newCardsState, originalCards);
        return newCardsState;
    });
  }

  if (loading && !cards.length) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
  }

  const handlePlanGenerated = async () => {
    setShowProjectWizard(false);
    await generateProjectPlan(initialCardsData);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowProjectWizard(true)}>
          <Sparkles className="w-4 h-4 mr-2" />
          Gerar Novo Plano com IA
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <SortableContext items={columnsId}>
          {columns.map((col) => {
            const columnCards = cards.filter((card) => card.column_id === col.id).sort((a,b) => a.position - b.position);
            return <ColumnContainer key={col.id} column={col} cards={columnCards} />;
          })}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>{activeCard && <TaskCard card={activeCard} />}</DragOverlay>,
        document.body
      )}
      
      <ProjectWizard open={showProjectWizard} onOpenChange={setShowProjectWizard} onPlanGenerated={handlePlanGenerated} />
    </DndContext>
  );
};

export default KanbanBoard;
