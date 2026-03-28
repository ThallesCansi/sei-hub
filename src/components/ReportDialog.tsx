import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const REASONS = [
  { value: 'spam', label: 'Spam', description: 'Conteúdo promocional ou repetitivo' },
  { value: 'assedio', label: 'Assédio', description: 'Comportamento abusivo ou intimidador' },
  { value: 'direitos_autorais', label: 'Direitos autorais', description: 'Conteúdo copiado sem permissão' },
  { value: 'desinformacao', label: 'Desinformação', description: 'Informações falsas ou enganosas' },
  { value: 'outros', label: 'Outros', description: 'Outro motivo não listado' },
] as const;

type ReportReason = typeof REASONS[number]['value'];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'post' | 'comment';
  targetId: string;
}

export default function ReportDialog({ open, onOpenChange, targetType, targetId }: ReportDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason>('outros');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      target_type: targetType,
      target_id: targetId,
      reporter_id: user.id,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erro ao enviar denúncia', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Denúncia enviada', description: 'Nossa equipe irá analisar sua denúncia.' });
      setReason('outros');
      setDetails('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Denunciar {targetType === 'post' ? 'postagem' : 'comentário'}</DialogTitle>
          <DialogDescription>
            Selecione o motivo da denúncia. Nossa equipe irá analisar o conteúdo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="font-medium">Motivo</Label>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as ReportReason)}>
              {REASONS.map(r => (
                <div key={r.value} className="flex items-start space-x-3 py-1">
                  <RadioGroupItem value={r.value} id={`reason-${r.value}`} className="mt-0.5" />
                  <label htmlFor={`reason-${r.value}`} className="cursor-pointer">
                    <p className="text-sm font-medium leading-none">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Detalhes (opcional)</Label>
            <Textarea
              id="report-details"
              placeholder="Descreva o problema com mais detalhes..."
              value={details}
              onChange={e => setDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar Denúncia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
