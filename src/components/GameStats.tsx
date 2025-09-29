import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useGameification } from '@/hooks/useGameification';

const GameStats = () => {
  const { profile } = useAuth();
  const { userAchievements, getNextLevelProgress } = useGameification();

  if (!profile) return null;

  const nextLevelProgress = getNextLevelProgress();
  const currentLevelXP = (profile.level - 1) * 1000;
  const nextLevelXP = profile.level * 1000;
  const currentProgress = profile.experience - currentLevelXP;
  const neededXP = nextLevelXP - profile.experience;

  return (
    <div className="space-y-4">
      {/* Level & XP Card */}
      <Card className="bg-gradient-primary text-white border-0 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Nível {profile.level}</h3>
                <p className="text-white/80 text-sm">{profile.total_points} pontos totais</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {currentProgress} / 1000 XP
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para o próximo nível</span>
              <span>{neededXP} XP restantes</span>
            </div>
            <Progress value={nextLevelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 text-center border-success/20 bg-success/5">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{userAchievements.length}</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center border-warning/20 bg-warning/5">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
              <Target className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{profile.experience}</p>
              <p className="text-xs text-muted-foreground">Experiência</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center border-info/20 bg-info/5">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-info">{profile.level}</p>
              <p className="text-xs text-muted-foreground">Nível</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 text-center border-primary/20 bg-primary/5">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{profile.total_points}</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameStats;