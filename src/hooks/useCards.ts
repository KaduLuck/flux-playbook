import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, Column, CreateCardData, UpdateCardData, ChecklistItem } from '@/types';
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

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      if (error) throw error;
      setCards(data as Card[] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setLoading(false);
    }
  };

  const createCard = async (cardData: CreateCardData) => {
    if (!user) return;

    try {
      // Get the next position for the column
      const cardsInColumn = cards.filter(c => c.column_id === cardData.column_id);
      const position = cardsInColumn.length;

      const { data, error } = await supabase
        .from('cards')
        .insert([{
          ...cardData,
          user_id: user.id,
          position,
        }])
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

      setCards(prev => prev.map(card => 
        card.id === cardData.id ? data as Card : card
      ));

      // If card was completed, add experience
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
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

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

  const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ 
          column_id: newColumnId, 
          position: newPosition,
          status: newColumnId === getCompletedColumnId() ? 'completed' : 'in_progress'
        })
        .eq('id', cardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCards(prev => prev.map(card => 
        card.id === cardId ? data as Card : card
      ));

      // If moved to completed column, add experience
      if (newColumnId === getCompletedColumnId()) {
        const cardPoints = data.points || 10;
        await addExperience(cardPoints);
        toast.success(`🎉 Tarefa concluída! +${cardPoints} XP`);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Erro ao mover tarefa');
      return { data: null, error };
    }
  };

  const getCompletedColumnId = () => {
    return columns.find(col => col.name === 'Concluído')?.id || '';
  };

  const getCardsByColumn = (columnId: string) => {
    return cards.filter(card => card.column_id === columnId).sort((a, b) => a.position - b.position);
  };

  return {
    cards,
    columns,
    loading,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    getCardsByColumn,
    refreshCards: fetchCards,
  };
};