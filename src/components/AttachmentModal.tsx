import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface AttachmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attachment: {
    file_name: string;
    storage_path: string;
    mime_type: string;
  } | null;
}

export default function AttachmentModal({ open, onOpenChange, attachment }: AttachmentModalProps) {
  if (!attachment) return null;

  const url = supabase.storage.from('attachments').getPublicUrl(attachment.storage_path).data.publicUrl;
  const isImage = attachment.mime_type.startsWith('image/');
  const isPdf = attachment.mime_type === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">{attachment.file_name}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-auto">
          {isImage && (
            <img src={url} alt={attachment.file_name} className="w-full h-auto rounded" />
          )}
          {isPdf && (
            <iframe src={url} className="w-full h-[70vh] rounded border-0" title={attachment.file_name} />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Visualização não disponível para este tipo de arquivo.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Baixar {attachment.file_name}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
