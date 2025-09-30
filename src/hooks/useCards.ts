import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, Column, CreateCardData } from '@/types';
import { useAuth } from './useAuth';
import { useGameification } from './useGameification';
import { toast } from 'sonner';
import { initialCardsData, defaultColumns } from '@/lib/initial-data';

export const useCards = () => {
  const { user } = useAuth();
  const { addExperience } = useGameification();
  const [cards, setCards] = useState<Card[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColumns = useCallback(async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase.from('columns').select('*').eq('user_id', user.id).order('position');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching columns:', error);
      return [];
    }
  }, [user]);

  const fetchCards = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('cards').select('*').eq('user_id', user.id);
      if (error) throw error;
      setCards(data as Card[] || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } 
  }, [user]);

  const generateProjectPlan = useCallback(async (newCardsData: CreateCardData[]) => {
    if (!user) return;
    setLoading(true);
    try {
      toast.info('Gerando seu novo plano de negócios com IA...');
      await supabase.from('cards').delete().eq('user_id', user.id);
      await supabase.from('columns').delete().eq('user_id', user.id);

      const createdColumns = [];
      for (const [index, col] of defaultColumns.entries()) {
        const { data, error } = await supabase.from('columns').insert({ name: col.name, color: col.color, user_id: user.id, position: index }).select().single();
        if (error) throw error;
        createdColumns.push(data);
      }
      setColumns(createdColumns);

      const backlogColumn = createdColumns.find(c => c.name === 'Backlog');
      if (!backlogColumn) throw new Error('Coluna Backlog não encontrada');

      const cardsToInsert = newCardsData.map((card, index) => ({ ...card, user_id: user.id, column_id: backlogColumn.id, position: index }));
      const { data: createdCards, error: cardsError } = await supabase.from('cards').insert(cardsToInsert).select();
      if (cardsError) throw cardsError;
      
      setCards(createdCards as Card[]);
      toast.success('🚀 Seu novo plano de negócios foi gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar plano de projeto:', error);
      toast.error('Falha ao gerar o novo plano de negócios.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const initializeBoard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const existingColumns = await fetchColumns();
    if (existingColumns.length > 0) {
      setColumns(existingColumns);
      await fetchCards();
    } else {
      await generateProjectPlan(initialCardsData);
    }
    setLoading(false);
  }, [user, fetchColumns, fetchCards, generateProjectPlan]);

  useEffect(() => {
    if (user) {
        initializeBoard();
    }
  }, [user, initializeBoard]);

  const moveCard = async (newCards: Card[], oldCards: Card[]) => {
    // Detect card that moved to 'Done' for gamification
    const completedColumn = columns.find(c => c.name === 'Concluído');
    if (completedColumn) {
        const newlyCompletedCard = newCards.find(newCard => {
            const oldCard = oldCards.find(c => c.id === newCard.id);
            return oldCard && newCard.column_id === completedColumn.id && oldCard.column_id !== completedColumn.id;
        });

        if (newlyCompletedCard) {
            const cardPoints = newlyCompletedCard.points || 10;
            addExperience(cardPoints);
            toast.success(`🎉 Tarefa concluída! +${cardPoints} XP`);
        }
    }
    
    // Persist changes to the database
    const { error } = await supabase.from('cards').upsert(newCards, { onConflict: 'id' });

    // If there is an error, rollback by restoring the old state
    if (error) {
      toast.error('Falha ao salvar as alterações. Revertendo...');
      setCards(oldCards);
    }
  };

  return { cards, columns, loading, moveCard, generateProjectPlan, setCards, initializeBoard };
};
