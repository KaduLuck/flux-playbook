import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardConnection } from '@/types';
import { useAuth } from './useAuth';

export const useNodeFlow = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [connections, setConnections] = useState<CardConnection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCardsAndConnections();
    }
  }, [user]);

  const fetchCardsAndConnections = async () => {
    if (!user) return;

    try {
      // Fetch cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;

      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('card_connections')
        .select('*')
        .or(`source_card_id.in.(${cardsData?.map(c => c.id).join(',')}),target_card_id.in.(${cardsData?.map(c => c.id).join(',')})`);

      if (connectionsError) throw connectionsError;

      setCards(cardsData as Card[] || []);
      setConnections(connectionsData as CardConnection[] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nodes:', error);
      setLoading(false);
    }
  };

  const createConnection = async (sourceCardId: string, targetCardId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('card_connections')
        .insert([{
          source_card_id: sourceCardId,
          target_card_id: targetCardId,
          condition_type: 'manual',
        }])
        .select()
        .single();

      if (error) throw error;

      setConnections(prev => [...prev, data as CardConnection]);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating connection:', error);
      return { data: null, error };
    }
  };

  const deleteConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('card_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      return { error: null };
    } catch (error) {
      console.error('Error deleting connection:', error);
      return { error };
    }
  };

  const getConnectedCards = (cardId: string) => {
    const targetConnections = connections.filter(conn => conn.source_card_id === cardId);
    const sourceConnections = connections.filter(conn => conn.target_card_id === cardId);
    
    const targetCards = targetConnections.map(conn => 
      cards.find(card => card.id === conn.target_card_id)
    ).filter(Boolean) as Card[];
    
    const sourceCards = sourceConnections.map(conn => 
      cards.find(card => card.id === conn.source_card_id)
    ).filter(Boolean) as Card[];
    
    return { targetCards, sourceCards };
  };

  const getCardById = (cardId: string) => {
    return cards.find(card => card.id === cardId);
  };

  return {
    cards,
    connections,
    loading,
    createConnection,
    deleteConnection,
    getConnectedCards,
    getCardById,
    refresh: fetchCardsAndConnections,
  };
};