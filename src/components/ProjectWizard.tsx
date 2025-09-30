import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { initialCardsData } from '@/lib/initial-data';

interface ProjectWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanGenerated: (cards: any[]) => void;
}

export const ProjectWizard = ({ open, onOpenChange, onPlanGenerated }: ProjectWizardProps) => {
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    // Simulação de chamada de IA. No futuro, o 'projectDescription' será enviado.
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Por enquanto, usamos os dados predefinidos para simular a resposta da IA.
    const aiGeneratedCards = initialCardsData;
    onPlanGenerated(aiGeneratedCards);
    
    setIsLoading(false);
    onOpenChange(false); // Fecha o diálogo
    setProjectDescription(''); // Limpa o campo de texto
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assistente de Projeto IA ✨</DialogTitle>
          <DialogDescription>
            Descreva sua ideia ou meta. A IA irá estruturar um plano de ação inicial para você no quadro Kanban.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Ex: Quero lançar um serviço de manutenção de computadores e marketing digital em Salvador em 3 meses, focando em pequenos negócios locais..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="min-h-[180px] text-base" // Altura aumentada
          />
            <p className="text-xs text-muted-foreground px-1">
              <strong>Nota:</strong> Atualmente, o assistente irá gerar um plano de negócios pré-definido. Em breve, o texto que você digitar aqui será usado por uma IA real para criar um plano totalmente personalizado.
            </p>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleGeneratePlan} 
            disabled={isLoading || !projectDescription}
            className="w-full"
          >
            {isLoading ? 'Gerando plano...' : 'Gerar Plano de Ação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
