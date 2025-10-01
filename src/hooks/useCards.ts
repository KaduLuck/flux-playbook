
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, Column, CreateCardData, UpdateCardData } from '@/types';
import { useAuth } from './useAuth';
import { useGameification } from './useGameification';
import { toast } from 'sonner';

export const useCards = () => {
  const { user } = useAuth();
  const { addExperience } = useGameification();
  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchColumns();
      fetchCards();
    }
  }, [user]);

  const fetchColumns = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      if (error) throw error;
      setColumns(data || []);
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchCards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('position');
      if (error) throw error;
      setCards((data as Card[]) || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (cardData: CreateCardData) => {
    if (!user) return;
    try {
      const cardsInColumn = cards.filter(c => c.column_id === cardData.column_id);
      const position = cardsInColumn.length;
      const { data, error } = await supabase
        .from('cards')
        .insert([{ ...cardData, user_id: user.id, position }])
        .select()
        .single();
      if (error) throw error;
      setCards(prev => [...prev, data as Card]);
      toast.success('Tarefa criada com sucesso!');
      return { data, error: null };
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Erro ao criar tarefa');
      return { data: null, error };
    }
  };

  const updateCard = async (cardData: UpdateCardData) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('cards')
        .update(cardData)
        .eq('id', cardData.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      setCards(prev => prev.map(card => (card.id === cardData.id ? (data as Card) : card)));
      if (cardData.status === 'completed') {
        const cardPoints = data.points || 10;
        await addExperience(cardPoints);
        toast.success(`🎉 Tarefa concluída! +${cardPoints} XP`);
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error updating card:', error);
      toast.error('Erro ao atualizar tarefa');
      return { data: null, error };
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('cards').delete().eq('id', cardId).eq('user_id', user.id);
      if (error) throw error;
      setCards(prev => prev.filter(card => card.id !== cardId));
      toast.success('Tarefa removida');
      return { error: null };
    } catch (error) {
      console.error('Error deleting card:', error);
      toast.error('Erro ao remover tarefa');
      return { error };
    }
  };

  const moveCard = async (newCards: Card[], oldCards: Card[]) => {
    if (!user) return;

    const changedCards = newCards.filter(newCard => {
      const oldCard = oldCards.find(c => c.id === newCard.id);
      return !oldCard || oldCard.position !== newCard.position || oldCard.column_id !== newCard.column_id;
    });

    if (changedCards.length === 0) return;

    const updates = changedCards.map(card => ({
      ...card,
      user_id: user.id,
      status: columns.find(c => c.id === card.column_id)?.name === 'Concluído' ? 'completed' : 'in_progress',
    }));

    try {
      setCards(newCards);

      const { error } = await supabase.from('cards').upsert(updates);
      if (error) {
        throw error;
      }

      const completedCard = changedCards.find(card => {
        const oldCard = oldCards.find(c => c.id === card.id);
        const oldColumnName = columns.find(c => c.id === oldCard?.column_id)?.name;
        const newColumnName = columns.find(c => c.id === card.column_id)?.name;
        return oldColumnName !== 'Concluído' && newColumnName === 'Concluído';
      });

      if (completedCard) {
        const cardPoints = completedCard.points || 10;
        await addExperience(cardPoints);
        toast.success(`🎉 Tarefa concluída! +${cardPoints} XP`);
      }
    } catch (error) {
      console.error('Error moving cards:', error);
      toast.error('Erro ao mover as tarefas. Revertendo alterações.');
      setCards(oldCards);
    }
  };

  const generateProjectPlan = async (tasks: Omit<CreateCardData, 'user_id' | 'position'>[]) => {
    if (!user) return;

    const tasksByColumn: { [key: string]: Omit<CreateCardData, 'user_id' | 'position'>[] } = tasks.reduce((acc, task) => {
      if (!acc[task.column_id]) {
        acc[task.column_id] = [];
      }
      acc[task.column_id].push(task);
      return acc;
    }, {} as { [key: string]: any[] });

    const newCardsToInsert: CreateCardData[] = [];

    for (const columnId in tasksByColumn) {
      const tasksInColumn = tasksByColumn[columnId];
      const cardsInDbForColumn = cards.filter(c => c.column_id === columnId);
      let currentPosition = cardsInDbForColumn.length;
      
      tasksInColumn.forEach(task => {
        newCardsToInsert.push({
          ...(task as any),
          user_id: user.id,
          position: currentPosition,
        });
        currentPosition++;
      });
    }

    if (newCardsToInsert.length === 0) return;

    try {
      const { data, error } = await supabase.from('cards').insert(newCardsToInsert).select();
      if (error) throw error;
      setCards(prev => [...prev, ...data as Card[]]);
      toast.success('Plano de projeto gerado com sucesso!');
    } catch (error) {
      console.error('Error generating project plan:', error);
      toast.error('Erro ao gerar plano de projeto.');
    }
  };

  return {
    cards,
    setCards,
    columns,
    loading,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    generateProjectPlan,
  };
};
