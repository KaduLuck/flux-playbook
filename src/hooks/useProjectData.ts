import { useState, useEffect } from "react";

export interface ProjectCard {
  id: string;
  titulo: string;
  descricao: string;
  status_inicial: "Backlog" | "Em andamento" | "Concluído";
  prioridade: "Baixa" | "Média" | "Alta";
  xp?: number;
  categoria: string;
  proximos: string[];
}

export interface ProjectData {
  __instrucoes: string;
  cards: ProjectCard[];
}

export const useProjectData = () => {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjectData = (jsonData: ProjectData) => {
    try {
      setProjectData(jsonData);
      setError(null);
    } catch (err) {
      setError("Failed to parse project data");
      console.error("Error loading project data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCardsByStatus = (status: string) => {
    if (!projectData) return [];
    return projectData.cards.filter(card => card.status_inicial === status);
  };

  const getCardById = (id: string) => {
    if (!projectData) return null;
    return projectData.cards.find(card => card.id === id) || null;
  };

  const getNextCards = (cardId: string) => {
    if (!projectData) return [];
    const card = getCardById(cardId);
    if (!card) return [];
    
    return card.proximos.map(id => getCardById(id)).filter(Boolean) as ProjectCard[];
  };

  const updateCardStatus = (cardId: string, newStatus: "Backlog" | "Em andamento" | "Concluído") => {
    if (!projectData) return;
    
    const updatedCards = projectData.cards.map(card => {
      if (card.id === cardId) {
        return { ...card, status_inicial: newStatus };
      }
      return card;
    });

    setProjectData({
      ...projectData,
      cards: updatedCards
    });
  };

  const addCard = (card: ProjectCard) => {
    if (!projectData) return;
    
    setProjectData({
      ...projectData,
      cards: [...projectData.cards, card]
    });
  };

  const updateCard = (updatedCard: ProjectCard) => {
    if (!projectData) return;
    
    const updatedCards = projectData.cards.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    );

    setProjectData({
      ...projectData,
      cards: updatedCards
    });
  };

  const deleteCard = (cardId: string) => {
    if (!projectData) return;
    
    // Remove the card
    const updatedCards = projectData.cards.filter(card => card.id !== cardId);
    
    // Remove references to this card in "proximos" arrays
    const cleanedCards = updatedCards.map(card => ({
      ...card,
      proximos: card.proximos.filter(id => id !== cardId)
    }));

    setProjectData({
      ...projectData,
      cards: cleanedCards
    });
  };

  return {
    projectData,
    loading,
    error,
    loadProjectData,
    getCardsByStatus,
    getCardById,
    getNextCards,
    updateCardStatus,
    addCard,
    updateCard,
    deleteCard
  };
};