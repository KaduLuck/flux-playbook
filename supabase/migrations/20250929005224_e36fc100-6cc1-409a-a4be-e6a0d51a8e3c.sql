-- Tabela de usuários (perfis)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de colunas do Kanban
CREATE TABLE public.columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de cards/tarefas
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE,
  points INTEGER DEFAULT 10,
  position INTEGER NOT NULL,
  service_type TEXT DEFAULT 'digital' CHECK (service_type IN ('physical', 'digital', 'both')),
  estimated_value DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de checklists dos cards
CREATE TABLE public.checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conexões entre cards (fluxo de nodes)
CREATE TABLE public.card_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  target_card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  condition_type TEXT DEFAULT 'automatic' CHECK (condition_type IN ('automatic', 'manual', 'conditional')),
  condition_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_card_id, target_card_id)
);

-- Tabela de conquistas/badges
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100,
  condition_type TEXT NOT NULL CHECK (condition_type IN ('cards_completed', 'points_earned', 'streak_days', 'service_type')),
  condition_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conquistas do usuário
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para columns
CREATE POLICY "Users can manage their own columns" ON public.columns
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para cards
CREATE POLICY "Users can manage their own cards" ON public.cards
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para checklist_items
CREATE POLICY "Users can manage checklist items of their cards" ON public.checklist_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.cards WHERE cards.id = checklist_items.card_id AND cards.user_id = auth.uid()
  ));

-- Políticas RLS para card_connections
CREATE POLICY "Users can manage connections of their cards" ON public.card_connections
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.cards WHERE cards.id = card_connections.source_card_id AND cards.user_id = auth.uid()
  ));

-- Políticas RLS para achievements (todos podem ver)
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- Políticas RLS para user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir colunas padrão para novos usuários
INSERT INTO public.achievements (name, description, icon, points, condition_type, condition_value) VALUES
  ('Primeiro Passo', 'Complete sua primeira tarefa', '🎯', 50, 'cards_completed', 1),
  ('Produtivo', 'Complete 10 tarefas', '⚡', 200, 'cards_completed', 10),
  ('Mestre', 'Complete 50 tarefas', '👑', 500, 'cards_completed', 50),
  ('Especialista Físico', 'Complete 5 serviços físicos', '🔧', 300, 'service_type', 5),
  ('Guru Digital', 'Complete 10 serviços digitais', '💻', 400, 'service_type', 10),
  ('Milionário em Pontos', 'Acumule 1000 pontos', '💎', 1000, 'points_earned', 1000);

-- Função para criar colunas padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_columns_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.columns (user_id, name, position, color) VALUES
    (NEW.user_id, 'Backlog', 1, '#64748b'),
    (NEW.user_id, 'Em Progresso', 2, '#f59e0b'),
    (NEW.user_id, 'Concluído', 3, '#10b981'),
    (NEW.user_id, 'Ideias Futuras', 4, '#8b5cf6');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para criar colunas padrão
CREATE TRIGGER create_default_columns_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_columns_for_user();