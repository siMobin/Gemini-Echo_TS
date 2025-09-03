import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GEMINI_MODELS, IMAGE_GENERATION_MODEL } from "@/lib/models";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-accent-foreground font-semibold">Model:</span>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-[100px] sm:w-[200px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GEMINI_MODELS.filter(model => model !== IMAGE_GENERATION_MODEL).map(model => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
