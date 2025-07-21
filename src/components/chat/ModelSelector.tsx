import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GEMINI_MODELS } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GEMINI_MODELS.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}