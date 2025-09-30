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
      activationConstraint: { distance: 10 }, // Prevents drag on simple click
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
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === 'Card';
    if (!isActiveACard) return;

    const oldCards = cards; // For optimistic update rollback

    setCards(currentCards => {
      const activeCard = currentCards.find(c => c.id === activeId);
      if (!activeCard) return currentCards;

      const sourceColumnId = activeCard.column_id;

      // Determine destination column
      const overIsAColumn = over.data.current?.type === 'Column';
      const destinationColumnId = overIsAColumn
        ? String(over.id)
        : currentCards.find(c => c.id === overId)?.column_id;

      if (!destinationColumnId) return currentCards;

      // --- CASE 1: SAME COLUMN --- //
      if (sourceColumnId === destinationColumnId) {
        const cardsInColumn = currentCards.filter(c => c.column_id === sourceColumnId);
        const oldIndex = cardsInColumn.findIndex(c => c.id === activeId);
        const newIndex = cardsInColumn.findIndex(c => c.id === overId);

        if (oldIndex === -1 || newIndex === -1) return currentCards;

        // Reorder cards within the specific column
        const reorderedCardsInColumn = arrayMove(cardsInColumn, oldIndex, newIndex);

        // Update position property for the affected cards
        const updatedCards = reorderedCardsInColumn.map((card, index) => ({
          ...card,
          position: index,
        }));

        // Rebuild the full state
        const otherCards = currentCards.filter(c => c.column_id !== sourceColumnId);
        const newFullState = [...otherCards, ...updatedCards];
        
        moveCard(newFullState, oldCards);
        return newFullState;
      }

      // --- CASE 2: DIFFERENT COLUMNS --- //

      // 1. Re-index source column (without the active card)
      const updatedSourceCards = currentCards
        .filter(c => c.column_id === sourceColumnId && c.id !== activeId)
        .sort((a, b) => a.position - b.position)
        .map((card, index) => ({ ...card, position: index }));

      // 2. Build new destination column
      const originalDestCards = currentCards
        .filter(c => c.column_id === destinationColumnId)
        .sort((a, b) => a.position - b.position);

      let newIndexInDest;
      if (overIsAColumn) {
        newIndexInDest = originalDestCards.length; // Add to the end if dropped on column
      } else {
        // Find position of the card we dropped on
        const overCardIndex = originalDestCards.findIndex(c => c.id === overId);
        newIndexInDest = overCardIndex >= 0 ? overCardIndex : originalDestCards.length;
      }

      // Insert the active card into its new spot
      originalDestCards.splice(newIndexInDest, 0, { ...activeCard, column_id: destinationColumnId });

      // Re-index the entire destination column
      const updatedDestinationCards = originalDestCards.map((card, index) => ({
        ...card,
        position: index,
      }));

      // 3. Combine everything for the new state
      const otherCards = currentCards.filter(c => c.column_id !== sourceColumnId && c.column_id !== destinationColumnId);
      const newFullState = [...otherCards, ...updatedSourceCards, ...updatedDestinationCards];

      moveCard(newFullState, oldCards);
      return newFullState;
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
            const columnCards = cards.filter((card) => card.column_id === col.id).sort((a, b) => a.position - b.position);
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
