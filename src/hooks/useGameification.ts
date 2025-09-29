import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Achievement, UserAchievement, Profile } from '@/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useGameification = () => {
  const { user, profile, updateProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: true });

      if (error) throw error;
      setAchievements(data as Achievement[] || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAchievements(data as UserAchievement[] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      setLoading(false);
    }
  };

  const addExperience = async (points: number) => {
    if (!profile) return;

    const newExperience = profile.experience + points;
    const newTotalPoints = profile.total_points + points;
    
    // Calculate new level (every 1000 XP = 1 level)
    const newLevel = Math.floor(newExperience / 1000) + 1;
    const leveledUp = newLevel > profile.level;

    await updateProfile({
      experience: newExperience,
      total_points: newTotalPoints,
      level: newLevel,
    });

    if (leveledUp) {
      toast.success(`🎉 Parabéns! Você subiu para o nível ${newLevel}!`, {
        duration: 5000,
      });
    }

    // Check for new achievements
    await checkAchievements();
  };

  const checkAchievements = async () => {
    if (!user || !profile) return;

    try {
      // Get completed cards count
      const { data: completedCards } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const completedCardsCount = completedCards?.length || 0;

      // Get physical services count
      const physicalServicesCount = completedCards?.filter(
        card => card.service_type === 'physical'
      ).length || 0;

      // Get digital services count  
      const digitalServicesCount = completedCards?.filter(
        card => card.service_type === 'digital'
      ).length || 0;

      // Check each achievement
      for (const achievement of achievements) {
        // Check if user already has this achievement
        const hasAchievement = userAchievements.some(
          ua => ua.achievement_id === achievement.id
        );

        if (hasAchievement) continue;

        let shouldEarn = false;

        switch (achievement.condition_type) {
          case 'cards_completed':
            shouldEarn = completedCardsCount >= achievement.condition_value;
            break;
          case 'points_earned':
            shouldEarn = profile.total_points >= achievement.condition_value;
            break;
          case 'service_type':
            // Check if this is physical or digital achievement
            if (achievement.name.includes('Físico')) {
              shouldEarn = physicalServicesCount >= achievement.condition_value;
            } else if (achievement.name.includes('Digital')) {
              shouldEarn = digitalServicesCount >= achievement.condition_value;
            }
            break;
        }

        if (shouldEarn) {
          await earnAchievement(achievement);
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const earnAchievement = async (achievement: Achievement) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: user.id,
          achievement_id: achievement.id,
        }]);

      if (error) throw error;

      // Add achievement points to user experience
      await addExperience(achievement.points);

      // Show achievement notification
      toast.success(`🏆 Nova conquista desbloqueada: ${achievement.name}!`, {
        description: achievement.description,
        duration: 8000,
      });

      // Refresh user achievements
      await fetchUserAchievements();
    } catch (error) {
      console.error('Error earning achievement:', error);
    }
  };

  const getNextLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelXP = (profile.level - 1) * 1000;
    const nextLevelXP = profile.level * 1000;
    const currentProgress = profile.experience - currentLevelXP;
    const totalNeeded = nextLevelXP - currentLevelXP;
    return Math.round((currentProgress / totalNeeded) * 100);
  };

  return {
    achievements,
    userAchievements,
    loading,
    addExperience,
    checkAchievements,
    getNextLevelProgress,
  };
};