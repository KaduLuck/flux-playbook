
import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

import { useCards } from '@/hooks/useCards';
import { Column, Card as TaskCardType } from '@/types';
import TaskDialog from './TaskDialog';
import { ColumnContainer } from './ColumnContainer';
import { TaskCard } from './TaskCard';
import { ProjectWizard } from './ProjectWizard';
import { Button } from './ui/button';
import { PlusIcon } from 'lucide-react';

const KanbanBoard = () => {
  const { columns, cards, setCards, loading, moveCard, generateProjectPlan } = useCards();
  const [selectedCard, setSelectedCard] = useState<TaskCardType | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [activeCard, setActiveCard] = useState<TaskCardType | null>(null);
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  const columnsId = columns.map((col) => col.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
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

    const oldCards = [...cards];

    setCards(currentCards => {
      const activeCardIndex = currentCards.findIndex(c => c.id === activeId);
      if (activeCardIndex === -1) return currentCards;

      const activeCard = { ...currentCards[activeCardIndex] };
      const sourceColumnId = activeCard.column_id;

      const overIsAColumn = over.data.current?.type === 'Column';
      const overCardIndex = currentCards.findIndex(c => c.id === overId);
      
      const destinationColumnId = overIsAColumn
        ? String(over.id)
        : overCardIndex !== -1 ? currentCards[overCardIndex].column_id : null;

      if (!destinationColumnId) return currentCards;

      if (sourceColumnId === destinationColumnId) {
        // Reordering within the same column
        const overIndex = overCardIndex !== -1 ? overCardIndex : currentCards.length -1;
        const newCards = arrayMove(currentCards, activeCardIndex, overIndex);
        moveCard(newCards, oldCards);
        return newCards;
      }

      // Moving to a different column
      const newCards = [...currentCards];
      const movedCard = { ...newCards.splice(activeCardIndex, 1)[0], column_id: destinationColumnId };

      let newIndexInDest;
      const cardsInDestColumn = newCards.filter(c => c.column_id === destinationColumnId);

      if (overIsAColumn) {
        newIndexInDest = cardsInDestColumn.length;
      } else {
        const overCardInDestIndex = cardsInDestColumn.findIndex(c => c.id === overId);
        newIndexInDest = overCardInDestIndex !== -1 ? overCardInDestIndex : cardsInDestColumn.length;
      }

      const destCardsWithMoved = [...cardsInDestColumn];
      destCardsWithMoved.splice(newIndexInDest, 0, movedCard);

      const finalDestCards = destCardsWithMoved.map((card, index) => ({ ...card, position: index }));

      const sourceCards = newCards
        .filter(c => c.column_id === sourceColumnId)
        .sort((a,b) => a.position - b.position)
        .map((card, index) => ({ ...card, position: index }));

      const otherCards = newCards.filter(c => c.column_id !== sourceColumnId && c.column_id !== destinationColumnId);

      const finalState = [...otherCards, ...sourceCards, ...finalDestCards];

      moveCard(finalState, oldCards);
      return finalState;
    });
  }

  const handleCreateTask = (columnId: string) => {
    setSelectedColumn(columnId);
    setSelectedCard(null);
    setShowTaskDialog(true);
  };

  const handleEditTask = (card: TaskCardType) => {
    setSelectedCard(card);
    setShowTaskDialog(true);
  };
  
  const handlePlanGenerated = async (initialCardsData: any) => {
    setShowProjectWizard(false);
    await generateProjectPlan(initialCardsData);
  }

  if (loading && !cards.length) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>;
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quadro Kanban</h1>
        <Button onClick={() => setShowProjectWizard(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Planejar Novo Projeto
        </Button>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        <SortableContext items={columnsId}>
          {columns.map((col) => {
            const columnCards = cards.filter((card) => card.column_id === col.id).sort((a, b) => a.position - b.position);
            return <ColumnContainer key={col.id} column={col} cards={columnCards} onCreateCard={handleCreateTask} onEditCard={handleEditTask}/>;
          })}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay>{activeCard && <TaskCard card={activeCard} onEdit={handleEditTask}/>}</DragOverlay>,
        document.body
      )}

      <ProjectWizard open={showProjectWizard} onOpenChange={setShowProjectWizard} onPlanGenerated={handlePlanGenerated} />
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
    </DndContext>
  );
};

export default KanbanBoard;
