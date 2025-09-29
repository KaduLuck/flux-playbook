import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card as TaskCard, CreateCardData, UpdateCardData } from '@/types';
import { useCards } from '@/hooks/useCards';
import { toast } from 'sonner';
import { Trash2, Save, Plus } from 'lucide-react';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: TaskCard | null;
  columnId?: string;
  onSuccess?: () => void;
}

const TaskDialog = ({ open, onOpenChange, card, columnId, onSuccess }: TaskDialogProps) => {
  const { createCard, updateCard, deleteCard, columns } = useCards();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [serviceType, setServiceType] = useState<'physical' | 'digital' | 'both'>('digital');
  const [points, setPoints] = useState([10]);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState([0]);
  const [selectedColumn, setSelectedColumn] = useState(columnId || '');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (card) {
        // Edit mode
        setTitle(card.title);
        setDescription(card.description || '');
        setPriority(card.priority);
        setServiceType(card.service_type);
        setPoints([card.points]);
        setEstimatedValue(card.estimated_value.toString());
        setDueDate(card.due_date || '');
        setProgress([card.progress]);
        setSelectedColumn(card.column_id);
      } else {
        // Create mode
        setTitle('');
        setDescription('');
        setPriority('medium');
        setServiceType('digital');
        setPoints([10]);
        setEstimatedValue('0');
        setDueDate('');
        setProgress([0]);
        setSelectedColumn(columnId || '');
      }
    }
  }, [open, card, columnId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setLoading(true);

    try {
      if (card) {
        // Update existing card
        const updateData: UpdateCardData = {
          id: card.id,
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          service_type: serviceType,
          points: points[0],
          estimated_value: parseFloat(estimatedValue) || 0,
          due_date: dueDate || undefined,
          progress: progress[0],
        };

        // If column changed, update it
        if (selectedColumn !== card.column_id) {
          updateData.column_id = selectedColumn;
        }

        const result = await updateCard(updateData);
        if (result?.error) {
          throw result.error;
        }
      } else {
        // Create new card
        if (!selectedColumn) {
          toast.error('Selecione uma coluna');
          return;
        }

        const createData: CreateCardData = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          service_type: serviceType,
          points: points[0],
          estimated_value: parseFloat(estimatedValue) || 0,
          due_date: dueDate || undefined,
          column_id: selectedColumn,
        };

        const result = await createCard(createData);
        if (result?.error) {
          throw result.error;
        }
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteCard(card.id);
      if (result?.error) {
        throw result.error;
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
          <DialogDescription>
            {card ? 'Atualize as informações da tarefa' : 'Crie uma nova tarefa para organizar seu trabalho'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Configurar N8N para automação de posts"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva os detalhes da tarefa..."
                rows={3}
              />
            </div>
          </div>

          {/* Priority & Service Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baixa</SelectItem>
                  <SelectItem value="medium">🟡 Média</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de Serviço</Label>
              <Select value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">🔧 Físico</SelectItem>
                  <SelectItem value="digital">💻 Digital</SelectItem>
                  <SelectItem value="both">⚡ Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Points & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pontos de XP: {points[0]}</Label>
              <Slider
                value={points}
                onValueChange={setPoints}
                max={100}
                min={1}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="estimatedValue">Valor Estimado (R$)</Label>
              <Input
                id="estimatedValue"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Progress & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {card && (
              <div>
                <Label>Progresso: {progress[0]}%</Label>
                <Slider
                  value={progress}
                  onValueChange={setProgress}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
              </div>
            )}

            <div className={card ? '' : 'col-span-2'}>
              <Label htmlFor="dueDate">Data de Entrega</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Column Selection */}
          <div>
            <Label>Coluna</Label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma coluna" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            {card && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? (
                'Salvando...'
              ) : (
                <>
                  {card ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {card ? 'Salvar' : 'Criar Tarefa'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;