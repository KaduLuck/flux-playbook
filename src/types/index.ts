export interface Profile {
  id: string;
  user_id: string;
  name?: string;
  avatar_url?: string;
  level: number;
  experience: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  user_id: string;
  name: string;
  position: number;
  color: string;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  due_date?: string;
  points: number;
  position: number;
  service_type: 'physical' | 'digital' | 'both';
  estimated_value: number;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  card_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export interface CardConnection {
  id: string;
  source_card_id: string;
  target_card_id: string;
  condition_type: 'automatic' | 'manual' | 'conditional';
  condition_value?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  condition_type: 'cards_completed' | 'points_earned' | 'streak_days' | 'service_type';
  condition_value: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface CreateCardData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  points?: number;
  service_type?: 'physical' | 'digital' | 'both';
  estimated_value?: number;
  column_id: string;
}

export interface UpdateCardData {
  id: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  due_date?: string;
  points?: number;
  service_type?: 'physical' | 'digital' | 'both';
  estimated_value?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  column_id?: string;
}